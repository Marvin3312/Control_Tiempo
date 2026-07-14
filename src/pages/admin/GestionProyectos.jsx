import React, { useState, useEffect } from 'react';
import api from '../../api';
import AdminTable from '../../components/common/AdminTable';
import AdminModal from '../../components/common/AdminModal';
import UnifiedForm from '../../components/forms/UnifiedForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PlusCircle } from 'lucide-react';

export default function GestionProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const proyectosData = await api.get('/proyectos');
        const clientesData = await api.get('/clientes');

        const clientesMap = new Map(clientesData.map(c => [c.clienteid, c.nombrecliente]));

        setProyectos(proyectosData.map(p => ({
          ...p,
          id: p.proyectoid,
          nombre_cliente: clientesMap.get(p.clienteid) || 'N/A'
        })));

        setClientes(clientesData.map(c => ({ ...c, id: c.clienteid, nombre: c.nombrecliente })));
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

  const handleToggleActive = async (project) => {
    try {
      await api.put(`/proyectos/${project.proyectoid}`, { activo: !project.activo });

      setProyectos(
        proyectos.map((p) =>
          p.proyectoid === project.proyectoid ? { ...p, activo: !project.activo } : p
        )
      );
    } catch (error) {
      console.error('Error toggling project active state:', error);
      // TODO: Show notification
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
      const { clientSelection, newClientName, ...projectDataFromForm } = formData;

      let clienteid = projectDataFromForm.clienteid;

      // If creating a new client, insert it first
      if (clientSelection === 'new') {
        const newClientData = await api.post('/clientes', { nombrecliente: newClientName });
        clienteid = newClientData.clienteid;
        
        // Add the new client to the local state
        setClientes([...clientes, { id: clienteid, clienteid: clienteid, nombre: newClientName, nombrecliente: newClientName }]);
      }

      const projectDataToSubmit = {
        nombreproyecto: projectDataFromForm.nombreproyecto,
        clienteid: clienteid,
        referenciacaseware: projectDataFromForm.referenciacaseware,
        activo: projectDataFromForm.activo,
      };

      let newProjectData;
      if (editingProject) {
        newProjectData = await api.put(`/proyectos/${editingProject.proyectoid}`, projectDataToSubmit);
      } else {
        newProjectData = await api.post('/proyectos', projectDataToSubmit);
      }

      const cliente = clientes.find(c => c.id === newProjectData.clienteid);
      const newProject = {
        ...newProjectData,
        id: newProjectData.proyectoid,
        nombre_cliente: cliente ? cliente.nombre : (clientSelection === 'new' ? newClientName : 'N/A')
      };

      if (editingProject) {
        setProyectos(proyectos.map(p => p.proyectoid === editingProject.proyectoid ? newProject : p));
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
    { key: 'nombreproyecto', header: 'Nombre Proyecto' },
    { key: 'nombre_cliente', header: 'Cliente' },
    { key: 'referenciacaseware', header: 'Cód. Caseware' },
  ];

  const filteredProyectos = proyectos.filter(proyecto =>
    proyecto.nombreproyecto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Proyectos</h2>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={handleAdd}>
          <PlusCircle size={18} /> Añadir Proyecto
        </button>
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar proyecto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <AdminTable 
        columns={columns} 
        data={filteredProyectos} 
        onEdit={handleEdit} 
        onToggleActive={handleToggleActive} 
      />
      <AdminModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        title={editingProject ? 'Editar Proyecto' : 'Añadir Proyecto'}
      >
        <UnifiedForm 
          formType="project"
          onSubmit={handleFormSubmit} 
          initialData={editingProject || {}}
          clientes={clientes}
        />
      </AdminModal>
    </div>
  );
}