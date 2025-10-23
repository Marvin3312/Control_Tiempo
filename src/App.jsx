// src/App.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from './supabaseClient';
import FormHeader from './components/FormHeader';
import TimeTable from './components/TimeTable';

// Crea filas vacías para los días del mes
function buildEmptyRows(dayCount = 1) {
  return Array.from({ length: dayCount }, (_, i) => ({
    id: crypto.randomUUID(),
    fila: i + 1,
    clienteid: null,
    proyectoid: null,
    referenciacaseware: '',
    tareaid: null,
    horas: '',
    notasadicionales: '',
    fecha: null // se asigna al guardar con periodo + dia
  }));
}

export default function App() {
  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [rows, setRows] = useState(buildEmptyRows(1));
  const [form, setForm] = useState({ empleadoid: '', periodo: '', departamento: '', puesto: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCatalogs();
  }, []);

  // 🔹 Cargar catálogos (empleados, clientes, proyectos, tareas)
  async function fetchCatalogs() {
    const [{ data: emp }, { data: cli }, { data: proj }, { data: tar }] = await Promise.all([
      supabase.from('empleados').select('*'),
      supabase.from('clientes').select('*'),
      supabase.from('proyectos').select('*'),
      supabase.from('tareas').select('*')
    ]);
    setEmpleados(emp ?? []);
    setClientes(cli ?? []);
    setProyectos(proj ?? []);
    setTareas(tar ?? []);
  }

  // 🔹 Agrupar proyectos por cliente
  const proyectosByCliente = useMemo(() => {
    const map = {};
    (proyectos || []).forEach(p => {
      map[p.clienteid] = map[p.clienteid] || [];
      map[p.clienteid].push(p);
    });
    return map;
  }, [proyectos]);

  // 🔹 Agrupar tareas por proyecto
  const tareasByProyecto = useMemo(() => {
    const map = {};
    (tareas || []).forEach(t => {
      map[t.proyectoid] = map[t.proyectoid] || [];
      map[t.proyectoid].push(t);
    });
    return map;
  }, [tareas]);

  // 🔹 Cargar registros cuando cambie el periodo o empleado
  useEffect(() => {
    if (!form.periodo || !form.empleadoid) return;
    loadMonthlyRecords();
  }, [form.periodo, form.empleadoid]);

  // 🔹 Cargar los registros del mes seleccionado
  async function loadMonthlyRecords() {
    setLoading(true);
    try {
      const [year, month] = form.periodo.split('-').map(Number);
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).getDate();
      const end = `${year}-${String(month).padStart(2, '0')}-${String(endDate).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('registrosdetiempo')
        .select('*')
        .eq('empleadoid', form.empleadoid)
        .gte('fecha', start)
        .lte('fecha', end);

      if (error) throw error;

      if (data && data.length) {
        const loadedRows = data.map(d => ({
          id: d.registroid || crypto.randomUUID(), // Use registroid if available, otherwise generate new ID
          fila: new Date(d.fecha).getDate(),
          clienteid: d.clienteid ?? null,
          proyectoid: d.proyectoid ?? null,
          referenciacaseware: d.referenciacaseware ?? '',
          tareaid: d.tareaid ?? null,
          horas: String(d.horas),
          notasadicionales: d.notasadicionales ?? '',
          fecha: d.fecha,
          registroid: d.registroid
        }));
        // Append one empty row for new input
        setRows([...loadedRows, buildEmptyRows(1)[0]]);
      } else {
        setRows(buildEmptyRows(1)); // Just one empty row if no data
      }
    } catch (err) {
      console.error(err);
      alert('Error cargando registros: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Guardar registros (inserta o actualiza según corresponda)
  async function handleSave() {
    if (!form.empleadoid || !form.periodo) {
      alert('Seleccione empleado y periodo');
      return;
    }

    setLoading(true);
    try {
      const [year, month] = form.periodo.split('-').map(Number);
      const toInsert = [];
      const toUpdate = [];
      let skippedRows = 0;

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const h = parseFloat(r.horas) || 0;
        // Skip saving if no hours or no tareaid
        if (h <= 0 || !r.tareaid) {
          skippedRows++;
          continue;
        }

        const fecha = new Date(year, month - 1, r.fila).toISOString().slice(0, 10);
        const payload = {
          empleadoid: Number(form.empleadoid),
          tareaid: r.tareaid,
          fecha,
          horas: h,
          notasadicionales: r.notasadicionales || null,
          clienteid: r.clienteid ?? null,
          proyectoid: r.proyectoid ?? null,
          referenciacaseware: r.referenciacaseware || null
        };

        if (r.registroid) {
          toUpdate.push({ registroid: r.registroid, payload });
        } else {
          toInsert.push(payload);
        }
      }

      // 🟢 Insertar nuevos
      if (toInsert.length) {
        const { error: insErr } = await supabase.from('registrosdetiempo').insert(toInsert);
        if (insErr) throw insErr;
      }

      // 🟠 Actualizar existentes
      for (const u of toUpdate) {
        const { error: updErr } = await supabase
          .from('registrosdetiempo')
          .update(u.payload)
          .eq('registroid', u.registroid);
        if (updErr) throw updErr;
      }

      let message = 'Registros guardados correctamente ✅';
      if (skippedRows > 0) {
        message += ` (${skippedRows} filas omitidas por falta de Tarea)`;
      }
      alert(message);
      await loadMonthlyRecords();
    } catch (err) {
      console.error('Error guardando:', err);
      alert('Error guardando: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function addRow() {
    const newRow = {
      id: crypto.randomUUID(),
      fila: rows.length + 1,
      clienteid: null,
      proyectoid: null,
      referenciacaseware: '',
      tareaid: null,
      horas: '',
      notasadicionales: '',
      fecha: null
    };
    setRows([...rows, newRow]);
  }

  return (
    <div id="main-container" style={{
      padding: '40px 20px 20px 20px',
      fontFamily: 'system-ui, Arial',
      maxWidth: 1200,
      margin: '0 auto',
      backgroundColor: '#f0f2f5',
      borderRadius: 8,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2>Gestión de Tiempo - Formato Mensual</h2>

      <FormHeader empleados={empleados} form={form} setForm={setForm} />

      <div style={{ marginBottom: 12 }}>
        <label>Clientes / Proyectos / Tareas</label>
        <div style={{ fontSize: 12 }}>
          Seleccione cliente → proyecto → actividad.  
          Las tareas con <code>escargable = false</code> aparecerán como NO CARGABLES en los totales.
        </div>
      </div>

      <TimeTable
        rows={rows}
        setRows={setRows}
        clientes={clientes}
        proyectos={proyectos}
        tareas={tareas}
        proyectosByCliente={proyectosByCliente}
        tareasByProyecto={tareasByProyecto}
      />

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={handleSave} disabled={loading}>Guardar (Insert / Update)</button>
        <button onClick={() => setRows(buildEmptyRows(rows.length))}>Limpiar mes</button>
        <button onClick={addRow}>Añadir Fila</button>
        <div style={{ marginLeft: 'auto' }}>{loading ? 'Procesando...' : ''}</div>
      </div>
    </div>
  );
}
