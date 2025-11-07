
import React, { useState, useEffect } from 'react';
import UnifiedForm from '../../components/forms/UnifiedForm';
import { supabase } from '../../supabaseClient'; // Import supabase client

export default function UnifiedFormTest() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    // Fetch clients for the project form
    async function fetchClientes() {
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('clienteid, nombrecliente');

        if (error) {
          throw error;
        }
        // Map to the format expected by the form
        const clientesMapped = data.map(c => ({ id: c.clienteid, nombre: c.nombrecliente }));
        setClientes(clientesMapped);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    }

    fetchClientes();
  }, []);

  const handleClientSubmit = (formData) => {
    console.log('Client form submitted:', formData);
    alert('Client form submitted. Check the console for the data.');
  };

  const handleProjectSubmit = (formData) => {
    console.log('Project form submitted:', formData);
    alert('Project form submitted. Check the console for the data.');
  };

  return (
    <div>
    
      <hr />

      <h2>Formulario de Cliente</h2>
      <div className="card">
        <div className="card-body">
          <UnifiedForm 
            formType="client"
            onSubmit={handleClientSubmit} 
            initialData={{}}
          />
        </div>
      </div>

      <hr style={{ margin: '40px 0' }} />

      <h2>Formulario de Proyecto</h2>
      <div className="card">
        <div className="card-body">
          <UnifiedForm 
            formType="project"
            onSubmit={handleProjectSubmit} 
            initialData={{}}
            clientes={clientes} // Pass the fetched clients
          />
        </div>
      </div>
    </div>
  );
}
