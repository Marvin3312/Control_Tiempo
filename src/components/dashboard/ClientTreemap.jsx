import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const ClientTreemap = ({ data }) => {
    const getOption = () => {
        const clientMap = new Map();
        data.forEach(item => {
            if (!clientMap.has(item.nombrecliente)) {
                clientMap.set(item.nombrecliente, { name: item.nombrecliente, children: [] });
            }
            clientMap.get(item.nombrecliente).children.push({
                name: item.nombreproyecto,
                value: item.total_horas
            });
        });

        const treemapData = Array.from(clientMap.values());

        return {
            title: {
                text: 'Distribución de Tiempo por Cliente y Proyecto',
                left: 'center'
            },
            tooltip: {
                formatter: function (info) {
                    const treePathInfo = info.treePathInfo;
                    const treePath = [];
                    for (let i = 1; i < treePathInfo.length; i++) {
                        treePath.push(treePathInfo[i].name);
                    }
                    return [
                        '<div class="tooltip-title">' + echarts.format.encodeHTML(treePath.join('/')) + '</div>',
                        'Horas: ' + echarts.format.addCommas(info.value)
                    ].join('');
                }
            },
            series: [{
                type: 'treemap',
                visibleMin: 300,
                label: {
                    show: true,
                    formatter: '{b}'
                },
                upperLabel: {
                    show: true,
                    height: 30
                },
                itemStyle: {
                    borderColor: '#fff'
                },
                levels: [
                    {
                        itemStyle: {
                            borderColor: '#777',
                            borderWidth: 0,
                            gapWidth: 1
                        },
                        upperLabel: {
                            show: false
                        }
                    },
                    {
                        itemStyle: {
                            borderColor: '#555',
                            borderWidth: 5,
                            gapWidth: 1
                        },
                        emphasis: {
                            itemStyle: {
                                borderColor: '#ddd'
                            }
                        }
                    },
                    {
                        colorSaturation: [0.35, 0.5],
                        itemStyle: {
                            borderWidth: 5,
                            gapWidth: 1,
                            borderColorSaturation: 0.6
                        }
                    }
                ],
                data: treemapData
            }]
        };
    };

    return (
        <>
            {data.length > 0 ? (
                <ReactECharts option={getOption()} style={{ height: '500px' }} />
            ) : (
                <p>No hay datos de horas por cliente para mostrar el treemap.</p>
            )}
        </>
    );
};

export default ClientTreemap;