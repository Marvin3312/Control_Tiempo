import React, { useState, useEffect } from 'react';

export default function ClienteProyectoForm({ tipo, initialData, clientes, onSubmit, onCancel, saveError }) {
  const [formData, setFormData] = useState(initialData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setFormData(initialData); }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await onSubmit(formData); } finally { setSubmitting(false); }
  };

  const renderSwitch = (name, label, defaultVal = true) => (
    <div className="mb-4 d-flex align-items-center gap-3">
      <label className="form-label mb-0 fw-semibold">{label}</label>
      <label className="uf-switch">
        <input type="checkbox" name={name} checked={formData[name] !== false && formData[name] !== undefined ? (formData[name] ?? defaultVal) : false} onChange={handleChange} />
        <span className="uf-switch-slider"></span>
      </label>
    </div>
  );

  const renderActions = (label) => (
    <div className="d-flex justify-content-end gap-2 mt-4">
      <button type="button" className="btn btn-light px-3" onClick={onCancel}>Cancelar</button>
      <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
        {submitting ? 'Guardando...' : label}
      </button>
    </div>
  );

  // ─── CLIENTE ───────────────────────────────────────────────
  if (tipo === 'cliente') return (
    <form onSubmit={handleSubmit}>
      {saveError && <div className="alert alert-danger py-2 mb-3">{saveError}</div>}
      <div className="mb-3">
        <label className="form-label fw-semibold">Nombre del Cliente *</label>
        <input className="form-control" name="nombrecliente" value={formData.nombrecliente || ''}
          onChange={handleChange} required placeholder="Ej. Empresa XYZ S.A." autoFocus />
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Cliente Padre <span className="text-muted fw-normal">(opcional — si es filial)</span>
        </label>
        <select className="form-select" name="parentclienteid" value={formData.parentclienteid || ''} onChange={handleChange}>
          <option value="">— Ninguno (empresa independiente) —</option>
          {clientes
            .filter(c => c.clienteid !== initialData.clienteid)
            .map(c => <option key={c.clienteid} value={c.clienteid}>{c.nombrecliente}</option>)}
        </select>
      </div>
      {renderSwitch('activo', 'Cliente activo')}
      {renderActions('Guardar Cliente')}
    </form>
  );

  // ─── PROYECTO ──────────────────────────────────────────────
  if (tipo === 'proyecto') return (
    <form onSubmit={handleSubmit}>
      {saveError && <div className="alert alert-danger py-2 mb-3">{saveError}</div>}
      <div className="mb-3">
        <label className="form-label fw-semibold">Nombre del Proyecto *</label>
        <input className="form-control" name="nombreproyecto" value={formData.nombreproyecto || ''}
          onChange={handleChange} required placeholder="Ej. Auditoría Anual 2025" autoFocus />
      </div>
      <div className="row g-3 mb-3">
        <div className="col-md-7">
          <label className="form-label fw-semibold">Cliente *</label>
          <select className="form-select" name="clienteid" value={formData.clienteid || ''} onChange={handleChange} required>
            <option value="" disabled>— Seleccione cliente —</option>
            {clientes.map(c => <option key={c.clienteid} value={c.clienteid}>{c.nombrecliente}</option>)}
          </select>
        </div>
        <div className="col-md-5">
          <label className="form-label fw-semibold">Cód. Caseware <span className="text-muted fw-normal">(opcional)</span></label>
          <input className="form-control" name="referenciacaseware" value={formData.referenciacaseware || ''}
            onChange={handleChange} placeholder="Ej. XYZ-001" />
        </div>
      </div>
      {renderSwitch('activo', 'Proyecto activo')}
      {renderActions('Guardar Proyecto')}
    </form>
  );

  // ─── TAREA ─────────────────────────────────────────────────
  if (tipo === 'tarea') return (
    <form onSubmit={handleSubmit}>
      {saveError && <div className="alert alert-danger py-2 mb-3">{saveError}</div>}

      {/* Contexto visual: a qué proyecto pertenece */}
      {initialData._nombreProyecto && (
        <div className="alert alert-light py-2 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.83rem' }}>
          <span className="text-muted">Proyecto:</span>
          <strong>{initialData._nombreProyecto}</strong>
        </div>
      )}

      <div className="mb-3">
        <label className="form-label fw-semibold">Descripción de la Tarea *</label>
        <input className="form-control" name="descripciontarea" value={formData.descripciontarea || ''}
          onChange={handleChange} required placeholder="Ej. Revisión estados financieros" autoFocus />
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold">Código de Tarea <span className="text-muted fw-normal">(opcional)</span></label>
        <input className="form-control" name="codigo_tarea" value={formData.codigo_tarea || ''}
          onChange={handleChange} placeholder="Ej. T-001" />
      </div>

      <div className="mb-4 d-flex align-items-center gap-3">
        <label className="form-label mb-0 fw-semibold">¿Es cargable al cliente?</label>
        <label className="uf-switch">
          <input type="checkbox" name="escargable" checked={formData.escargable !== false} onChange={handleChange} />
          <span className="uf-switch-slider"></span>
        </label>
        <small className="text-muted">{formData.escargable !== false ? 'Cargable' : 'No cargable'}</small>
      </div>

      {renderActions('Guardar Tarea')}
    </form>
  );

  return null;
}
