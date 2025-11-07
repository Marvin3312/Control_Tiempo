
import React, { useState, useEffect } from 'react';

export default function TaskForm({ onSubmit, initialData = {}, proyectos }) {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="descripciontarea" className="form-label">Descripción de la Tarea</label>
        <input
          type="text"
          className="form-control"
          id="descripciontarea"
          name="descripciontarea"
          value={formData.descripciontarea || ''}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="proyectoid" className="form-label">Proyecto</label>
        <select
          className="form-control"
          id="proyectoid"
          name="proyectoid"
          value={formData.proyectoid || ''}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Seleccione un proyecto</option>
          {proyectos.map(proyecto => (
            <option key={proyecto.id} value={proyecto.id}>
              {proyecto.nombreproyecto}
            </option>
          ))}
        </select>
      </div>
      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="escargable"
          name="escargable"
          checked={formData.escargable || false}
          onChange={handleChange}
        />
        <label className="form-check-label" htmlFor="escargable">
          ¿Es Cargable?
        </label>
      </div>
      <button type="submit" className="btn btn-primary">Guardar</button>
    </form>
  );
}
