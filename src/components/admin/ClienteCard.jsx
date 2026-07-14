import React, { useState } from 'react';
import { Edit2, PlusCircle, ChevronDown, ChevronRight, Briefcase, CheckSquare, Tag } from 'lucide-react';
import '../common/AdminTable.css';
import './ClienteCard.css';

// ─── Sub-component: Project Row with expandable tasks ───────────────────
function ProyectoRow({ proyecto, onEdit, onToggle, onAddTarea, onEditTarea, onToggleTarea }) {
  const [expanded, setExpanded] = useState(false);
  const tareas = proyecto.tareas || [];
  const tareasActivas = tareas.filter(t => t.activo !== false);

  return (
    <>
      {/* Project row */}
      <tr className={`proyecto-row ${!proyecto.activo ? 'row-inactive' : ''}`}>
        <td className="proyecto-expand-cell">
          <button
            className="btn btn-xs btn-light"
            onClick={() => setExpanded(e => !e)}
            title={expanded ? 'Colapsar tareas' : 'Ver tareas'}
            disabled={tareas.length === 0}
          >
            {expanded
              ? <ChevronDown size={13} />
              : <ChevronRight size={13} />
            }
          </button>
        </td>
        <td className="proyecto-name">
          <Briefcase size={13} className="me-2 text-muted" />
          {proyecto.nombreproyecto}
          {tareas.length > 0 && (
            <span className="badge-count ms-2">{tareasActivas.length} tarea{tareasActivas.length !== 1 ? 's' : ''}</span>
          )}
        </td>
        <td className="proyecto-code">{proyecto.referenciacaseware || <span className="text-muted">—</span>}</td>
        <td>
          <label className="admin-toggle" title="Estado proyecto">
            <input type="checkbox" checked={!!proyecto.activo} onChange={() => onToggle(proyecto)} />
            <span className="admin-toggle-slider"></span>
          </label>
        </td>
        <td>
          <div className="d-flex gap-1">
            <button className="btn btn-xs btn-outline-primary" onClick={() => onEdit(proyecto)} title="Editar proyecto">
              <Edit2 size={11} />
            </button>
            <button className="btn btn-xs btn-outline-success" onClick={() => onAddTarea(proyecto)} title="Nueva tarea">
              <PlusCircle size={11} />
            </button>
          </div>
        </td>
      </tr>

      {/* Task rows (expandable) */}
      {expanded && tareas.map(tarea => (
        <tr key={tarea.tareaid} className={`tarea-row ${!tarea.activo && tarea.activo !== undefined ? 'row-inactive' : ''}`}>
          <td></td>
          <td className="tarea-name" colSpan={1}>
            <CheckSquare size={12} className="me-2 text-muted" />
            {tarea.descripciontarea}
          </td>
          <td>
            <span className={`badge-tag ${tarea.escargable ? 'badge-cargable' : 'badge-no-cargable'}`}>
              <Tag size={9} className="me-1" />
              {tarea.escargable ? 'Cargable' : 'No cargable'}
            </span>
          </td>
          <td>
            <label className="admin-toggle" title="Estado tarea">
              <input type="checkbox" checked={tarea.activo !== false} onChange={() => onToggleTarea(tarea)} />
              <span className="admin-toggle-slider"></span>
            </label>
          </td>
          <td>
            <button className="btn btn-xs btn-outline-primary" onClick={() => onEditTarea(tarea)} title="Editar tarea">
              <Edit2 size={11} />
            </button>
          </td>
        </tr>
      ))}

      {/* Empty tasks message */}
      {expanded && tareas.length === 0 && (
        <tr className="tarea-row">
          <td></td>
          <td colSpan={4} className="text-muted" style={{ fontSize: '0.8rem', paddingLeft: '2rem' }}>
            Sin tareas —{' '}
            <button className="btn btn-link btn-sm p-0" onClick={() => onAddTarea(proyecto)}>
              Agregar una
            </button>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main: ClienteCard ───────────────────────────────────────────────────
export default function ClienteCard({
  cliente,
  onEditCliente,
  onToggleCliente,
  onAddProyecto,
  onEditProyecto,
  onToggleProyecto,
  onAddTarea,
  onEditTarea,
  onToggleTarea,
}) {
  const [expanded, setExpanded] = useState(true);
  const proyectos = cliente.proyectos || [];
  const tareasTotal = proyectos.reduce((s, p) => s + (p.tareas?.length || 0), 0);

  return (
    <div className={`cliente-card ${!cliente.activo ? 'cliente-card--inactive' : ''}`}>
      {/* ── Card Header ── */}
      <div className="cliente-card__header">
        <div className="cliente-card__info">
          <div className="cliente-card__avatar">
            {cliente.nombrecliente.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="cliente-card__name">{cliente.nombrecliente}</h3>
            <span className="cliente-card__meta">
              {proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''} · {tareasTotal} tarea{tareasTotal !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="cliente-card__actions">
          <span className={`badge ${cliente.activo ? 'badge-active' : 'badge-inactive'}`}>
            {cliente.activo ? 'Activo' : 'Inactivo'}
          </span>
          <label className="admin-toggle ms-2" title="Activar/Desactivar cliente">
            <input type="checkbox" checked={!!cliente.activo} onChange={() => onToggleCliente(cliente)} />
            <span className="admin-toggle-slider"></span>
          </label>
          <button className="btn btn-sm btn-outline-secondary ms-2" onClick={onEditCliente} title="Editar cliente">
            <Edit2 size={13} />
          </button>
          <button className="btn btn-sm btn-outline-primary ms-1" onClick={() => onAddProyecto(cliente)} title="Nuevo proyecto">
            <PlusCircle size={13} /> <span className="d-none d-md-inline ms-1" style={{ fontSize: '0.75rem' }}>Proyecto</span>
          </button>
          <button className="btn btn-sm btn-light ms-1" onClick={() => setExpanded(e => !e)}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>

      {/* ── Projects + Tasks Table ── */}
      {expanded && (
        proyectos.length === 0 ? (
          <div className="cliente-card__empty">
            <Briefcase size={15} />
            <span>
              Sin proyectos —{' '}
              <button className="btn btn-link btn-sm p-0" onClick={() => onAddProyecto(cliente)}>Agregar uno</button>
            </span>
          </div>
        ) : (
          <div className="cliente-card__projects">
            <table className="proyecto-table">
              <thead>
                <tr>
                  <th style={{ width: '36px' }}></th>
                  <th>Proyecto / Tarea</th>
                  <th>Cód. / Tipo</th>
                  <th style={{ width: '60px' }}>Estado</th>
                  <th style={{ width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map(proy => (
                  <ProyectoRow
                    key={proy.proyectoid}
                    proyecto={proy}
                    onEdit={onEditProyecto}
                    onToggle={onToggleProyecto}
                    onAddTarea={onAddTarea}
                    onEditTarea={onEditTarea}
                    onToggleTarea={onToggleTarea}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
