import React, { useState, useEffect } from "react";
import styled, { ThemeProvider } from "styled-components";
import theme from "./theme";
import UploadZone from "./UploadZone"; // Usa el UploadZone elegante y mejorado
import MapaSensores from "./MapaSensores";
import Dashboard from "./Dashboard";
import DashboardHeader from "./DashboardHeader";
import "./App.css";

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(120deg, #0a2342 0%, #185a9d 100%);
  padding-bottom: 40px;
`;

export default function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [sensores, setSensores] = useState([]);

  // Cargar GeoJSON sensores para mapa
  useEffect(() => {
    fetch("http://localhost:8000/sensores/geojson")
      .then(r => r.json())
      .then(geojson => {
        const features = JSON.parse(geojson).features || [];
        setSensores(features.map(f => ({
          ...f.properties,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0]
        })));
      });
  }, []);

  // Se actualiza el dashboard cuando se suben archivos (éxito)
  const handleUploadComplete = (data) => {
    setDashboardData(data);
    // Aquí puedes agregar toast/alert si lo deseas
  };

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <DashboardHeader />
        {/* Usa UploadZone elegante con barra de carga y feedback */}
        <UploadZone onUpload={handleUploadComplete} />
        <MapaSensores sensores={sensores} />
        <Dashboard data={dashboardData} sensores={sensores} />
      </AppContainer>
    </ThemeProvider>
  );
}