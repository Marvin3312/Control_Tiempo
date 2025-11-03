import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import AdminTable from '../../components/AdminTable';
import AdminModal from '../../components/AdminModal';
import ProjectForm from '../../components/ProjectForm';

export default function GestionProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: proyectosData, error: proyectosError } = await supabase
          .from('proyectos')
          .select('*, cliente:clientes(nombre)');

        if (proyectosError) throw proyectosError;

        const { data: clientesData, error: clientesError } = await supabase
          .from('clientes')
          .select('*');

        if (clientesError) throw clientesError;

        setProyectos(proyectosData.map(p => ({...p, nombre_cliente: p.cliente.nombre})));
        setClientes(clientesData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (project) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el proyecto ${project.nombre}?`)) {
      try {
        const { error } = await supabase
          .from('proyectos')
          .delete()
          .eq('id', project.id);

        if (error) throw error;

        setProyectos(proyectos.filter((p) => p.id !== project.id));
      } catch (error) {
        console.error('Error deleting project:', error);
        // TODO: Show notification
      }
    }
  };

  const handleAdd = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const { nombre_cliente, ...projectData } = formData;
      let result;
      if (editingProject) {
        result = await supabase
          .from('proyectos')
          .update(projectData)
          .eq('id', editingProject.id)
          .select('*, cliente:clientes(nombre)');
      } else {
        result = await supabase
          .from('proyectos')
          .insert(projectData)
          .select('*, cliente:clientes(nombre)');
      }

      const { data, error } = result;

      if (error) throw error;
      
      const newProject = {...data[0], nombre_cliente: data[0].cliente.nombre};

      if (editingProject) {
        setProyectos(proyectos.map(p => p.id === editingProject.id ? newProject : p));
      } else {
        setProyectos([...proyectos, newProject]);
      }

      handleModalClose();
    } catch (error) {
      console.error('Error saving project:', error);
      // TODO: Show notification
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'nombre', header: 'Nombre Proyecto' },
    { key: 'nombre_cliente', header: 'Cliente' },
    { key: 'codigo_caseware', header: 'Cód. Caseware' },
  ];

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Proyectos</h2>
        <button className="btn btn-primary" onClick={handleAdd}>Añadir Proyecto</button>
      </div>
      <AdminTable 
        columns={columns} 
        data={proyectos} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
      <AdminModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        title={editingProject ? 'Editar Proyecto' : 'Añadir Proyecto'}
      >
        <ProjectForm 
          onSubmit={handleFormSubmit} 
          initialData={editingProject || {}}
          clientes={clientes}
        />
      </AdminModal>
    </div>
  );
}