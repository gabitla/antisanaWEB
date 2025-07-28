import React from "react";

export default function DownloadCSV({ columnas, imputado }) {
  const makeCSV = () => {
    let csv = columnas.join(",") + "\n";
    const len = imputado[columnas[0]].length;
    for (let i = 0; i < len; i++) {
      let row = columnas.map(col =>
        imputado[col][i] !== null && imputado[col][i] !== undefined
          ? `"${imputado[col][i]}"`
          : ""
      );
      csv += row.join(",") + "\n";
    }
    return csv;
  };

  const download = () => {
    const blob = new Blob([makeCSV()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "datos_imputados.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return <button onClick={download} style={{marginLeft: 16}}>Descargar CSV imputado</button>;
}