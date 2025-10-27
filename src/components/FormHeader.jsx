// src/components/FormHeader.jsx
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { supabase } from '../supabaseClient';

export default function FormHeader({ empleados, form, setForm }) {
  const [departamentos, setDepartamentos] = useState([]);
  const [puestos, setPuestos] = useState([]);

  useEffect(() => {
    async function fetchDepartamentos() {
      const { data, error } = await supabase.from('departamentos').select('*');
      if (!error) {
        setDepartamentos(data);
      }
    }

    async function fetchPuestos() {
      const { data, error } = await supabase.from('puestos').select('*');
      if (!error) {
        setPuestos(data);
      }
    }

    fetchDepartamentos();
    fetchPuestos();
  }, []);

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
          <label htmlFor="empleadoDisplay" className="form-label">Empleado</label>
          <div id="empleadoDisplay" className="form-control-plaintext">
            {form.nombrecompleto || 'N/A'}
          </div>
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
          <label htmlFor="departamentoSelect" className="form-label">Departamento</label>
          <select
            id="departamentoSelect"
            className="form-select"
            value={form.departamento ?? ''}
            onChange={(e) => setForm({...form, departamento: e.target.value})}
          >
            <option value="">Seleccione departamento</option>
            {departamentos.map(depto => (
              <option key={depto.departamentoid} value={depto.nombredepto}>{depto.nombredepto}</option>
            ))}
          </select>
        </div>

        <div className="col-md-3 mb-3">
          <label htmlFor="puestoSelect" className="form-label">Puesto</label>
          <select
            id="puestoSelect"
            className="form-select"
            value={form.puesto ?? ''}
            onChange={(e) => setForm({...form, puesto: e.target.value})}
          >
            <option value="">-- Seleccione puesto --</option>
            {puestos.map(puesto => (
              <option key={puesto.puestoid} value={puesto.nombrepuesto}>{puesto.nombrepuesto}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
