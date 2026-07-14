import React, { useState, useEffect } from 'react';
import api from '../../api';
import './UnifiedForm.css';

const useSelectData = (dataType) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    if (!dataType) return;
    api.get(`/${dataType}`).then(setData).catch(console.error);
  }, [dataType]);
  return data;
};

export default function UnifiedForm({ formType, onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const departamentos = useSelectData('departamentos');
  const clientes      = useSelectData('clientes');
  const puestos       = useSelectData('puestos');

  useEffect(() => { setFormData(initialData); setFormError(null); }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setFormError(err.message || 'Ocurrió un error al guardar.');
    } finally {
      setSubmitting(false);
    }
  };

  const formConfigs = {
    client: {
      title: 'Datos del Cliente',
      fields: [
        { name: 'nombrecliente',   label: 'Nombre del Cliente *', type: 'text',   required: true,  span: 2 },
        { name: 'parentclienteid', label: 'Cliente Padre (Opcional)', type: 'select', options: clientes, optionValue: 'clienteid', optionLabel: 'nombrecliente', span: 2 },
        { name: 'activo',          label: 'Activo',              type: 'checkbox', span: 1 },
      ]
    },
    project: {
      title: 'Datos del Proyecto',
      fields: [
        { name: 'nombreproyecto',     label: 'Nombre del Proyecto *', type: 'text',   required: true, span: 2 },
        { name: 'clienteid',          label: 'Cliente *',             type: 'select', options: clientes, optionValue: 'clienteid', optionLabel: 'nombrecliente', required: true, span: 1 },
        { name: 'referenciacaseware', label: 'Código Caseware',       type: 'text',   span: 1 },
        { name: 'activo',             label: 'Activo',                type: 'checkbox', span: 2 },
      ]
    },
    employee: {
      title: 'Datos del Empleado',
      fields: [
        { name: 'nombrecompleto',  label: 'Nombre Completo *', type: 'text',   required: true, span: 2 },
        { name: 'puestoid',        label: 'Puesto *',          type: 'select', options: puestos, optionValue: 'puestoid', optionLabel: 'nombrepuesto', required: true, span: 1 },
        { name: 'departamentoid',  label: 'Departamento *',    type: 'select', options: departamentos, optionValue: 'departamentoid', optionLabel: 'nombredepto', required: true, span: 1 },
        { name: 'activo',          label: 'Activo',            type: 'checkbox', span: 2 },
      ]
    }
  };

  const currentConfig = formConfigs[formType];
  if (!currentConfig) return <p>Tipo de formulario no reconocido.</p>;

  return (
    <form onSubmit={handleSubmit} className="unified-form">
      {formError && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {formError}
        </div>
      )}
      <div className="uf-grid">
        {currentConfig.fields.map(field => {
          const { name, label, type, required, options, optionValue, optionLabel, span } = field;
          const value = formData[name] ?? '';
          const colClass = span === 2 ? 'uf-col-full' : 'uf-col-half';

          if (type === 'checkbox') return (
            <div className={`uf-field ${colClass} uf-checkbox-row`} key={name}>
              <label className="uf-switch">
                <input
                  type="checkbox"
                  name={name}
                  checked={!!formData[name]}
                  onChange={handleChange}
                />
                <span className="uf-switch-slider"></span>
              </label>
              <span className="uf-checkbox-label">{label}</span>
            </div>
          );

          if (type === 'select') return (
            <div className={`uf-field ${colClass}`} key={name}>
              <label className="uf-label" htmlFor={name}>{label}</label>
              <select
                className="form-select"
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                required={required}
              >
                <option value="" disabled={required}>{required ? '— Seleccione —' : 'Ninguno'}</option>
                {options?.map(opt => (
                  <option key={opt[optionValue]} value={opt[optionValue]}>
                    {opt[optionLabel]}
                  </option>
                ))}
              </select>
            </div>
          );

          return (
            <div className={`uf-field ${colClass}`} key={name}>
              <label className="uf-label" htmlFor={name}>{label}</label>
              <input
                type={type}
                className="form-control"
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                required={required}
                placeholder={label.replace(' *', '')}
              />
            </div>
          );
        })}
      </div>

      <div className="uf-actions">
        <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}