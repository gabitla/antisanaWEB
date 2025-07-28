import Plot from 'react-plotly.js';

export default function Chart({ data }) {
    return (
        <Plot
            data={[
                { x: data.x, y: data.y, type: 'scatter', mode: 'lines+markers' }
            ]}
            layout={{ title: 'Visualización IA' }}
        />
    );
}