import React from "react";
import ImputeChart from "./ImputeChart";
import styled from "styled-components";

const Card = styled.div`
  background: rgba(255,255,255,0.97);
  border-radius: 20px;
  box-shadow: 0 4px 24px #1976d255;
  padding: 1.7rem 1.3rem;
  min-width: 340px;
  max-width: 410px;
  margin-bottom: 2rem;
  transition: box-shadow 0.2s;
  &:hover { box-shadow: 0 8px 32px #1976d277; }
`;

const Title = styled.h3`
  color: #1976d2;
  margin-bottom: 0.45rem;
  font-weight: bold;
`;

const StatRow = styled.div`
  display: flex;
  gap: 18px;
  font-size: 0.97rem;
  margin: 0.7rem 0 1.1rem 0;
  color: #1976d2;
`;

function getSensorData(sensor, data) {
  // Encuentra los índices de las filas de este sensor
  const codeArr = data.original.codigo || [];
  const idxs = codeArr.map((code, idx) => code === sensor.codigo ? idx : null).filter(idx => idx !== null);

  if (!idxs.length) return null;

  const fechas = (data.original.fecha || data.original[data.columns[0]]).filter((_, i) => idxs.includes(i));
  const original = data.numeric_cols.map(col => idxs.map(idx => data.original[col][idx]));
  const imputado = data.numeric_cols.map(col => idxs.map(idx => data.imputed[col][idx]));
  const imputados_map = data.numeric_cols.map(col => idxs.map(idx => data.imputed_map[col][idx]));

  return { fechas, original, imputado, imputados_map };
}

export default function SensorCard({ sensor, data }) {
  const sensorData = getSensorData(sensor, data);

  if (!sensorData) return null;

  // Estadísticas
  let total = sensorData.fechas.length;
  let imputadosTot = 0, faltantesTot = 0, originalesTot = 0;
  sensorData.imputados_map[0].forEach(imputado => {
    if (imputado) imputadosTot++;
  });
  originalesTot = total - imputadosTot;

  return (
    <Card>
      <Title>{sensor.nombre}</Title>
      <div style={{ fontSize: 14, color: "#1976d2" }}>
        Código: {sensor.codigo} | Tipo: {sensor.tipo}
      </div>
      <StatRow>
        <div>Datos Originales: <b>{originalesTot}</b></div>
        <div>Imputados: <b>{imputadosTot}</b></div>
        <div>Total: <b>{total}</b></div>
      </StatRow>
      {/* Muestra la gráfica para la primer variable numérica */}
      <ImputeChart
        fechas={sensorData.fechas}
        original={sensorData.original[0]}
        imputado={sensorData.imputado[0]}
        imputados_map={sensorData.imputados_map[0]}
        nombre_var={data.numeric_cols[0]}
        height={190}
      />
    </Card>
  );
}