import React, { useState, useEffect } from 'react';
import api from '../../api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ShieldCheck, RefreshCw, Search } from 'lucide-react';

const ACCION_COLORS = {
  CREATE: { bg: '#e8f9ee', color: '#28c76f', label: 'Creación' },
  UPDATE: { bg: '#fff3e0', color: '#ff9f43', label: 'Modificación' },
  DELETE: { bg: '#fef0f0', color: '#ea5455', label: 'Eliminación' },
};

const TABLA_LABELS = {
  clientes:          'Clientes',
  proyectos:         'Proyectos',
  tareas:            'Tareas',
  empleados:         'Empleados',
  registrosdetiempo: 'Hoja de Tiempo',
};

export default function Auditoria() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tablaFiltro, setTablaFiltro] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await api.get('/auditoria?limit=200');
    setRegistros(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = registros.filter(r => {
    const matchTabla = !tablaFiltro || r.tabla_afectada === tablaFiltro;
    const matchSearch = !searchTerm ||
      r.usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tabla_afectada?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.accion?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTabla && matchSearch;
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 style={{ marginBottom: '2px' }}>Auditoría del Sistema</h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#b4b7bd' }}>
            Historial de cambios realizados por los usuarios
          </p>
        </div>
        <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" onClick={load}>
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ borderRadius: 8 }}>
        <div className="card-body py-2 d-flex align-items-center gap-3 flex-wrap">
          <div className="d-flex align-items-center gap-2 flex-grow-1">
            <Search size={15} className="text-muted flex-shrink-0" />
            <input
              type="text"
              className="form-control border-0 shadow-none p-0"
              placeholder="Buscar por usuario o tabla..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.9rem' }}
            />
          </div>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto', minWidth: '140px' }}
            value={tablaFiltro}
            onChange={(e) => setTablaFiltro(e.target.value)}
          >
            <option value="">Todas las tablas</option>
            {Object.entries(TABLA_LABELS).map(([val, lbl]) => (
              <option key={val} value={val}>{lbl}</option>
            ))}
          </select>
          <span className="badge bg-light text-secondary">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div className="p-4"><LoadingSpinner /></div>
        ) : filtered.length === 0 ? (
          <div className="p-5 text-center text-muted">No hay registros de auditoría.</div>
        ) : (
          <div className="table-responsive">
            <table className="table admin-table mb-0">
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Módulo</th>
                  <th>ID Registro</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const accion = ACCION_COLORS[r.accion] || { bg: '#f8f8f8', color: '#6e6b7b', label: r.accion };
                  const fecha = new Date(r.fecha);
                  return (
                    <tr key={r.id}>
                      <td style={{ fontSize: '0.8rem', color: '#b4b7bd', whiteSpace: 'nowrap' }}>
                        {fecha.toLocaleDateString('es-GT')}<br />
                        <span style={{ fontSize: '0.75rem' }}>{fecha.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td style={{ fontWeight: 500, color: '#5e5873', fontSize: '0.85rem' }}>{r.usuario}</td>
                      <td>
                        <span style={{
                          background: accion.bg, color: accion.color,
                          padding: '3px 10px', borderRadius: 12,
                          fontSize: '0.72rem', fontWeight: 700
                        }}>
                          {accion.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.83rem' }}>{TABLA_LABELS[r.tabla_afectada] || r.tabla_afectada}</td>
                      <td style={{ fontSize: '0.8rem', color: '#b4b7bd' }}>#{r.registro_id}</td>
                      <td style={{ fontSize: '0.75rem', color: '#6e6b7b', maxWidth: 250 }}>
                        {r.detalles && (
                          <details>
                            <summary style={{ cursor: 'pointer', color: 'var(--color-primary)' }}>Ver cambios</summary>
                            <pre style={{ marginTop: '4px', fontSize: '0.7rem', background: '#f8f8f8', padding: 6, borderRadius: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                              {JSON.stringify(r.detalles, null, 2)}
                            </pre>
                          </details>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
