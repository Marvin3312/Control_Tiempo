import React from 'react';
import ReactECharts from 'echarts-for-react';

const EmployeeHoursChart = ({ data }) => {
    const getOption = () => {
        // Sort by hours
        const sortedData = [...data].sort((a, b) => a.total_horas - b.total_horas);

        return {
            title: {
                text: `Total de Horas por Empleado`,
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            xAxis: { type: 'value' },
            yAxis: { type: 'category', data: sortedData.map(item => item.nombrecompleto) },
            series: [{
                name: 'Horas',
                type: 'bar',
                data: sortedData.map(item => item.total_horas)
            }],
            grid: { left: 150 }
        };
    };

    return (
        <>
            {data.length > 0 ? (
                <ReactECharts option={getOption()} style={{ height: '500px' }} />
            ) : (
                <p>No hay datos de horas por empleado para mostrar el gráfico.</p>
            )}
        </>
    );
};

export default EmployeeHoursChart;