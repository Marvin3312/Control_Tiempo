import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { TimeTable } from '../components/timetable/TimeTable';
import { Notification } from '../components/common/Notification';
import { FormHeader } from '../components/FormHeader';
import { PlusCircle, Trash2, Send } from 'lucide-react';

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
  const [groupedTareas, setGroupedTareas] = useState([]);
  const [allTareas, setAllTareas] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isSaving, setIsSaving] = useState(false);

  function showNotification(message, type) {
    setNotification({ message, type });
  }

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch all clients and projects (for lookups)
      try {
        const clientesData = await api.get('/clientes');
        setClientes(clientesData);

        const proyectosData = await api.get('/proyectos');
        setProyectos(proyectosData);

        // 2. Fetch all tasks (the backend now includes the 'proyectos' relation)
        const allTasks = await api.get('/tareas');
        setAllTareas(allTasks);

      // 3. Group tasks for the dropdown
      const grouped = allTasks.reduce((acc, tarea) => {
          const project = tarea.proyectos;
          if (!project) return acc;

          if (!acc[project.proyectoid]) {
              acc[project.proyectoid] = {
                  label: project.nombreproyecto,
                  proyectoid: project.proyectoid,
                  options: []
              };
          }
          acc[project.proyectoid].options.push({
              value: tarea.tareaid,
              label: tarea.descripciontarea,
              proyectoid: project.proyectoid,
              clienteid: project.clienteid,
              referenciacaseware: project.referenciacaseware,
          });
          return acc;
      }, {});

      setGroupedTareas(Object.values(grouped));
      } catch (error) {
        showNotification('Error al cargar datos iniciales', 'error');
        console.error(error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (perfilEmpleado) {
      const initialDate = new Date().toISOString().split('T')[0];
      setForm({
        nombrecompleto: perfilEmpleado.nombrecompleto,
        departamento: perfilEmpleado.departamentos?.nombredepto,
        puesto: perfilEmpleado.puestos?.nombrepuesto,
        periodo: initialDate,
      });
      setRows(buildEmptyRows(1, initialDate));
    }
  }, [perfilEmpleado]);

  useEffect(() => {
    if (form.periodo) {
      setRows(currentRows => currentRows.map(row => ({ ...row, fecha: form.periodo })));
    }
  }, [form.periodo]);

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
      const response = await api.post('/registros', recordsToSave);
      showNotification(`¡${response.count || 'Datos'} guardados con éxito!`, 'success');
      setRows(buildEmptyRows(1, form.periodo));
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
      <FormHeader form={form} setForm={setForm} isSaving={isSaving} />
      <TimeTable
        rows={rows}
        setRows={setRows}
        clientes={clientes}
        proyectos={proyectos}
        groupedTareas={groupedTareas}
        allTareas={allTareas}
      />
      <div className="mt-3 d-flex justify-content-between">
        <div>
          <button className="btn btn-secondary d-inline-flex align-items-center gap-2" onClick={handleAddRow}>
            <PlusCircle size={18} /> Añadir Fila
          </button>
          <button className="btn btn-danger ms-2 d-inline-flex align-items-center gap-2" onClick={handleClear}>
            <Trash2 size={18} /> Limpiar
          </button>
        </div>
        <div>
          <button className="btn btn-success d-inline-flex align-items-center gap-2" onClick={handleSave} disabled={isSaving}>
            <Send size={18} /> {isSaving ? 'Enviando...' : 'Enviar Definitivo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HojaDeTiempo;