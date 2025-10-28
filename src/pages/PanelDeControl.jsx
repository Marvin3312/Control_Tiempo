import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Make sure this path is correct
import ReactECharts from 'echarts-for-react';

const PanelDeControl = () => {
  // State to hold data from all views
  const [data, setData] = useState({
    vista_gerente_horas_cargables: null,
    vista_gerente_horas_empleado_proyecto: null,
    vista_gerente_horas_no_cargables: null,
    vista_perfil_empleado: null, // Keep for potential future use or context
    vista_reporte_completo: null, // Keep for potential future use or context
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from all specified views when the component mounts
  useEffect(() => {
    const fetchAllViewsData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error on new fetch
        const viewsToFetch = [
          'vista_gerente_horas_cargables',
          'vista_gerente_horas_empleado_proyecto',
          'vista_gerente_horas_no_cargables',
          'vista_perfil_empleado', // You might not need this for the charts
          'vista_reporte_completo', // You might use this for CSV export later
        ];

        const fetchedData = {};
        for (const viewName of viewsToFetch) {
          console.log(`Fetching data for ${viewName}...`); // Log start of fetch
          const { data: viewData, error: viewError } = await supabase
            .from(viewName)
            .select('*');

          if (viewError) {
            console.error(`Error fetching ${viewName}:`, viewError); // Log specific error
            // Use Supabase error details if available
            throw new Error(`Error fetching ${viewName}: ${viewError.message} (Details: ${viewError.details || 'N/A'})`);
          }
          fetchedData[viewName] = viewData;
          console.log(`Data successfully fetched for ${viewName}:`, viewData); // Log successful fetch
        }
        setData(fetchedData); // Update state with all fetched data
      } catch (err) {
        console.error("Caught error during fetch:", err); // Log caught error
        setError(err.message); // Set error message for display
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };

    fetchAllViewsData();
  }, []); // Empty dependency array means run once on mount

  // --- Chart Option Generators ---

  // Chart options for vista_gerente_horas_cargables
  const getHorasCargablesOption = () => {
    if (!data.vista_gerente_horas_cargables) return {};

    // **FIX:** Use correct column names from the VIEW
    // The VIEW groups by empleado, cliente, proyecto. Let's group just by employee for simplicity here.
    const employeeHours = {};
    data.vista_gerente_horas_cargables.forEach(item => {
      const employeeName = item.empleado || 'Desconocido';
      // **FIX:** Use 'horas_cargables' column name
      employeeHours[employeeName] = (employeeHours[employeeName] || 0) + (parseFloat(item.horas_cargables) || 0);
    });

    const names = Object.keys(employeeHours);
    const horas = Object.values(employeeHours);

    return {
      title: { text: 'Horas Cargables por Empleado' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: names, axisLabel: { interval: 0, rotate: 30 } }, // Rotate labels if names are long
      yAxis: { type: 'value' },
      series: [{ name: 'Horas Cargables', type: 'bar', data: horas }],
      grid: { bottom: 100 } // Add padding for rotated labels
    };
  };

  // Chart options for vista_gerente_horas_empleado_proyecto (Total Hours per Employee)
  const getHorasEmpleadoProyectoOption = () => {
    if (!data.vista_gerente_horas_empleado_proyecto) return {};

    // This view already aggregates by employee, client, project.
    // Let's aggregate further just by employee for the chart.
    const employeeHours = {};
    data.vista_gerente_horas_empleado_proyecto.forEach(item => {
      const employeeName = item.empleado || 'Desconocido';
      // **FIX:** Use 'horas_totales' column name
      employeeHours[employeeName] = (employeeHours[employeeName] || 0) + (parseFloat(item.horas_totales) || 0);
    });

    const names = Object.keys(employeeHours);
    const horas = Object.values(employeeHours);

    return {
      title: { text: 'Horas Totales por Empleado' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: names, axisLabel: { interval: 0, rotate: 30 } },
      yAxis: { type: 'value' },
      series: [{ name: 'Horas Totales', type: 'bar', data: horas }],
      grid: { bottom: 100 }
    };
  };

  // Chart options for vista_gerente_horas_no_cargables
  const getHorasNoCargablesOption = () => {
    if (!data.vista_gerente_horas_no_cargables) return {};

    // Aggregate by employee
     const employeeHours = {};
    data.vista_gerente_horas_no_cargables.forEach(item => {
      const employeeName = item.empleado || 'Desconocido';
      // **FIX:** Use 'horas_no_cargables' column name
      employeeHours[employeeName] = (employeeHours[employeeName] || 0) + (parseFloat(item.horas_no_cargables) || 0);
    });

    const names = Object.keys(employeeHours);
    const horas = Object.values(employeeHours);

    return {
      title: { text: 'Horas No Cargables por Empleado' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: names, axisLabel: { interval: 0, rotate: 30 } },
      yAxis: { type: 'value' },
      series: [{ name: 'Horas No Cargables', type: 'bar', data: horas }],
      grid: { bottom: 100 }
    };
  };


  // --- CSV Download Function (Completed) ---
  const downloadCsv = (dataToDownload, filename = 'export.csv') => {
    if (!dataToDownload || dataToDownload.length === 0) {
      alert('No hay datos para descargar.');
      return;
    }

    // Function to escape CSV values (handles commas and quotes)
    const escapeCsvValue = (value) => {
      if (value == null) return ''; // Handle null/undefined
      const stringValue = String(value);
      // If value contains comma, newline or quote, wrap it in double quotes and escape existing quotes
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const headers = Object.keys(dataToDownload[0]);
    const csvRows = [];
    csvRows.push(headers.map(escapeCsvValue).join(',')); // Add escaped headers

    // Add escaped row values
    for (const row of dataToDownload) {
      const values = headers.map(header => escapeCsvValue(row[header]));
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };


  // --- Render ---

  if (loading) {
    return <div>Cargando datos del Panel de Control... ⏳</div>;
  }

  if (error) {
    // Provide more context in error message
    return <div>❌ Error al cargar datos: {error} <br/> Por favor, revisa la consola del navegador para más detalles (F12).</div>;
  }

  // Check if specific data arrays are available before rendering charts/buttons
  const hasCargablesData = data.vista_gerente_horas_cargables && data.vista_gerente_horas_cargables.length > 0;
  const hasEmpleadoProyectoData = data.vista_gerente_horas_empleado_proyecto && data.vista_gerente_horas_empleado_proyecto.length > 0;
  const hasNoCargablesData = data.vista_gerente_horas_no_cargables && data.vista_gerente_horas_no_cargables.length > 0;
  const hasReporteCompletoData = data.vista_reporte_completo && data.vista_reporte_completo.length > 0;


  return (
    <div style={{ padding: '20px' }}>
      <h1>Panel de Control</h1>

      {/* Section for Charts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
        {hasCargablesData ? (
          <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
            <ReactECharts option={getHorasCargablesOption()} />
            <button onClick={() => downloadCsv(data.vista_gerente_horas_cargables, 'horas_cargables.csv')}>
              Descargar CSV (Cargables)
            </button>
          </div>
        ) : <p>No hay datos de horas cargables para mostrar.</p>}

        {hasEmpleadoProyectoData ? (
          <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
            <ReactECharts option={getHorasEmpleadoProyectoOption()} />
             <button onClick={() => downloadCsv(data.vista_gerente_horas_empleado_proyecto, 'horas_empleado_proyecto.csv')}>
              Descargar CSV (Empleado-Proyecto)
            </button>
          </div>
        ) : <p>No hay datos de horas por empleado/proyecto para mostrar.</p>}

        {hasNoCargablesData ? (
          <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
            <ReactECharts option={getHorasNoCargablesOption()} />
             <button onClick={() => downloadCsv(data.vista_gerente_horas_no_cargables, 'horas_no_cargables.csv')}>
              Descargar CSV (No Cargables)
            </button>
          </div>
        ) : <p>No hay datos de horas no cargables para mostrar.</p>}
      </div>

       {/* Section for Full Report Download */}
       <h2>Reporte Completo</h2>
        {hasReporteCompletoData ? (
          <button onClick={() => downloadCsv(data.vista_reporte_completo, 'reporte_completo.csv')}>
              Descargar Reporte Completo (CSV) 📄
          </button>
        ) : <p>No hay datos disponibles para el reporte completo.</p>}

      {/* Example: Displaying Perfil Empleado Table (Optional) */}
      {/*
      <h2>Perfil Empleado (Datos de Ejemplo)</h2>
      {data.vista_perfil_empleado && data.vista_perfil_empleado.length > 0
        ? renderPerfilEmpleadoTable() // You'd need to implement this function
        : <p>No hay datos de perfil de empleado.</p>
      }
      */}

    </div>
  );
};

export default PanelDeControl;