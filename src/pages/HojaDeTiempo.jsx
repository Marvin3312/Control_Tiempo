import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import FormHeader from '../components/FormHeader';
import { TimeTable } from '../components/TimeTable';
import { Notification } from '../components/Notification';

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

function HojaDeTiempo() {
  const { perfilEmpleado } = useAuth();
  const [form, setForm] = useState({});
  const [rows, setRows] = useState(buildEmptyRows(1));
  const [clientes, setClientes] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isSaving, setIsSaving] = useState(false);

  function showNotification(message, type) {
    setNotification({ message, type });
  }

  useEffect(() => {
    async function fetchData() {
      const { data: clientesData, error: clientesError } = await supabase.from('clientes').select('*');
      if (clientesData) setClientes(clientesData);

      const { data: proyectosData, error: proyectosError } = await supabase.from('proyectos').select('*');
      if (proyectosData) setProyectos(proyectosData);

      const { data: tareasData, error: tareasError } = await supabase.from('tareas').select('*');
      if (tareasData) setTareas(tareasData);
    }
    fetchData();
  }, []);

  const proyectosByCliente = useMemo(() => proyectos.reduce((acc, p) => {
    if (!acc[p.clienteid]) acc[p.clienteid] = [];
    acc[p.clienteid].push(p);
    return acc;
  }, {}), [proyectos]);

  const tareasByProyecto = useMemo(() => tareas.reduce((acc, t) => {
    if (!acc[t.proyectoid]) acc[t.proyectoid] = [];
    acc[t.proyectoid].push(t);
    return acc;
  }, {}), [tareas]);

  useEffect(() => {
    if (perfilEmpleado) {
      setForm({
        nombrecompleto: perfilEmpleado.nombrecompleto,
        departamento: perfilEmpleado.departamentos?.nombredepto,
        puesto: perfilEmpleado.puestos?.nombrepuesto,
        periodo: new Date().toISOString().split('T')[0],
      });
    }
  }, [perfilEmpleado]);

  const handleAddRow = () => {
    setRows([...rows, buildEmptyRows(1, form.periodo)[0]]);
  };

  const handleClear = () => {
    setRows(buildEmptyRows(1, form.periodo));
  };

  const handleSave = async () => {
    if (!perfilEmpleado) {
      showNotification('No se pudo identificar al empleado.', 'error');
      return;
    }

    setIsSaving(true);

    const recordsToSave = rows
      .filter(row => row.tareaid && row.horas > 0)
      .map(row => ({
        empleadoid: perfilEmpleado.empleadoid,
        tareaid: row.tareaid,
        fecha: form.periodo,
        horas: row.horas,
        notasadicionales: row.notasadicionales,
        clienteid: row.clienteid,
        proyectoid: row.proyectoid,
        referenciacaseware: row.referenciacaseware,
      }));

    if (recordsToSave.length === 0) {
      showNotification('No hay filas válidas para guardar.', 'warning');
      setIsSaving(false);
      return;
    }

    try {
      const { error } = await supabase.from('registrosdetiempo').upsert(recordsToSave);

      if (error) {
        showNotification(`Error al guardar: ${error.message}`, 'error');
      } else {
        showNotification('¡Datos guardados con éxito!', 'success');
        setRows(buildEmptyRows(1, form.periodo));
      }
    } catch (error) {
      showNotification(`Error al guardar: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mt-4">
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: '' })} 
      />
      <FormHeader form={form} setForm={setForm} />
      <TimeTable
        rows={rows}
        setRows={setRows}
        clientes={clientes}
        proyectos={proyectos}
        tareas={tareas}
        proyectosByCliente={proyectosByCliente}
        tareasByProyecto={tareasByProyecto}
      />
      <div className="mt-3 d-flex justify-content-between">
        <div>
          <button className="btn btn-secondary" onClick={handleAddRow}>+ Añadir Fila</button>
          <button className="btn btn-danger ms-2" onClick={handleClear}>Limpiar</button>
        </div>
        <div>
          <button className="btn btn-success" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Enviando...' : 'Enviar Definitivo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HojaDeTiempo;