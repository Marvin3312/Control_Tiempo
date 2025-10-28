import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../src/supabaseClient';
import { useAuth } from './AuthContext';
import FormHeader from '../src/components/FormHeader';
import { TimeTable } from '../src/components/TimeTable';
import { Notification } from '../src/components/Notification';

function HojaDeTiempo() {
  const { perfilEmpleado } = useAuth();
  const [form, setForm] = useState({});
  const [rows, setRows] = useState([{}]);
  const [clientes, setClientes] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });

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
    setRows([...rows, {}]);
  };

  const handleSave = async () => {
    if (!perfilEmpleado) {
      showNotification('No se pudo identificar al empleado.', 'error');
      return;
    }

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
      return;
    }

    const { error } = await supabase.from('registrosdetiempo').upsert(recordsToSave);

    if (error) {
      showNotification(`Error al guardar: ${error.message}`, 'error');
    } else {
      showNotification('¡Datos guardados con éxito!', 'success');
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
        <button className="btn btn-secondary" onClick={handleAddRow}>+ Añadir Fila</button>
        <div>
          <button className="btn btn-primary" onClick={handleSave}>Guardar Borrador</button>
          <button className="btn btn-success ms-2">Enviar Definitivo</button>
        </div>
      </div>
    </div>
  );
}

export default HojaDeTiempo;