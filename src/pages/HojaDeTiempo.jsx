import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { TimeTable } from '../components/timetable/TimeTable';
import { Notification } from '../components/common/Notification';
import { FormHeader } from '../components/FormHeader';
import { PlusCircle, Trash2, Send, Clock, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

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

function HistorialDia({ registros, loading }) {
  if (loading) return <div className="p-3"><LoadingSpinner /></div>;
  if (!registros || registros.length === 0) return null;

  const totalHoras = registros.reduce((acc, r) => acc + Number(r.horas), 0);

  return (
    <div className="card mt-4 border-success" style={{ backgroundColor: '#f8fff9' }}>
      <div className="card-header bg-transparent border-success d-flex align-items-center gap-2 text-success">
        <CheckCircle size={18} />
        <h6 className="mb-0 fw-bold">Horas registradas para este día ({totalHoras} hrs total)</h6>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.85rem' }}>
            <thead className="text-muted" style={{ borderBottom: '1px solid #c2f0d8' }}>
              <tr>
                <th className="ps-3">Cliente</th>
                <th>Proyecto</th>
                <th>Tarea</th>
                <th>Horas</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {registros.map(r => (
                <tr key={r.registroid} style={{ borderBottom: '1px solid #e8f9ee' }}>
                  <td className="ps-3 fw-medium">{r.tareas?.proyectos?.clientes?.nombrecliente || '—'}</td>
                  <td>{r.tareas?.proyectos?.nombreproyecto || '—'}</td>
                  <td>{r.tareas?.descripciontarea || '—'}</td>
                  <td className="fw-bold text-success">{r.horas}</td>
                  <td className="text-muted text-truncate" style={{ maxWidth: '200px' }} title={r.notasadicionales}>
                    {r.notasadicionales || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
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
  
  const [registrosDia, setRegistrosDia] = useState([]);
  const [loadingRegistros, setLoadingRegistros] = useState(false);

  function showNotification(message, type) {
    setNotification({ message, type });
  }

  // Cargar datos estáticos iniciales
  useEffect(() => {
    async function fetchData() {
      try {
        const clientesData = await api.get('/clientes');
        setClientes(clientesData);

        const proyectosData = await api.get('/proyectos');
        setProyectos(proyectosData);

        const allTasks = await api.get('/tareas');
        setAllTareas(allTasks);

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

  // Setear formulario inicial
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

  // Sincronizar filas con la fecha seleccionada y Cargar historial del día
  useEffect(() => {
    if (form.periodo) {
      setRows(currentRows => currentRows.map(row => ({ ...row, fecha: form.periodo })));
      loadRegistrosDelDia(form.periodo);
    }
  }, [form.periodo, perfilEmpleado]);

  const loadRegistrosDelDia = async (fecha) => {
    if (!perfilEmpleado) return;
    setLoadingRegistros(true);
    try {
      const data = await api.get(`/registros?empleadoid=${perfilEmpleado.empleadoid}&fecha=${fecha}`);
      setRegistrosDia(data);
    } catch (err) {
      console.error("Error cargando registros del día:", err);
    } finally {
      setLoadingRegistros(false);
    }
  };

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
      loadRegistrosDelDia(form.periodo); // Refrescar el historial del día
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
      
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <TimeTable
            rows={rows}
            setRows={setRows}
            clientes={clientes}
            proyectos={proyectos}
            groupedTareas={groupedTareas}
            allTareas={allTareas}
          />
        </div>
        <div className="card-footer bg-transparent border-top p-3 d-flex justify-content-between">
          <div>
            <button className="btn btn-secondary d-inline-flex align-items-center gap-2" onClick={handleAddRow}>
              <PlusCircle size={18} /> Añadir Fila
            </button>
            <button className="btn btn-danger ms-2 d-inline-flex align-items-center gap-2" onClick={handleClear}>
              <Trash2 size={18} /> Limpiar
            </button>
          </div>
          <div>
            <button className="btn btn-success d-inline-flex align-items-center gap-2 px-4 fw-bold" onClick={handleSave} disabled={isSaving}>
              <Send size={18} /> {isSaving ? 'Enviando...' : 'Guardar Horas'}
            </button>
          </div>
        </div>
      </div>

      <HistorialDia registros={registrosDia} loading={loadingRegistros} />
    </div>
  );
}

export default HojaDeTiempo;