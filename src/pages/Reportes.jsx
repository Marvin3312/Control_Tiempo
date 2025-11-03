import React, { useState } from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

function Reportes() {
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(null);

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
          <button className="btn btn-primary">Generar Reporte</button>
        </div>

        {/* TODO: Display report results here */}
      </div>
    </LocalizationProvider>
  );
}

export default Reportes;