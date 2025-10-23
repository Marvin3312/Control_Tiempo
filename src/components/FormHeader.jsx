// src/components/FormHeader.jsx
import React from 'react';

export default function FormHeader({ empleados, form, setForm }) {
  return (
    <div className="header" style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div>
          <label>Empleado</label><br/>
          <select
            value={form.empleadoid ?? ''}
            onChange={(e) => setForm({...form, empleadoid: Number(e.target.value)})}
          >
            <option value="">-- Seleccione empleado --</option>
            {empleados.map(emp => (
              <option key={emp.empleadoid} value={emp.empleadoid}>{emp.nombrecompleto}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Periodo (YYYY-MM)</label><br/>
          <input
            type="month"
            value={form.periodo ?? ''}
            onChange={(e) => setForm({...form, periodo: e.target.value})}
          />
        </div>

        <div>
          <label>Departamento</label><br/>
          <input value={form.departamento ?? ''} onChange={(e)=>setForm({...form, departamento: e.target.value})} />
        </div>

        <div>
          <label>Puesto</label><br/>
          <input value={form.puesto ?? ''} onChange={(e)=>setForm({...form, puesto: e.target.value})} />
        </div>
      </div>
    </div>
  );
}
