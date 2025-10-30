import React from 'react';
import ReactECharts from 'echarts-for-react';

const ProductivityGauge = ({ productivity }) => {
    const getOption = () => {
        return {
            title: {
                text: 'Índice de Productividad Promedio',
                left: 'center',
                bottom: 20,
            },
            series: [
                {
                    type: 'gauge',
                    center: ['50%', '50%'],
                    radius: '80%',
                    startAngle: 200,
                    endAngle: -20,
                    min: 0,
                    max: 100,
                    splitNumber: 5,
                    itemStyle: {
                        color: '#58D9F9',
                    },
                    progress: {
                        show: true,
                        width: 30,
                    },
                    pointer: {
                        show: false,
                    },
                    axisLine: {
                        lineStyle: {
                            width: 30,
                        },
                    },
                    axisTick: {
                        distance: -45,
                        splitNumber: 5,
                        lineStyle: {
                            width: 2,
                            color: '#999',
                        },
                    },
                    splitLine: {
                        distance: -52,
                        length: 14,
                        lineStyle: {
                            width: 3,
                            color: '#999',
                        },
                    },
                    axisLabel: {
                        distance: -20,
                        color: '#999',
                        fontSize: 18,
                    },
                    anchor: {
                        show: false,
                    },
                    title: {
                        show: false,
                    },
                    detail: {
                        valueAnimation: true,
                        width: '60%',
                        lineHeight: 40,
                        borderRadius: 8,
                        offsetCenter: [0, '70%'],
                        fontSize: 30,
                        fontWeight: 'bolder',
                        formatter: '{value} %',
                        color: 'auto',
                    },
                    data: [
                        {
                            value: productivity,
                        },
                    ],
                },
            ],
        };
    };

    return <ReactECharts option={getOption()} style={{ height: '400px' }} />;
};

export default ProductivityGauge;