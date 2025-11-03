
import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';

registerLocale('es', es);

export function FormHeader({ form, setForm, isSaving }) {
  const handleDateChange = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setForm(prevForm => ({
      ...prevForm,
      periodo: formattedDate
    }));
  };

  // The form.periodo is a string in 'YYYY-MM-DD' format. 
  // DatePicker's selected prop needs a Date object or null.
  // We need to handle the case where form.periodo is not set yet.
  const selectedDate = form.periodo ? new Date(form.periodo) : null;

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h2 className="h5 mb-0">Hoja de Tiempo</h2>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-4">
            <p><strong>Nombre:</strong> {form.nombrecompleto || 'Cargando...'}</p>
            <p><strong>Departamento:</strong> {form.departamento || 'Cargando...'}</p>
            <p><strong>Puesto:</strong> {form.puesto || 'Cargando...'}</p>
          </div>
          <div className="col-md-4 d-flex align-items-center">
            <label htmlFor="periodo" className="form-label me-2"><strong>Periodo:</strong></label>
            <DatePicker
              id="periodo"
              selected={selectedDate}
              onChange={handleDateChange}
              className="form-control"
              dateFormat="dd/MM/yyyy"
              locale="es"
              disabled={isSaving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
