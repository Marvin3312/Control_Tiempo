import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const getInitialDates = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return {
        inicio: formatDate(startDate),
        fin: formatDate(endDate)
    };
};

export const useDashboardData = () => {
    const [kpiData, setKpiData] = useState({
        totalHoras: 0,
        empleadosActivos: 0,
        proyectosActivos: 0,
        productividadPromedio: 0,
    });
    const [chartData, setChartData] = useState({
        evolucionHoras: [],
        horasPorCliente: [],
        horasPorEmpleado: [],
        productividadEmpleado: [],
        horasPorProyecto: [],
        vista_reporte_completo: [],
    });
    const [filterOptions, setFilterOptions] = useState({
        empleados: [],
        clientes: [],
        proyectos: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const initialDates = getInitialDates();
    const [fechaInicio, setFechaInicio] = useState(initialDates.inicio);
    const [fechaFin, setFechaFin] = useState(initialDates.fin);
    const [empleadoFiltroId, setEmpleadoFiltroId] = useState(null);
    const [clienteFiltroId, setClienteFiltroId] = useState(null);
    const [proyectoFiltroId, setProyectoFiltroId] = useState(null);

    const processRpcData = (reporteData) => {
        if (!reporteData) {
            return {
                evolucionHoras: [],
                horasPorCliente: [],
                horasPorEmpleado: [],
                productividadEmpleado: [],
                horasPorProyecto: [],
                vista_reporte_completo: [],
            };
        }

        const evolucionHorasMap = reporteData.reduce((acc, item) => {
            const date = item.fecha.split('T')[0];
            acc[date] = (acc[date] || 0) + item.horas;
            return acc;
        }, {});
        const evolucionHoras = Object.entries(evolucionHorasMap).map(([dia, total_horas]) => ({ dia, total_horas }));

        const horasPorClienteMap = reporteData.reduce((acc, item) => {
            const key = `${item.clienteid}-${item.proyectoid}`;
            if (!acc[key]) {
                acc[key] = {
                    nombrecliente: item.cliente,
                    nombreproyecto: item.proyecto,
                    total_horas: 0,
                };
            }
            acc[key].total_horas += item.horas;
            return acc;
        }, {});
        const horasPorCliente = Object.values(horasPorClienteMap);

        const horasPorEmpleadoMap = reporteData.reduce((acc, item) => {
            acc[item.empleado] = (acc[item.empleado] || 0) + item.horas;
            return acc;
        }, {});
        const horasPorEmpleado = Object.entries(horasPorEmpleadoMap).map(([nombrecompleto, total_horas]) => ({ nombrecompleto, total_horas }));

        const productividadEmpleadoMap = reporteData.reduce((acc, item) => {
            if (!acc[item.empleado]) {
                acc[item.empleado] = {
                    nombrecompleto: item.empleado,
                    horas_cargables: 0,
                    horas_no_cargables: 0,
                };
            }
            if (item.escargable) {
                acc[item.empleado].horas_cargables += item.horas;
            } else {
                acc[item.empleado].horas_no_cargables += item.horas;
            }
            return acc;
        }, {});
        const productividadEmpleado = Object.values(productividadEmpleadoMap);

        const horasPorProyectoMap = reporteData.reduce((acc, item) => {
            acc[item.proyecto] = (acc[item.proyecto] || 0) + item.horas;
            return acc;
        }, {});
        const horasPorProyecto = Object.entries(horasPorProyectoMap).map(([nombreproyecto, total_horas]) => ({ nombreproyecto, total_horas }));

        return {
            evolucionHoras,
            horasPorCliente,
            horasPorEmpleado,
            productividadEmpleado,
            horasPorProyecto,
            vista_reporte_completo: reporteData,
        };
    };

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch filter options if not already fetched
            if (filterOptions.empleados.length === 0) {
                const [empleadosRes, clientesRes, proyectosRes] = await Promise.all([
                    supabase.from('empleados').select('empleadoid, nombrecompleto'),
                    supabase.from('clientes').select('clienteid, nombrecliente'),
                    supabase.from('proyectos').select('proyectoid, nombreproyecto'),
                ]);

                setFilterOptions({
                    empleados: empleadosRes.data || [],
                    clientes: clientesRes.data || [],
                    proyectos: proyectosRes.data || [],
                });
            }

            // Call RPC with filters
            const rpcParams = {
                fecha_inicio: fechaInicio || null,
                fecha_fin: fechaFin || null,
                empleado_id_filtro: empleadoFiltroId ? parseInt(empleadoFiltroId) : null,
                cliente_id_filtro: clienteFiltroId ? parseInt(clienteFiltroId) : null,
                proyecto_id_filtro: proyectoFiltroId ? parseInt(proyectoFiltroId) : null
            };

            const { data: reporteData, error: reporteError } = await supabase.rpc('obtener_reporte_filtrado', rpcParams);

            if (reporteError) {
                throw new Error(`Error al cargar reporte: ${reporteError.message}`);
            }

            // Process data for charts and KPIs
            const processedData = processRpcData(reporteData);
            setChartData(processedData);

            const totalHoras = processedData.evolucionHoras.reduce((sum, item) => sum + item.total_horas, 0);
            const empleadosActivos = new Set(reporteData.map(item => item.empleadoid)).size;
            const proyectosActivos = new Set(reporteData.map(item => item.proyectoid)).size;
            
            const totalCargables = processedData.productividadEmpleado.reduce((sum, item) => sum + item.horas_cargables, 0);
            const totalNoCargables = processedData.productividadEmpleado.reduce((sum, item) => sum + item.horas_no_cargables, 0);
            const productividadPromedio = (totalCargables + totalNoCargables) > 0
                ? Math.round((totalCargables / (totalCargables + totalNoCargables)) * 100)
                : 0;

            setKpiData({
                totalHoras: Math.round(totalHoras),
                empleadosActivos,
                proyectosActivos,
                productividadPromedio,
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fechaInicio, fechaFin, empleadoFiltroId, clienteFiltroId, proyectoFiltroId, filterOptions.empleados.length]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    return { 
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
    };
};