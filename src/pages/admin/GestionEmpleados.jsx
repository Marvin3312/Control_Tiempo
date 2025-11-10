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

  useEffect(() => {
    async function fetchEmpleados() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('empleados')
          .select('empleadoid, nombrecompleto, activo, departamentoid, puestoid, departamentos(nombredepto), puestos(nombrepuesto)');
        
        if (error) {
          throw error;
        }

        const empleadosConRelaciones = data.map(e => ({
            ...e,
            id: e.empleadoid, // Usar empleadoid como id para la tabla
            nombre_departamento: e.departamentos ? e.departamentos.nombredepto : 'N/A',
            nombre_puesto: e.puestos ? e.puestos.nombrepuesto : 'N/A'
        }));

        setEmpleados(empleadosConRelaciones);
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

  const handleToggleActive = async (empleado) => {
    try {
      const { data, error } = await supabase
        .from('empleados')
        .update({ activo: !empleado.activo })
        .eq('empleadoid', empleado.empleadoid)
        .select('empleadoid, nombrecompleto, activo, departamentoid, puestoid, departamentos(nombredepto), puestos(nombrepuesto)')
        .single();

      if (error) {
        throw error;
      }

      const updatedEmpleadoConRelaciones = {
        ...data,
        id: data.empleadoid,
        nombre_departamento: data.departamentos ? data.departamentos.nombredepto : 'N/A',
        nombre_puesto: data.puestos ? data.puestos.nombrepuesto : 'N/A'
      };

      setEmpleados(
        empleados.map((e) =>
          e.empleadoid === empleado.empleadoid ? updatedEmpleadoConRelaciones : e
        )
      );
    } catch (error) {
      console.error('Error toggling employee active state:', error);
      setError(error.message);
      // TODO: Show notification to user
    }
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
      const { nombrecompleto, puestoid, departamentoid, activo } = formData;

      const empleadoData = {
        nombrecompleto,
        puestoid: parseInt(puestoid), // Asegurarse de que sea un entero
        departamentoid: parseInt(departamentoid), // Asegurarse de que sea un entero
        activo: activo || false, // Default a false si no está definido
      };

      let result;
      if (editingEmpleado) {
        // Update
        result = await supabase
          .from('empleados')
          .update(empleadoData)
          .eq('empleadoid', editingEmpleado.empleadoid)
          .select('empleadoid, nombrecompleto, activo, departamentoid, puestoid, departamentos(nombredepto), puestos(nombrepuesto)')
          .single();
      } else {
        // Insert
        result = await supabase
          .from('empleados')
          .insert(empleadoData)
          .select('empleadoid, nombrecompleto, activo, departamentoid, puestoid, departamentos(nombredepto), puestos(nombrepuesto)')
          .single();
      }

      const { data: updatedEmpleado, error } = result;

      if (error) {
        throw error;
      }
      
      const empleadoConRelaciones = {
        ...updatedEmpleado,
        id: updatedEmpleado.empleadoid,
        nombre_departamento: updatedEmpleado.departamentos ? updatedEmpleado.departamentos.nombredepto : 'N/A',
        nombre_puesto: updatedEmpleado.puestos ? updatedEmpleado.puestos.nombrepuesto : 'N/A'
      };

      if (editingEmpleado) {
        setEmpleados(empleados.map(e => e.empleadoid === editingEmpleado.empleadoid ? empleadoConRelaciones : e));
      } else {
        setEmpleados([...empleados, empleadoConRelaciones]);
      }

      handleModalClose();
    } catch (error) {
      console.error('Error saving employee:', error);
      setError(error.message);
      // Consider showing a notification to the user
    }
  };

  const columns = [
    { key: 'empleadoid', header: 'ID' },
    { key: 'nombrecompleto', header: 'Nombre Completo' },
    { key: 'nombre_puesto', header: 'Puesto' },
    { key: 'nombre_departamento', header: 'Departamento' },
    { key: 'activo', header: 'Activo', type: 'boolean' },
  ];

  const filteredEmpleados = empleados.filter(empleado =>
    empleado.nombrecompleto.toLowerCase().includes(searchTerm.toLowerCase())
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
          placeholder="Buscar empleado por nombre completo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <AdminTable 
        columns={columns} 
        data={filteredEmpleados} 
        onEdit={handleEdit} 
        onToggleActive={handleToggleActive} 
      />
      <AdminModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        title={editingEmpleado ? 'Editar Empleado' : 'Añadir Empleado'}
      >
        <UnifiedForm 
          formType="employee" 
          onSubmit={handleFormSubmit} 
          initialData={editingEmpleado || {}}
        />
      </AdminModal>
    </div>
  );
}
