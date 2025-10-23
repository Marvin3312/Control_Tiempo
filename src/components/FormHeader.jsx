// src/components/FormHeader.jsx
import React from 'react';
import DatePicker from 'react-datepicker';

export default function FormHeader({ empleados, form, setForm }) {
  const handleDateChange = (date) => {
    setForm({
      ...form,
      periodo: date ? date.toISOString().split('T')[0] : '',
    });
  };

  return (
    <div className="container-fluid mb-3">
      <div className="row">
        <div className="col-md-3 mb-3">
          <label htmlFor="empleadoSelect" className="form-label">Empleado</label>
          <select
            id="empleadoSelect"
            className="form-select"
            value={form.empleadoid ?? ''}
            onChange={(e) => setForm({...form, empleadoid: Number(e.target.value)})}
          >
            <option value="">-- Seleccione empleado --</option>
            {empleados.map(emp => (
              <option key={emp.empleadoid} value={emp.empleadoid}>{emp.nombrecompleto}</option>
            ))}
          </select>
        </div>

        <div className="col-md-3 mb-3">
           <label htmlFor="fechaInput" className="form-label">Fecha</label>
           <br/>
          <DatePicker
            id="fechaInput"
            selected={form.periodo ? new Date(form.periodo) : null}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            className="form-control"
          />
        </div>

        <div className="col-md-3 mb-3">
          <label htmlFor="departamentoInput" className="form-label">Departamento</label>
          <input
            id="departamentoInput"
            type="text"
            className="form-control"
            value={form.departamento ?? ''}
            onChange={(e)=>setForm({...form, departamento: e.target.value})}
          />
        </div>

        <div className="col-md-3 mb-3">
          <label htmlFor="puestoInput" className="form-label">Puesto</label>
          <input
            id="puestoInput"
            type="text"
            className="form-control"
            value={form.puesto ?? ''}
            onChange={(e)=>setForm({...form, puesto: e.target.value})}
          />
        </div>
      </div>
    </div>
  );
}
