import React, { useState, useEffect } from 'react';
import api from '../../api';
import AdminTable from '../../components/common/AdminTable';
import AdminModal from '../../components/common/AdminModal';
import UnifiedForm from '../../components/forms/UnifiedForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PlusCircle } from 'lucide-react';

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
        const data = await api.get('/clientes');

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
      const data = await api.put(`/clientes/${cliente.clienteid}`, { activo: !cliente.activo });

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

      let newClientData;
      if (editingClient) {
        newClientData = await api.put(`/clientes/${editingClient.clienteid}`, clientDataToSubmit);
      } else {
        newClientData = await api.post('/clientes', clientDataToSubmit);
      }

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
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={handleAdd}>
          <PlusCircle size={18} /> Añadir Cliente
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