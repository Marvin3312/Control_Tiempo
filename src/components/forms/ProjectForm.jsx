
import React, { useState, useEffect } from 'react';

export default function ProjectForm({ onSubmit, initialData = {}, clientes }) {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="nombre" className="form-label">Nombre del Proyecto</label>
        <input
          type="text"
          className="form-control"
          id="nombre"
          name="nombre"
          value={formData.nombre || ''}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="cliente_id" className="form-label">Cliente</label>
        <select
          className="form-control"
          id="cliente_id"
          name="cliente_id"
          value={formData.cliente_id || ''}
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
      <div className="mb-3">
        <label htmlFor="codigo_caseware" className="form-label">Código Caseware</label>
        <input
          type="text"
          className="form-control"
          id="codigo_caseware"
          name="codigo_caseware"
          value={formData.codigo_caseware || ''}
          onChange={handleChange}
        />
      </div>
      <button type="submit" className="btn btn-primary">Guardar</button>
    </form>
  );
}
