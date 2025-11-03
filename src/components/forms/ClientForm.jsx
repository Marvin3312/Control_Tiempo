
import React, { useState, useEffect } from 'react';
import './ClientForm.css';

export default function ClientForm({ onSubmit, initialData = {} }) {
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
    <form onSubmit={handleSubmit} className="client-form">
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
      <button type="submit" className="btn btn-primary">Guardar</button>
    </form>
  );
}
