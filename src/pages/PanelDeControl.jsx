import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';

import KpiCard from '../components/dashboard/KpiCard';
import ProductivityGauge from '../components/dashboard/ProductivityGauge';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import ClientTreemap from '../components/dashboard/ClientTreemap';
import EmployeeHoursChart from '../components/dashboard/EmployeeHoursChart';
import ProductivityStackedBar from '../components/dashboard/ProductivityStackedBar';
import ProjectDonutChart from '../components/dashboard/ProjectDonutChart';

const PanelDeControl = () => {
    const { 
        kpiData, 
        chartData, 
        loading, 
        error, 
        fechaInicio, 
        setFechaInicio, 
        fechaFin, 
        setFechaFin,
        empleadoFiltroId,
        setEmpleadoFiltroId,
        clienteFiltroId,
        setClienteFiltroId,
        proyectoFiltroId,
        setProyectoFiltroId,
        filterOptions,
    } = useDashboardData();

    // --- CSV Download Function ---
    const downloadCsv = (dataToDownload, filename = 'export.csv') => {
        if (!dataToDownload || dataToDownload.length === 0) {
        alert('No hay datos para descargar.');
        return;
        }
        const escapeCsvValue = (value) => {
        if (value == null) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
        };
        const headers = Object.keys(dataToDownload[0]);
        const csvRows = [];
        csvRows.push(headers.map(escapeCsvValue).join(','));
        for (const row of dataToDownload) {
        const values = headers.map(header => escapeCsvValue(row[header]));
        csvRows.push(values.join(','));
        }
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px' }}>Cargando datos del Panel de Control... ⏳</div>;
    }

    if (error) {
        return <div style={{ padding: '20px' }}>❌ Error al cargar datos: {error} <br/> Por favor, revisa la consola del navegador (F12) y asegúrate de haber creado las nuevas vistas en Supabase.</div>;
    }

    return (
        <div style={{ padding: '20px', background: '#f0f2f5' }}>
            <h1>Panel de Control Profesional</h1>

            {/* Filter Section */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                <h2>Filtros y Reportes</h2>
                
                {/* Date Filters */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                        <label>Desde: </label>
                        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                    </div>
                    <div>
                        <label>Hasta: </label>
                        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                    </div>
                </div>

                {/* Dropdown Filters */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <label>Empleado: </label>
                        <select value={empleadoFiltroId || ''} onChange={(e) => setEmpleadoFiltroId(e.target.value || null)}>
                            <option value="">Todos</option>
                            {filterOptions.empleados.map(e => <option key={e.empleadoid} value={e.empleadoid}>{e.nombrecompleto}</option>)}
                        </select>
                    </div>

                    <div>
                        <label>Cliente: </label>
                        <select value={clienteFiltroId || ''} onChange={(e) => setClienteFiltroId(e.target.value || null)}>
                            <option value="">Todos</option>
                            {filterOptions.clientes.map(c => <option key={c.clienteid} value={c.clienteid}>{c.nombrecliente}</option>)}
                        </select>
                    </div>

                    <div>
                        <label>Proyecto: </label>
                        <select value={proyectoFiltroId || ''} onChange={(e) => setProyectoFiltroId(e.target.value || null)}>
                            <option value="">Todos</option>
                            {filterOptions.proyectos.map(p => <option key={p.proyectoid} value={p.proyectoid}>{p.nombreproyecto}</option>)}
                        </select>
                    </div>
                </div>

                {/* Download Button */}
                <button 
                    onClick={() => downloadCsv(chartData.vista_reporte_completo, `reporte_filtrado.csv`)}
                    disabled={!chartData.vista_reporte_completo || chartData.vista_reporte_completo.length === 0}
                >
                    Descargar CSV 📄
                </button>
            </div>

            {/* KPI Cards Section */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
                <KpiCard title="Total Horas Registradas" value={kpiData.totalHoras} icon="⏱️" />
                <KpiCard title="Empleados Activos" value={kpiData.empleadosActivos} icon="👥" />
                <KpiCard title="Proyectos Activos" value={kpiData.proyectosActivos} icon="💼" />
                <KpiCard title="% Productividad Promedio" value={`${kpiData.productividadPromedio}%`} icon="🎯" />
            </div>

            {/* Top Row Charts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: '1 1 300px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <ProductivityGauge productivity={kpiData.productividadPromedio} />
                </div>
                
                <div style={{ flex: '1 1 60%', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <ActivityHeatmap data={chartData.evolucionHoras} />
                </div>
            </div>

            {/* Middle Row Chart (Treemap) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: '1 1 100%', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <ClientTreemap data={chartData.horasPorCliente} />
                </div>
            </div>

            {/* Bottom Row Chart (Horas por Empleado) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: '1 1 100%', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <EmployeeHoursChart data={chartData.horasPorEmpleado} />
                </div>
            </div>

            {/* New Row Chart (Productividad) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' , marginBottom: '20px'}}>
                <div style={{ flex: '1 1 100%', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <ProductivityStackedBar data={chartData.productividadEmpleado} />
                </div>
            </div>

            {/* Last Row Chart (Horas por Proyecto) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 100%', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <ProjectDonutChart data={chartData.horasPorProyecto} />
                </div>
            </div>
        </div>
    );
};

export default PanelDeControl;