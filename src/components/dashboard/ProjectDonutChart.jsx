import React from 'react';
import ReactECharts from 'echarts-for-react';

const ProjectDonutChart = ({ data }) => {
    const getOption = () => {
        return {
            title: {
                text: 'Distribución de Horas por Proyecto',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} horas ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
            },
            series: [
                {
                    name: 'Horas por Proyecto',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '20',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: data.map(item => ({
                        name: item.nombreproyecto,
                        value: item.total_horas
                    }))
                }
            ]
        };
    };

    return (
        <>
            {data.length > 0 ? (
                <ReactECharts option={getOption()} style={{ height: '500px' }} />
            ) : (
                <p>No hay datos de horas por proyecto para mostrar el gráfico.</p>
            )}
        </>
    );
};

export default ProjectDonutChart;