import React, { useState } from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import LoadingSpinner from '../components/common/LoadingSpinner';

function Reportes() {
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const handleGenerateReport = () => {
    if (!endDate) {
      alert("Por favor, seleccione una fecha de fin.");
      return;
    }
    setLoading(true);
    setReportData(null); // Clear previous report

    // Simulate API call
    setTimeout(() => {
      // TODO: Replace with actual report generation logic
      const dummyData = {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        // ... other report data
      };
      setReportData(dummyData);
      setLoading(false);
    }, 2000);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        <h2>Generador de Reportes</h2>
        <p>Seleccione un rango de fechas para generar un reporte.</p>
        
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Fecha de Inicio</h5>
                <DateCalendar 
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)} 
                />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Fecha de Fin</h5>
                <DateCalendar 
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)} 
                  minDate={startDate} // Ensure end date is not before start date
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button className="btn btn-primary" onClick={handleGenerateReport} disabled={loading}>
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
        </div>

        {loading && <LoadingSpinner />}

        {reportData && !loading && (
          <div className="mt-4">
            <h3>Resultados del Reporte</h3>
            <pre>{JSON.stringify(reportData, null, 2)}</pre>
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
}

export default Reportes;