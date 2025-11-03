
import React from 'react';
import './AdminTable.css';

export default function AdminTable({ columns, data, onEdit, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped admin-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
              <td>
                <button className="btn btn-sm btn-primary me-2" onClick={() => onEdit(row)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => onDelete(row)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
