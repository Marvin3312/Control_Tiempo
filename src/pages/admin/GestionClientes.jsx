import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import AdminTable from '../../components/common/AdminTable';
import AdminModal from '../../components/common/AdminModal';
import ClientForm from '../../components/forms/ClientForm';

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
          .select('clienteid, nombrecliente, parentclienteid'); // Select specific columns

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
    if (window.confirm(`¿Está seguro de que desea eliminar a ${cliente.nombrecliente}?`)) {
      try {
        const { error } = await supabase
          .from('clientes')
          .delete()
          .eq('clienteid', cliente.clienteid); // Use clienteid

        if (error) {
          throw error;
        }

        setClientes(clientes.filter((c) => c.clienteid !== cliente.clienteid)); // Use clienteid
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
          .eq('clienteid', editingClient.clienteid) // Use clienteid
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
        setClientes(clientes.map(c => c.clienteid === editingClient.clienteid ? data[0] : c)); // Use clienteid
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
    { key: 'clienteid', header: 'ID' },
    { key: 'nombrecliente', header: 'Nombre' },
    { key: 'parentclienteid', header: 'ID Cliente Padre' },
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