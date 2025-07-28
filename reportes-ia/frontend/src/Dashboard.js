import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styled from "styled-components";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DashContainer = styled.div`
  margin: 2rem auto;
  background: #10335a;
  border-radius: 14px;
  max-width: 1000px;
  padding: 2rem;
  color: #fff;
`;

const StatCard = styled.div`
  background: #163e6b;
  border-radius: 8px;
  margin: 1rem 0;
  padding: 1rem 1.5rem;
`;

function getStats(data) {
  const stats = {};
  if (!data || !data.original || !data.imputed_map) return stats;
  const rows = data.original;
  const codes = rows.codigo || [];
  const imputados = data.imputed_map.valor || [];
  codes.forEach((code, idx) => {
    if (!stats[code]) stats[code] = { originales: 0, imputados: 0, faltantes: 0 };
    if (rows.valor[idx] == null) {
      stats[code].faltantes += 1;
    } else if (imputados[idx]) {
      stats[code].imputados += 1;
    } else {
      stats[code].originales += 1;
    }
  });
  return stats;
}

export default function Dashboard({ data, sensores }) {
  if (!data) {
    return (
      <div style={{ color: "#fff", textAlign: "center" }}>
        Sube archivos para ver el dashboard.
      </div>
    );
  }

  // 1. Mapa de sensores con líneas de distancia
  const markerPositions = sensores.map(s => [s.lat, s.lng]);
  const lines = [];
  for (let i = 0; i < markerPositions.length; i++) {
    for (let j = i + 1; j < markerPositions.length; j++) {
      lines.push([markerPositions[i], markerPositions[j]]);
    }
  }

  // 2. Datos para gráficas por sensor
  const columns = data.columns || [];
  const rows = data.original || {};
  const rowsImputed = data.imputed || {};
  if (!columns.length || !rows[columns[0]]) return <div>No hay datos para mostrar.</div>;
  const allCodes = [...new Set(rows.codigo)];
  const fechas = rows.fecha || [];

  // Organiza datos por sensor para las gráficas
  const sensorSeries = {};
  allCodes.forEach(code => {
    sensorSeries[code] = [];
  });
  for (let i = 0; i < fechas.length; i++) {
    const code = rows.codigo[i];
    sensorSeries[code].push({
      fecha: fechas[i],
      original: rows.valor[i],
      imputado: rowsImputed.valor[i],
      faltante: rows.valor[i] == null,
    });
  }

  // 3. Estadísticas
  const stats = getStats(data);

  return (
    <DashContainer>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Mapa de Sensores</h2>
      <MapContainer
        center={markerPositions[0] || [ -0.6, -78.2 ]}
        zoom={10}
        style={{ height: "350px", marginBottom: "2.5rem", borderRadius: "14px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markerPositions.map((pos, idx) => (
          <Marker key={idx} position={pos}>
            <Popup>
              <div>
                <b>{sensores[idx]?.nombre}</b>
                <br />
                ({pos[0].toFixed(4)}, {pos[1].toFixed(4)})
              </div>
            </Popup>
          </Marker>
        ))}
        {lines.map((line, idx) => (
          <Polyline key={idx} positions={line} color="#4f8dfd" opacity={0.45} />
        ))}
      </MapContainer>

      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Estadísticas por Sensor</h2>
      {Object.keys(stats).map(code => (
        <StatCard key={code}>
          <b>{code}</b>:&nbsp;
          <span style={{ color: "#97f2d6" }}>Originales</span>: {stats[code].originales},&nbsp;
          <span style={{ color: "#4f8dfd" }}>Imputados</span>: {stats[code].imputados},&nbsp;
          <span style={{ color: "#f2a397" }}>Faltantes</span>: {stats[code].faltantes}
        </StatCard>
      ))}

      <h2 style={{ textAlign: "center", margin: "2.5rem 0 1rem" }}>Gráficas por Sensor</h2>
      {allCodes.map(code => (
        <div key={code} style={{ marginBottom: "2.5rem", background: "#173e69", borderRadius: 8, padding: "1.3rem" }}>
          <h3 style={{ color: "#4f8dfd" }}>{code} - {sensores.find(s => s.codigo === code)?.nombre}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={sensorSeries[code]}>
              <XAxis dataKey="fecha" tick={{ fill: "#fff" }} />
              <YAxis tick={{ fill: "#fff" }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="original" name="Original" stroke="#97f2d6" dot={false} />
              <Line type="monotone" dataKey="imputado" name="Imputado (KNN)" stroke="#4f8dfd" dot={false} />
              <Line type="monotone" dataKey="faltante" name="Faltante" stroke="#f2a397" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </DashContainer>
  );
}