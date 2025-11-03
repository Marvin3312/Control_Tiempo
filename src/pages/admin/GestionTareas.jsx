import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import AdminTable from '../../components/AdminTable';
import AdminModal from '../../components/AdminModal';
import TaskForm from '../../components/TaskForm';

export default function GestionTareas() {
  const [tareas, setTareas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: tareasData, error: tareasError } = await supabase
          .from('tareas')
          .select('*, proyecto:proyectos(nombre)');

        if (tareasError) throw tareasError;

        const { data: proyectosData, error: proyectosError } = await supabase
          .from('proyectos')
          .select('*');

        if (proyectosError) throw proyectosError;

        setTareas(tareasData.map(t => ({...t, nombre_proyecto: t.proyecto.nombre})));
        setProyectos(proyectosData);
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

  const handleDelete = async (task) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la tarea ${task.descripcion}?`)) {
      try {
        const { error } = await supabase
          .from('tareas')
          .delete()
          .eq('id', task.id);

        if (error) throw error;

        setTareas(tareas.filter((t) => t.id !== task.id));
      } catch (error) {
        console.error('Error deleting task:', error);
        // TODO: Show notification
      }
    }
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
          .select('*, proyecto:proyectos(nombre)');
      } else {
        result = await supabase
          .from('tareas')
          .insert(taskData)
          .select('*, proyecto:proyectos(nombre)');
      }

      const { data, error } = result;

      if (error) throw error;
      
      const newTask = {...data[0], nombre_proyecto: data[0].proyecto.nombre};

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

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'descripcion', header: 'Descripción' },
    { key: 'nombre_proyecto', header: 'Proyecto' },
    { key: 'escargable', header: 'Cargable' },
  ];

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Tareas</h2>
        <button className="btn btn-primary" onClick={handleAdd}>Añadir Tarea</button>
      </div>
      <AdminTable 
        columns={columns} 
        data={tareas.map(t => ({...t, escargable: t.escargable ? 'Sí' : 'No'}))} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
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