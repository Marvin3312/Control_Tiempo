// src/App.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from './supabaseClient';
import FormHeader from './components/FormHeader';
import { TimeTable } from './components/TimeTable';
import { Notification } from './components/Notification';
import AuthSimple from './AuthSimple';

// Crea filas vacías
function buildEmptyRows(dayCount = 1, fecha = new Date().toISOString().slice(0, 10)) {
  return Array.from({ length: dayCount }, (_, i) => ({
    id: crypto.randomUUID(),
    fila: i + 1,
    clienteid: null,
    proyectoid: null,
    referenciacaseware: '',
    tareaid: null,
    horas: '',
    notasadicionales: '',
    fecha: fecha
  }));
}

export default function App() {
  const [session, setSession] = useState(null);
  const [empleadoProfile, setEmpleadoProfile] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [rows, setRows] = useState(buildEmptyRows(1));
  const [form, setForm] = useState({ empleadoid: '', periodo: '', departamento: '', puesto: '' });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  function showNotification(message, type) {
    setNotification({ message, type });
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchEmpleadoProfile() {
      if (session?.user) {
        const { data, error } = await supabase
          .from('empleados')
          .select('*, puestos(nombrepuesto), departamentos(nombredepto)')
          .eq('usuario_id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching empleado profile:', error);
          setEmpleadoProfile(null);
        } else if (data) {
          setEmpleadoProfile({
            ...data,
            puesto: data.puestos.nombrepuesto,
            departamento: data.departamentos.nombredepto,
          });
          setForm(prevForm => ({
            ...prevForm,
            empleadoid: data.empleadoid,
            departamento: data.departamentos.nombredepto,
            puesto: data.puestos.nombrepuesto,
          }));
        }
      } else {
        setEmpleadoProfile(null);
        setForm({ empleadoid: '', periodo: '', departamento: '', puesto: '' });
      }
    }
    fetchEmpleadoProfile();
  }, [session]);

  useEffect(() => {
    if (empleadoProfile) {
      fetchCatalogs();
    }
  }, [empleadoProfile]);

  async function fetchCatalogs() {
    const [{ data: cli }, { data: proj }, { data: tar }] = await Promise.all([
      supabase.from('clientes').select('*'),
      supabase.from('proyectos').select('*'),
      supabase.from('tareas').select('*')
    ]);
    setClientes(cli ?? []);
    setProyectos(proj ?? []);
    setTareas(tar ?? []);
  }

  const proyectosByCliente = useMemo(() => {
    const map = {};
    (proyectos || []).forEach(p => {
      map[p.clienteid] = map[p.clienteid] || [];
      map[p.clienteid].push(p);
    });
    return map;
  }, [proyectos]);

  const tareasByProyecto = useMemo(() => {
    const map = {};
    (tareas || []).forEach(t => {
      map[t.proyectoid] = map[t.proyectoid] || [];
      map[t.proyectoid].push(t);
    });
    return map;
  }, [tareas]);

  useEffect(() => {
    if (!form.periodo || !empleadoProfile?.empleadoid) return;
    loadDailyRecords();
  }, [form.periodo, empleadoProfile?.empleadoid]);

  async function loadDailyRecords() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('registrosdetiempo')
        .select('*')
        .eq('empleadoid', empleadoProfile.empleadoid)
        .eq('fecha', form.periodo);

      if (error) throw error;

      if (data && data.length) {
        const loadedRows = data.map((d, i) => ({
          id: d.registroid || crypto.randomUUID(),
          fila: i + 1,
          clienteid: d.clienteid ?? null,
          proyectoid: d.proyectoid ?? null,
          referenciacaseware: d.referenciacaseware ?? '',
          tareaid: d.tareaid ?? null,
          horas: String(d.horas),
          notasadicionales: d.notasadicionales ?? '',
          fecha: d.fecha,
          registroid: d.registroid
        }));
        setRows([...loadedRows, buildEmptyRows(1, form.periodo)[0]]);
      } else {
        setRows(buildEmptyRows(1, form.periodo));
      }
    } catch (err) {
      console.error(err);
      showNotification('Error cargando registros: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!empleadoProfile?.empleadoid) {
      showNotification('Empleado no autenticado o no vinculado.', 'error');
      return;
    }

    setLoading(true);
    try {
      const toInsert = [];
      const toUpdate = [];
      let skippedRows = 0;

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const h = parseFloat(r.horas) || 0;
        if (h <= 0 || !r.tareaid || !r.fecha) {
          skippedRows++;
          continue;
        }

        const payload = {
          empleadoid: empleadoProfile.empleadoid,
          tareaid: r.tareaid,
          fecha: r.fecha,
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

      if (toInsert.length) {
        const { error: insErr } = await supabase.from('registrosdetiempo').insert(toInsert);
        if (insErr) throw insErr;
      }

      for (const u of toUpdate) {
        const { error: updErr } = await supabase
          .from('registrosdetiempo')
          .update(u.payload)
          .eq('registroid', u.registroid);
        if (updErr) throw updErr;
      }

      let message = 'Registros guardados correctamente ✅';
      if (skippedRows > 0) {
        message += ` (${skippedRows} filas omitidas por falta de Tarea o Fecha)`;
      }
      showNotification(message, 'success');
      if (form.periodo) {
        await loadDailyRecords();
      }
    } catch (err) {
      console.error('Error guardando:', err);
      showNotification('Error guardando: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function addRow() {
    setRows([...rows, buildEmptyRows(1, form.periodo)[0]]);
  }

  if (!session) {
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
        <AuthSimple />
      </div>
    );
  }

  if (!empleadoProfile) {
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
        <Notification 
          message="Acceso Denegado: Tu usuario no está vinculado a un empleado." 
          type="error" 
          onClose={() => {}} 
        />
        <button onClick={() => supabase.auth.signOut()} className="btn btn-danger mt-3">Cerrar Sesión</button>
      </div>
    );
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
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: '' })} 
      />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Tiempo</h2>
        <button onClick={() => supabase.auth.signOut()} className="btn btn-outline-secondary">Cerrar Sesión</button>
      </div>

      <FormHeader empleados={[]} form={form} setForm={setForm} />

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
        empleadoProfile={empleadoProfile}
      />

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={handleSave} disabled={loading}>Guardar (Insert / Update)</button>
        <button onClick={() => setRows(buildEmptyRows(1, form.periodo))}>Limpiar todo</button>
        <button onClick={addRow}>Añadir Fila</button>
        <div style={{ marginLeft: 'auto' }}>{loading ? 'Procesando...' : ''}</div>
      </div>
    </div>
  );
}
