import React from 'react';
import ReactECharts from 'echarts-for-react';

const ProductivityStackedBar = ({ data }) => {
    const getOption = () => {
        const sortedData = [...data].sort((a, b) => (a.horas_cargables + a.horas_no_cargables) - (b.horas_cargables + b.horas_no_cargables));

        return {
            title: {
                text: 'Productividad por Empleado (Horas Cargables vs. No Cargables)',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            legend: {
                top: 30
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: { type: 'value' },
            yAxis: {
                type: 'category',
                data: sortedData.map(item => item.nombrecompleto)
            },
            series: [
                {
                    name: 'Horas Cargables',
                    type: 'bar',
                    stack: 'total',
                    label: { show: true },
                    emphasis: { focus: 'series' },
                    data: sortedData.map(item => item.horas_cargables)
                },
                {
                    name: 'Horas No Cargables',
                    type: 'bar',
                    stack: 'total',
                    label: { show: true },
                    emphasis: { focus: 'series' },
                    data: sortedData.map(item => item.horas_no_cargables)
                }
            ]
        };
    };

    return (
        <>
            {data.length > 0 ? (
                <ReactECharts option={getOption()} style={{ height: '500px' }} />
            ) : (
                <p>No hay datos de productividad para mostrar el gráfico.</p>
            )}
        </>
    );
};

export default ProductivityStackedBar;