import React, { useState, useEffect } from 'react';
import api from '../../api';
import AdminTable from '../../components/common/AdminTable';
import AdminModal from '../../components/common/AdminModal';
import UnifiedForm from '../../components/forms/UnifiedForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PlusCircle, Search } from 'lucide-react';

export default function GestionEmpleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departamentoFilter, setDepartamentoFilter] = useState('');

  const mapEmpleado = (e) => ({
    ...e,
    id: e.empleadoid,
    nombre_departamento: e.departamentos?.nombredepto || '—',
    nombre_puesto: e.puestos?.nombrepuesto || '—',
  });

  const loadEmpleados = async () => {
    setLoading(true);
    const data = await api.get('/empleados');
    setEmpleados(data.map(mapEmpleado));
    setLoading(false);
  };

  useEffect(() => { loadEmpleados(); }, []);

  const handleEdit = (emp) => { setEditingEmpleado(emp); setIsModalOpen(true); };
  const handleAdd  = () => { setEditingEmpleado(null); setIsModalOpen(true); };
  const handleModalClose = () => { setIsModalOpen(false); setEditingEmpleado(null); };

  const handleToggleActive = async (emp) => {
    await api.put(`/empleados/${emp.empleadoid}`, { activo: !emp.activo });
    await loadEmpleados();
  };

  const handleFormSubmit = async (formData) => {
    const payload = {
      nombrecompleto:  formData.nombrecompleto,
      puestoid:        parseInt(formData.puestoid),
      departamentoid:  parseInt(formData.departamentoid),
      activo:          formData.activo !== undefined ? formData.activo : true,
    };
    if (editingEmpleado) {
      await api.put(`/empleados/${editingEmpleado.empleadoid}`, payload);
    } else {
      await api.post('/empleados', payload);
    }
    await loadEmpleados();
    handleModalClose();
  };

  const columns = [
    { key: 'empleadoid',         header: 'ID' },
    { key: 'nombrecompleto',     header: 'Nombre Completo' },
    { key: 'nombre_puesto',      header: 'Puesto' },
    { key: 'nombre_departamento',header: 'Departamento' },
  ];

  // Extract unique departments for the filter dropdown
  const uniqueDepartamentos = [...new Set(empleados.map(e => e.nombre_departamento))].filter(d => d !== '—').sort();

  const filteredEmpleados = empleados.filter(e => {
    const matchName = e.nombrecompleto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = !departamentoFilter || e.nombre_departamento === departamentoFilter;
    return matchName && matchDept;
  });

  return (
    <div>
      <div className="admin-page-header">
        <h2>Gestión de Empleados</h2>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={handleAdd}>
          <PlusCircle size={17} /> Añadir Empleado
        </button>
      </div>

      <div className="card mb-0">
        <div className="card-header bg-white d-flex align-items-center gap-3 py-3 flex-wrap">
          <div className="d-flex align-items-center gap-2 flex-grow-1">
            <Search size={16} className="text-muted flex-shrink-0" />
            <input
              type="text"
              className="form-control border-0 shadow-none p-0"
              placeholder="Buscar empleado por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.9rem' }}
            />
          </div>
          
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto', minWidth: '150px' }}
            value={departamentoFilter}
            onChange={(e) => setDepartamentoFilter(e.target.value)}
          >
            <option value="">Todos los departamentos</option>
            {uniqueDepartamentos.map(depto => (
              <option key={depto} value={depto}>{depto}</option>
            ))}
          </select>
          
          <span className="badge bg-light text-secondary flex-shrink-0">
            {filteredEmpleados.length} registro{filteredEmpleados.length !== 1 ? 's' : ''}
          </span>
        </div>
        {loading ? <div className="p-4"><LoadingSpinner /></div> : (
          <AdminTable
            columns={columns}
            data={filteredEmpleados}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
          />
        )}
      </div>

      <AdminModal isOpen={isModalOpen} onClose={handleModalClose} title={editingEmpleado ? 'Editar Empleado' : 'Añadir Empleado'}>
        <UnifiedForm formType="employee" onSubmit={handleFormSubmit} initialData={editingEmpleado || {}} />
      </AdminModal>
    </div>
  );
}
