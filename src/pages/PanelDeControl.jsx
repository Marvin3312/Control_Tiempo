import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';

import KpiCard from '../components/dashboard/KpiCard';
import ProductivityGauge from '../components/dashboard/ProductivityGauge';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import ClientTreemap from '../components/dashboard/ClientTreemap';
import EmployeeHoursChart from '../components/dashboard/EmployeeHoursChart';
import ProductivityStackedBar from '../components/dashboard/ProductivityStackedBar';
import ProjectDonutChart from '../components/dashboard/ProjectDonutChart';

registerLocale('es', es);

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
        <div className="container-fluid p-3" style={{ background: '#f0f2f5' }}>
            <h1 className="h2 mb-4">Panel de Control Profesional</h1>

            {/* Filter Section */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h2 className="h5 card-title">Filtros y Reportes</h2>
                    <div className="row g-3 align-items-center">
                        {/* Date Filters */}
                        <div className="col-12 col-sm-6 col-md-3">
                            <label htmlFor="fechaInicio" className="form-label">Desde:</label>
                            <DatePicker
                                selected={fechaInicio ? new Date(fechaInicio) : null}
                                onChange={(date) => setFechaInicio(date ? date.toISOString().split('T')[0] : '')}
                                dateFormat="dd/MM/yyyy"
                                locale="es"
                                className="form-control"
                                id="fechaInicio"
                            />
                        </div>
                        <div className="col-12 col-sm-6 col-md-3">
                            <label htmlFor="fechaFin" className="form-label">Hasta:</label>
                            <DatePicker
                                selected={fechaFin ? new Date(fechaFin) : null}
                                onChange={(date) => setFechaFin(date ? date.toISOString().split('T')[0] : '')}
                                dateFormat="dd/MM/yyyy"
                                locale="es"
                                className="form-control"
                                id="fechaFin"
                            />
                        </div>

                        {/* Dropdown Filters */}
                        <div className="col-12 col-sm-6 col-md-2">
                            <label htmlFor="empleadoFiltro" className="form-label">Empleado:</label>
                            <select id="empleadoFiltro" className="form-select" value={empleadoFiltroId || ''} onChange={(e) => setEmpleadoFiltroId(e.target.value || null)}>
                                <option value="">Todos</option>
                                {filterOptions.empleados.map(e => <option key={e.empleadoid} value={e.empleadoid}>{e.nombrecompleto}</option>)}
                            </select>
                        </div>
                        <div className="col-12 col-sm-6 col-md-2">
                            <label htmlFor="clienteFiltro" className="form-label">Cliente:</label>
                            <select id="clienteFiltro" className="form-select" value={clienteFiltroId || ''} onChange={(e) => setClienteFiltroId(e.target.value || null)}>
                                <option value="">Todos</option>
                                {filterOptions.clientes.map(c => <option key={c.clienteid} value={c.clienteid}>{c.nombrecliente}</option>)}
                            </select>
                        </div>
                        <div className="col-12 col-sm-6 col-md-2">
                            <label htmlFor="proyectoFiltro" className="form-label">Proyecto:</label>
                            <select id="proyectoFiltro" className="form-select" value={proyectoFiltroId || ''} onChange={(e) => setProyectoFiltroId(e.target.value || null)}>
                                <option value="">Todos</option>
                                {filterOptions.proyectos.map(p => <option key={p.proyectoid} value={p.proyectoid}>{p.nombreproyecto}</option>)}
                            </select>
                        </div>

                        {/* Download Button */}
                        <div className="col-12 col-md-auto align-self-end">
                            <button 
                                className="btn btn-primary w-100"
                                onClick={() => downloadCsv(chartData.vista_reporte_completo, `reporte_filtrado.csv`)}
                                disabled={!chartData.vista_reporte_completo || chartData.vista_reporte_completo.length === 0}
                            >
                                Descargar CSV 📄
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards Section */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                    <KpiCard title="Total Horas Registradas" value={kpiData.totalHoras} icon="⏱️" />
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                    <KpiCard title="Empleados Activos" value={kpiData.empleadosActivos} icon="👥" />
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                    <KpiCard title="Proyectos Activos" value={kpiData.proyectosActivos} icon="💼" />
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                    <KpiCard title="% Productividad Promedio" value={`${kpiData.productividadPromedio}%`} icon="🎯" />
                </div>
            </div>

            {/* Charts Section */}
            <div className="row g-4">
                {/* Top Row Charts */}
                <div className="col-12 col-lg-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <ProductivityGauge productivity={kpiData.productividadPromedio} />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-8">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <ActivityHeatmap data={chartData.evolucionHoras} />
                        </div>
                    </div>
                </div>

                {/* Middle Row Chart (Treemap) */}
                <div className="col-12">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <ClientTreemap data={chartData.horasPorCliente} />
                        </div>
                    </div>
                </div>

                {/* Bottom Row Chart (Horas por Empleado) */}
                <div className="col-12">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <EmployeeHoursChart data={chartData.horasPorEmpleado} />
                        </div>
                    </div>
                </div>

                {/* New Row Chart (Productividad) */}
                <div className="col-12">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <ProductivityStackedBar data={chartData.productividadEmpleado} />
                        </div>
                    </div>
                </div>

                {/* Last Row Chart (Horas por Proyecto) */}
                <div className="col-12">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <ProjectDonutChart data={chartData.horasPorProyecto} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PanelDeControl;