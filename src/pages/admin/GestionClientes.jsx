import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import AdminTable from '../../components/AdminTable';
import AdminModal from '../../components/AdminModal';
import ClientForm from '../../components/ClientForm';

export default function GestionClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    async function fetchClientes() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('clientes')
          .select('*');

        if (error) {
          throw error;
        }

        setClientes(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchClientes();
  }, []);

  const handleEdit = (cliente) => {
    setEditingClient(cliente);
    setIsModalOpen(true);
  };

  const handleDelete = async (cliente) => {
    if (window.confirm(`¿Está seguro de que desea eliminar a ${cliente.nombre}?`)) {
      try {
        const { error } = await supabase
          .from('clientes')
          .delete()
          .eq('id', cliente.id);

        if (error) {
          throw error;
        }

        setClientes(clientes.filter((c) => c.id !== cliente.id));
      } catch (error) {
        console.error('Error deleting client:', error);
        // TODO: Show notification to user
      }
    }
  };
  
  const handleAdd = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      let result;
      if (editingClient) {
        // Update
        result = await supabase
          .from('clientes')
          .update(formData)
          .eq('id', editingClient.id)
          .select();
      } else {
        // Insert
        result = await supabase
          .from('clientes')
          .insert(formData)
          .select();
      }

      const { data, error } = result;

      if (error) {
        throw error;
      }

      if (editingClient) {
        setClientes(clientes.map(c => c.id === editingClient.id ? data[0] : c));
      } else {
        setClientes([...clientes, data[0]]);
      }

      handleModalClose();
    } catch (error) {
      console.error('Error saving client:', error);
      // TODO: Show notification to user
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'identificacion', header: 'Identificación' },
    { key: 'email', header: 'Email' },
    { key: 'telefono', header: 'Teléfono' },
  ];

  if (loading) return <p>Cargando clientes...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Clientes</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          Añadir Cliente
        </button>
      </div>
      <AdminTable 
        columns={columns} 
        data={clientes} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
      <AdminModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        title={editingClient ? 'Editar Cliente' : 'Añadir Cliente'}
      >
        <ClientForm 
          onSubmit={handleFormSubmit} 
          initialData={editingClient || {}}
        />
      </AdminModal>
    </div>
  );
}