import React, { useState, useEffect } from 'react';
import './UnifiedForm.css';

export default function UnifiedForm({ formType, onSubmit, initialData = {}, clientes }) {
  const [formData, setFormData] = useState(initialData);
  const [clientSelection, setClientSelection] = useState('existing');

  useEffect(() => {
    setFormData(initialData);
    if (formType === 'project' && initialData.clienteid) {
      setClientSelection('existing');
    }
  }, [initialData, formType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientSelectionChange = (e) => {
    setClientSelection(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, clientSelection });
  };

  const renderClientFields = () => (
    <>
      <div className="mb-3">
        <label htmlFor="nombrecliente" className="form-label">Nombre del Cliente</label>
        <input
          type="text"
          className="form-control"
          id="nombrecliente"
          name="nombrecliente"
          value={formData.nombrecliente || ''}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="parentclienteid" className="form-label">ID Cliente Padre (Opcional)</label>
        <input
          type="number"
          className="form-control"
          id="parentclienteid"
          name="parentclienteid"
          value={formData.parentclienteid || ''}
          onChange={handleChange}
        />
      </div>
    </>
  );

  const renderProjectFields = () => (
    <>
      <h5>DATOS DEL PROYECTO</h5>
      <div className="mb-3">
        <label htmlFor="nombreproyecto" className="form-label">Nombre del Proyecto</label>
        <input
          type="text"
          className="form-control"
          id="nombreproyecto"
          name="nombreproyecto"
          value={formData.nombreproyecto || ''}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="referenciacaseware" className="form-label">Código Caseware</label>
        <input
          type="text"
          className="form-control"
          id="referenciacaseware"
          name="referenciacaseware"
          value={formData.referenciacaseware || ''}
          onChange={handleChange}
        />
      </div>
      
      <hr />

      <h5>DATOS DEL CLIENTE</h5>
      <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="radio"
          name="clientSelection"
          id="existingClient"
          value="existing"
          checked={clientSelection === 'existing'}
          onChange={handleClientSelectionChange}
        />
        <label className="form-check-label" htmlFor="existingClient">
          Cliente Existente
        </label>
      </div>
      <div className="form-check form-check-inline mb-3">
        <input
          className="form-check-input"
          type="radio"
          name="clientSelection"
          id="newClient"
          value="new"
          checked={clientSelection === 'new'}
          onChange={handleClientSelectionChange}
        />
        <label className="form-check-label" htmlFor="newClient">
          Cliente Nuevo
        </label>
      </div>

      {clientSelection === 'existing' ? (
        <div className="mb-3">
          <label htmlFor="clienteid" className="form-label">Cliente</label>
          <select
            className="form-control"
            id="clienteid"
            name="clienteid"
            value={formData.clienteid || ''}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Seleccione un cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="mb-3">
          <label htmlFor="newClientName" className="form-label">Nombre del Nuevo Cliente</label>
          <input
            type="text"
            className="form-control"
            id="newClientName"
            name="newClientName"
            value={formData.newClientName || ''}
            onChange={handleChange}
            required
          />
        </div>
      )}
    </>
  );

  return (
    <form onSubmit={handleSubmit} className="unified-form">
      {formType === 'client' && renderClientFields()}
      {formType === 'project' && renderProjectFields()}
      <button type="submit" className="btn btn-primary mt-3">Guardar</button>
    </form>
  );
}