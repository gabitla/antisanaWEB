import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, Bar } from "recharts";

export default function ImputeChart({ fechas, original, imputado, imputados_map, nombre_var, height = 220 }) {
  const data = fechas.map((fecha, idx) => ({
    fecha,
    original: original[idx],
    imputado: imputado[idx],
    faltante: imputados_map[idx] ? imputado[idx] : null
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid stroke="#e3f2fd"/>
        <XAxis dataKey="fecha" tick={{fontSize:11}} minTickGap={20}/>
        <YAxis tick={{fontSize:11}} />
        <Tooltip />
        <Legend verticalAlign="top" height={30}/>
        <Line type="monotone" dataKey="original" stroke="#1976d2" strokeWidth={2} dot={false} name="Original"/>
        <Line type="monotone" dataKey="imputado" stroke="#66bb6a" strokeWidth={2} dot={false} name="Imputado"/>
        <Bar dataKey="faltante" fill="#ff7043" name="Datos Faltantes/Imputados" barSize={4} />
      </LineChart>
    </ResponsiveContainer>
  );
}