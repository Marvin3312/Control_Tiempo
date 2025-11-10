import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import AdminTable from '../../components/common/AdminTable';
import AdminModal from '../../components/common/AdminModal';
import UnifiedForm from '../../components/forms/UnifiedForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function GestionEmpleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // TODO: Implementar fetchEmpleados
  useEffect(() => {
    async function fetchEmpleados() {
      try {
        setLoading(true);
        // Placeholder: Remplazar con la llamada a Supabase para obtener empleados
        const { data, error } = await supabase.from('empleados').select('*, departamento_id(*)');
        if (error) throw error;

        const empleadosConDepartamento = data.map(e => ({
            ...e,
            id: e.id,
            nombre_departamento: e.departamento_id ? e.departamento_id.nombre : 'N/A'
        }));

        setEmpleados(empleadosConDepartamento);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEmpleados();
  }, []);

  const handleEdit = (empleado) => {
    setEditingEmpleado(empleado);
    setIsModalOpen(true);
  };

  // TODO: Implementar handleToggleActive si es necesario para empleados
  const handleToggleActive = async (empleado) => {
    console.log('Toggle active para:', empleado);
    // Implementar la lógica de activación/desactivación si se añade el campo 'activo' a la tabla empleados
  };
  
  const handleAdd = () => {
    setEditingEmpleado(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEmpleado(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const { nombre, apellido, email, puesto, departamento_id } = formData;

      const empleadoData = {
        nombre,
        apellido,
        email,
        puesto,
        departamento_id,
      };

      let result;
      if (editingEmpleado) {
        // Update
        result = await supabase
          .from('empleados')
          .update(empleadoData)
          .eq('id', editingEmpleado.id)
          .select('*, departamento_id(*)')
          .single();
      } else {
        // Insert
        result = await supabase
          .from('empleados')
          .insert(empleadoData)
          .select('*, departamento_id(*)')
          .single();
      }

      const { data: updatedEmpleado, error } = result;

      if (error) {
        throw error;
      }
      
      const empleadoConDepartamento = {
        ...updatedEmpleado,
        id: updatedEmpleado.id,
        nombre_departamento: updatedEmpleado.departamento_id ? updatedEmpleado.departamento_id.nombre : 'N/A'
      };

      if (editingEmpleado) {
        setEmpleados(empleados.map(e => e.id === editingEmpleado.id ? empleadoConDepartamento : e));
      } else {
        setEmpleados([...empleados, empleadoConDepartamento]);
      }

      handleModalClose();
    } catch (error) {
      console.error('Error saving employee:', error);
      setError(error.message);
      // Consider showing a notification to the user
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'apellido', header: 'Apellido' },
    { key: 'email', header: 'Email' },
    { key: 'puesto', header: 'Puesto' },
    { key: 'nombre_departamento', header: 'Departamento' },
  ];

  const filteredEmpleados = empleados.filter(empleado =>
    empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Empleados</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          Añadir Empleado
        </button>
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar empleado por nombre o apellido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <AdminTable 
        columns={columns} 
        data={filteredEmpleados} 
        onEdit={handleEdit} 
        onToggleActive={handleToggleActive} // Asegurarse que la tabla pueda manejar esto
      />
      <AdminModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        title={editingEmpleado ? 'Editar Empleado' : 'Añadir Empleado'}
      >
        <UnifiedForm 
          formType="employee" // Este tipo se usará para cargar la config del formulario
          onSubmit={handleFormSubmit} 
          initialData={editingEmpleado || {}}
        />
      </AdminModal>
    </div>
  );
}
