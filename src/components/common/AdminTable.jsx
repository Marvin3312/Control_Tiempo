import React from 'react';
import { Edit2 } from 'lucide-react';
import './AdminTable.css';

export default function AdminTable({ columns, data, onEdit, onToggleActive }) {
  if (!data || data.length === 0) {
    return (
      <div className="admin-table-empty">
        <p>No hay registros para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive admin-table-wrapper">
      <table className="table admin-table mb-0">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
            <th>Acciones</th>
            {onToggleActive && <th>Estado</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
              <td>
                <button
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  onClick={() => onEdit(row)}
                  title="Editar"
                >
                  <Edit2 size={13} /> Editar
                </button>
              </td>
              {onToggleActive && (
                <td>
                  <label className="admin-toggle" title={row.activo ? 'Activo — clic para desactivar' : 'Inactivo — clic para activar'}>
                    <input
                      type="checkbox"
                      checked={!!row.activo}
                      onChange={() => onToggleActive(row)}
                    />
                    <span className="admin-toggle-slider"></span>
                  </label>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
