from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from io import StringIO, BytesIO
from sklearn.impute import KNNImputer
import os
from typing import List, Union

# Geodatos y visualización
import geopandas as gpd
from shapely.geometry import Point
import matplotlib.pyplot as plt
from fastapi.responses import JSONResponse
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- METADATA HARDCODEADA DE LOS SENSORES ---
SENSORES_METADATA = [
    {
        "codigo": "P43",
        "nombre": "Antisana Limboasi",
        "tipo": "Pluviométrica",
        "latitud": -0.5934839659614135,
        "longitud": -78.20825370752031
    },
    {
        "codigo": "P42",
        "nombre": "Antisana Ramón Huañuna",
        "tipo": "Pluviométrica",
        "latitud": -0.6022867145410288,
        "longitud": -78.1986689291808
    },
    {
        "codigo": "P55",
        "nombre": "Antisana Diguchi",
        "tipo": "Pluviométrica",
        "latitud": -0.5731364867736277,
        "longitud": -78.262844542214
    }
]

def cargar_metadata():
    return pd.DataFrame(SENSORES_METADATA)

def dataframe_to_jsondict(df: pd.DataFrame):
    df_clean = df.replace([np.inf, -np.inf], np.nan).astype(object)
    df_clean = df_clean.where(pd.notnull(df_clean), None)
    return df_clean.to_dict(orient='list')

def normalizar_dataframe(df: pd.DataFrame, filename: str) -> pd.DataFrame:
    """
    Convierte cualquier formato (por archivo o matriz) a formato largo estándar: fecha, codigo, valor
    """
    df = df.copy()
    df.columns = [str(col).strip().lower() for col in df.columns]  # Normaliza nombres
    # CASO 1: Matriz tipo Fecha,P42,P43,P55...
    if 'fecha' in df.columns and any(col.startswith('p') for col in df.columns if col != 'fecha'):
        # Transforma a formato largo
        df_long = df.melt(id_vars=['fecha'], var_name='codigo', value_name='valor')
        # Elimina filas vacías
        df_long = df_long.dropna(subset=['valor'])
        return df_long
    # CASO 2: Archivo por sensor, sin columna codigo, pero sí columna valor
    elif 'valor' in df.columns and 'codigo' not in df.columns:
        # Extrae el código del nombre del archivo (ej: P42.csv)
        codigo = os.path.splitext(os.path.basename(filename))[0].upper()
        df['codigo'] = codigo
        return df[['fecha', 'codigo', 'valor']]
    # CASO 3: Ya tiene columna codigo
    elif 'codigo' in df.columns and 'valor' in df.columns:
        return df[['fecha', 'codigo', 'valor']]
    else:
        raise ValueError("El archivo no tiene un formato reconocido. Debe tener columnas tipo 'fecha,valor' o 'Fecha,P42,...'.")

@app.post("/upload/")
async def upload(file: Union[List[UploadFile], UploadFile] = File(...)):
    files = file if isinstance(file, list) else [file]
    dataframes = []
    errores = []
    for f in files:
        contents = await f.read()
        try:
            df = pd.read_csv(StringIO(contents.decode('utf-8')))
        except Exception:
            try:
                df = pd.read_csv(StringIO(contents.decode('utf-8')), sep='\t')
            except Exception as ex:
                errores.append(f"{f.filename}: No se pudo leer el archivo ({str(ex)})")
                continue
        try:
            df_n = normalizar_dataframe(df, f.filename)
            dataframes.append(df_n)
        except Exception as ex:
            errores.append(f"{f.filename}: {str(ex)}")

    if len(dataframes) == 0:
        return {"error": "No se subieron archivos válidos. Detalles: " + "; ".join(errores)}

    df = pd.concat(dataframes, ignore_index=True)

    # Detecta columnas numéricas (solo 'valor' en este flujo)
    numeric_cols = ['valor']

    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    cols_to_impute = [col for col in numeric_cols if df[col].isnull().any()]
    imputed_df = df.copy()
    imputados_map = {}

    if cols_to_impute:
        imputer = KNNImputer(n_neighbors=2)
        imputed_values = imputer.fit_transform(df[numeric_cols])
        imputed_df[numeric_cols] = imputed_values
        for col in numeric_cols:
            imputados_map[col] = (df[col].isna() & pd.notna(imputed_df[col])).tolist()
    else:
        for col in numeric_cols:
            imputados_map[col] = [False] * len(df)

    # Une la metadata hardcodeada por codigo
    metadata = cargar_metadata()
    df_merged = df.merge(metadata, on='codigo', how='left')
    imputed_df_merged = imputed_df.merge(metadata, on='codigo', how='left')

    return {
        "original": dataframe_to_jsondict(df_merged),
        "imputed": dataframe_to_jsondict(imputed_df_merged),
        "columns": list(df_merged.columns),
        "numeric_cols": numeric_cols,
        "imputed_map": imputados_map,
        "imputed_csv": imputed_df_merged.to_csv(index=False),
        "errores": errores
    }

@app.get("/sensores/geojson")
def sensores_geojson():
    metadata = cargar_metadata()
    gdf = gpd.GeoDataFrame(
        metadata,
        geometry=[Point(xy) for xy in zip(metadata.longitud, metadata.latitud)],
        crs="EPSG:4326"
    )
    return JSONResponse(content=gdf.to_json())

@app.get("/correlacion")
def correlacion_series():
    DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
    path = os.path.join(DATA_DIR, 'series_tiempo.csv')
    try:
        series = pd.read_csv(path)
    except Exception as e:
        return {"error": "No se pudo cargar el archivo de series_tiempo.csv", "detalle": str(e)}

    if 'fecha' not in series.columns or 'codigo' not in series.columns or 'valor' not in series.columns:
        return {"error": "El archivo series_tiempo.csv debe tener columnas: fecha, codigo, valor"}

    pivot = series.pivot(index='fecha', columns='codigo', values='valor')
    correl = pivot.corr()
    return correl.to_dict()

@app.get("/mapa_sensores")
def mapa_sensores():
    metadata = cargar_metadata()
    fig, ax = plt.subplots()
    ax.scatter(metadata.longitud, metadata.latitud, c='blue', marker='o')
    for i, row in metadata.iterrows():
        ax.text(row['longitud'], row['latitud'], row['nombre'], fontsize=8)
    ax.set_xlabel('Longitud')
    ax.set_ylabel('Latitud')
    ax.set_title('Ubicación de Sensores')
    buf = BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    img_b64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return {"image_base64": img_b64}