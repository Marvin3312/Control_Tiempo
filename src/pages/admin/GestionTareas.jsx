import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import AdminModal from '../../components/common/AdminModal';
import TaskForm from '../../components/forms/TaskForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function GestionTareas() {
  const [tareas, setTareas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeKey, setActiveKey] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: tareasData, error: tareasError } = await supabase
          .from('tareas')
          .select('*');

        if (tareasError) throw tareasError;

        const { data: proyectosData, error: proyectosError } = await supabase
          .from('proyectos')
          .select('*')
          .eq('activo', true);

        if (proyectosError) throw proyectosError;

        const proyectosMap = new Map(proyectosData.map(p => [p.proyectoid, p.nombreproyecto]));

        setTareas(tareasData.map(t => ({
          ...t,
          id: t.tareaid,
          nombre_proyecto: proyectosMap.get(t.proyectoid) || 'N/A'
        })));

        setProyectos(proyectosData.map(p => ({...p, id: p.proyectoid})));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const { nombre_proyecto, ...taskData } = formData;
      let result;
      if (editingTask) {
        result = await supabase
          .from('tareas')
          .update(taskData)
          .eq('id', editingTask.id)
          .select('*');
      } else {
        result = await supabase
          .from('tareas')
          .insert(taskData)
          .select('*');
      }

      const { data, error } = result;

      if (error) throw error;

      const newTaskData = data[0];
      const proyecto = proyectos.find(p => p.id === newTaskData.proyectoid);
      const newTask = {
        ...newTaskData,
        id: newTaskData.tareaid,
        nombre_proyecto: proyecto ? proyecto.nombreproyecto : 'N/A'
      };

      if (editingTask) {
        setTareas(tareas.map(t => t.id === editingTask.id ? newTask : t));
      } else {
        setTareas([...tareas, newTask]);
      }

      handleModalClose();
    } catch (error) {
      console.error('Error saving task:', error);
      // TODO: Show notification
    }
  };

  const filteredTareas = tareas.filter(tarea =>
    tarea.descripciontarea.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedTareas = filteredTareas.reduce((acc, tarea) => {
    const projectName = tarea.nombre_proyecto || 'Sin Proyecto';
    if (!acc[projectName]) {
      acc[projectName] = [];
    }
    acc[projectName].push(tarea);
    return acc;
  }, {});

  if (loading) return <LoadingSpinner />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Tareas</h2>
        <button className="btn btn-primary" onClick={handleAdd}>Añadir Tarea</button>
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar tarea..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="accordion" id="accordion-tareas">
        {Object.entries(groupedTareas).map(([projectName, tasks], index) => (
          <div className="accordion-item" key={projectName}>
            <h2 className="accordion-header" id={`heading-${index}`}>
              <button 
                className={`accordion-button ${activeKey !== index ? 'collapsed' : ''}`} 
                type="button" 
                onClick={() => setActiveKey(activeKey === index ? null : index)}
                aria-expanded={activeKey === index}
                aria-controls={`collapse-${index}`}
              >
                {projectName} ({tasks.length} tareas)
              </button>
            </h2>
            <div 
              id={`collapse-${index}`} 
              className={`accordion-collapse collapse ${activeKey === index ? 'show' : ''}`}
              aria-labelledby={`heading-${index}`}
            >
              <div className="accordion-body">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Descripción</th>
                      <th>Cargable</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td>{task.id}</td>
                        <td>{task.descripciontarea}</td>
                        <td>{task.escargable ? 'Sí' : 'No'}</td>
                        <td>
                          <button className="btn btn-sm btn-primary" onClick={() => handleEdit(task)}>Editar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminModal 
        isOpen={isModalOpen}
        onClose={handleModalClose} 
        title={editingTask ? 'Editar Tarea' : 'Añadir Tarea'}
      >
        <TaskForm 
          onSubmit={handleFormSubmit} 
          initialData={editingTask || {}}
          proyectos={proyectos}
        />
      </AdminModal>
    </div>
  );
}