import React, { useState, useEffect } from 'react';
import api from '../../api';
import AdminTable from '../../components/common/AdminTable';
import AdminModal from '../../components/common/AdminModal';
import UnifiedForm from '../../components/forms/UnifiedForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PlusCircle, Search } from 'lucide-react';

export default function GestionProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadProyectos = async () => {
    setLoading(true);
    const [proyectosData, clientesData] = await Promise.all([
      api.get('/proyectos'),
      api.get('/clientes'),
    ]);
    const clientesMap = new Map(clientesData.map(c => [c.clienteid, c.nombrecliente]));
    setProyectos(proyectosData.map(p => ({
      ...p,
      id: p.proyectoid,
      nombre_cliente: clientesMap.get(p.clienteid) || '—',
      referenciacaseware: p.referenciacaseware || '—',
    })));
    setLoading(false);
  };

  useEffect(() => { loadProyectos(); }, []);

  const handleEdit = (project) => { setEditingProject(project); setIsModalOpen(true); };
  const handleAdd  = () => { setEditingProject(null); setIsModalOpen(true); };
  const handleModalClose = () => { setIsModalOpen(false); setEditingProject(null); };

  const handleToggleActive = async (project) => {
    await api.put(`/proyectos/${project.proyectoid}`, { activo: !project.activo });
    setProyectos(prev => prev.map(p => p.proyectoid === project.proyectoid ? { ...p, activo: !p.activo } : p));
  };

  const handleFormSubmit = async (formData) => {
    const payload = {
      nombreproyecto: formData.nombreproyecto,
      clienteid: Number(formData.clienteid),
      referenciacaseware: formData.referenciacaseware && formData.referenciacaseware.trim() !== '' ? formData.referenciacaseware.trim() : null,
      activo: formData.activo !== undefined ? formData.activo : true,
    };
    if (editingProject) {
      await api.put(`/proyectos/${editingProject.proyectoid}`, payload);
    } else {
      await api.post('/proyectos', payload);
    }
    await loadProyectos();
    handleModalClose();
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'nombreproyecto', header: 'Proyecto' },
    { key: 'nombre_cliente', header: 'Cliente' },
    { key: 'referenciacaseware', header: 'Cód. Caseware' },
  ];

  const filteredProyectos = proyectos.filter(p =>
    p.nombreproyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="admin-page-header">
        <h2>Gestión de Proyectos</h2>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={handleAdd}>
          <PlusCircle size={17} /> Añadir Proyecto
        </button>
      </div>

      <div className="card mb-0">
        <div className="card-header bg-white d-flex align-items-center gap-2 py-3">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            className="form-control border-0 shadow-none p-0"
            placeholder="Buscar por proyecto o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: '0.9rem' }}
          />
          <span className="badge bg-light text-secondary ms-auto">{filteredProyectos.length} registro{filteredProyectos.length !== 1 ? 's' : ''}</span>
        </div>
        {loading ? <div className="p-4"><LoadingSpinner /></div> : (
          <AdminTable
            columns={columns}
            data={filteredProyectos}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
          />
        )}
      </div>

      <AdminModal isOpen={isModalOpen} onClose={handleModalClose} title={editingProject ? 'Editar Proyecto' : 'Añadir Proyecto'}>
        <UnifiedForm formType="project" onSubmit={handleFormSubmit} initialData={editingProject || {}} />
      </AdminModal>
    </div>
  );
}