import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import AdminTable from '../../components/common/AdminTable';
import AdminModal from '../../components/common/AdminModal';
import UnifiedForm from '../../components/forms/UnifiedForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function GestionClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchClientes() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('clientes')
          .select('clienteid, nombrecliente, parentclienteid, activo');

        if (error) {
          throw error;
        }

        const clientesMap = new Map(data.map(c => [c.clienteid, c.nombrecliente]));

        const clientesConPadre = data.map(c => ({
          ...c,
          id: c.clienteid, // Add id property for the key
          nombre_cliente_padre: clientesMap.get(c.parentclienteid) || 'N/A'
        }));

        setClientes(clientesConPadre);
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

  const handleToggleActive = async (cliente) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({ activo: !cliente.activo })
        .eq('clienteid', cliente.clienteid)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setClientes(
        clientes.map((c) =>
          c.clienteid === cliente.clienteid ? { ...c, activo: data.activo } : c
        )
      );
    } catch (error) {
      console.error('Error toggling client active state:', error);
      // TODO: Show notification to user
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
      const { nombrecliente, parentclienteid, activo } = formData; // Explicitly pick fields

      const clientDataToSubmit = {
        nombrecliente,
        parentclienteid: parentclienteid === '' ? null : parentclienteid, // Handle empty string for parentclienteid
        activo,
      };

      let result;
      if (editingClient) {
        // Update
        result = await supabase
          .from('clientes')
          .update(clientDataToSubmit)
          .eq('clienteid', editingClient.clienteid)
          .select();
      } else {
        // Insert
        result = await supabase
          .from('clientes')
          .insert(clientDataToSubmit)
          .select();
      }

      const { data, error } = result;

      if (error) {
        throw error;
      }

      const newClientData = data[0];

      // Create a map of clients to find the parent client name
      const clientesMap = new Map(clientes.map(c => [c.clienteid, c.nombrecliente]));
      if (!editingClient) {
        // Add the new client to the map in case it's a parent for another new client
        clientesMap.set(newClientData.clienteid, newClientData.nombrecliente);
      }

      const newClient = {
        ...newClientData,
        id: newClientData.clienteid, // Add id property for the key
        nombre_cliente_padre: clientesMap.get(newClientData.parentclienteid) || 'N/A'
      };

      if (editingClient) {
        setClientes(clientes.map(c => c.clienteid === editingClient.clienteid ? newClient : c));
      } else {
        setClientes([...clientes, newClient]);
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
    { key: 'nombre_cliente_padre', header: 'Cliente Padre' },
  ];

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombrecliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Clientes</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          Añadir Cliente
        </button>
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <AdminTable 
        columns={columns} 
        data={filteredClientes} 
        onEdit={handleEdit} 
        onToggleActive={handleToggleActive} 
      />
      <AdminModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        title={editingClient ? 'Editar Cliente' : 'Añadir Cliente'}
      >
        <UnifiedForm 
          formType="client"
          onSubmit={handleFormSubmit} 
          initialData={editingClient || {}}
        />
      </AdminModal>
    </div>
  );
}