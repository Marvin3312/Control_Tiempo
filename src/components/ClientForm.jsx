
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
        <label htmlFor="nombre" className="form-label">Nombre</label>
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
        <label htmlFor="identificacion" className="form-label">Identificación</label>
        <input
          type="text"
          className="form-control"
          id="identificacion"
          name="identificacion"
          value={formData.identificacion || ''}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="telefono" className="form-label">Teléfono</label>
        <input
          type="tel"
          className="form-control"
          id="telefono"
          name="telefono"
          value={formData.telefono || ''}
          onChange={handleChange}
        />
      </div>
      <button type="submit" className="btn btn-primary">Guardar</button>
    </form>
  );
}
