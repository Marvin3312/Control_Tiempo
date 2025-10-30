import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const ActivityHeatmap = ({ data }) => {
    const getOption = () => {
        const calendarData = data.map(item => [
            echarts.format.formatTime('yyyy-MM-dd', item.dia),
            item.total_horas
        ]);

        const year = calendarData.length > 0 ? calendarData[0][0].substring(0, 4) : new Date().getFullYear();

        return {
            title: {
                top: 30,
                left: 'center',
                text: 'Mapa de Calor de Actividad Diaria'
            },
            tooltip: {
                position: 'top',
                formatter: function (p) {
                    return `${p.data[0]}: ${p.data[1]} horas`;
                }
            },
            visualMap: {
                min: 0,
                max: Math.max(...calendarData.map(d => d[1])),
                type: 'piecewise',
                orient: 'horizontal',
                left: 'center',
                top: 65,
                textStyle: {
                    color: '#000'
                }
            },
            calendar: {
                top: 120,
                left: 30,
                right: 30,
                cellSize: ['auto', 13],
                range: year,
                itemStyle: {
                    borderWidth: 0.5
                },
                yearLabel: { show: false }
            },
            series: {
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: calendarData
            }
        };
    };

    return (
        <>
            {data.length > 0 ? (
                <ReactECharts option={getOption()} style={{ height: '400px' }} />
            ) : (
                <p>No hay datos de evolución de horas para mostrar el mapa de calor.</p>
            )}
        </>
    );
};

export default ActivityHeatmap;