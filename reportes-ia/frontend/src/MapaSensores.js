import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styled from "styled-components";
import L from "leaflet";

const sensorIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [36, 36]
});

const MapWrapper = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 0 auto 2rem auto;
  border-radius: 1em;
  overflow: hidden;
  box-shadow: 0 6px 24px #1976d255;
  border: 2px solid #1976d2;
`;

export default function MapaSensores({ sensores }) {
  if (!sensores.length) return null;

  // Ecuador centroid
  const center = [-1.5, -78.1];

  // Polyline entre pares de sensores
  const lines = [];
  for (let i = 0; i < sensores.length; ++i) {
    for (let j = i + 1; j < sensores.length; ++j) {
      lines.push([
        [sensores[i].lat, sensores[i].lng],
        [sensores[j].lat, sensores[j].lng]
      ]);
    }
  }

  return (
    <MapWrapper>
      <MapContainer center={center} zoom={8} style={{ height: "350px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {lines.map((line, idx) => (
          <Polyline positions={line} color="#42a5f5" weight={3} key={idx} />
        ))}
        {sensores.map(sensor => (
          <Marker
            key={sensor.codigo}
            position={[sensor.lat, sensor.lng]}
            icon={sensorIcon}
          >
            <Popup>
              <b>{sensor.nombre}</b><br />
              Código: {sensor.codigo}<br />
              Tipo: {sensor.tipo}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </MapWrapper>
  );
}