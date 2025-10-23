import React from 'react';

export function TimeRow({
  index, row, clientes, proyectosByCliente, tareasByProyecto,
  onChange, onToggleEdit
}) {
  const proyectos = proyectosByCliente[row.clienteid] || [];
  const tareas = tareasByProyecto[row.proyectoid] || [];

  return (
    <tr>
      <td>{index + 1}</td>
      <td>
        <select
          value={row.clienteid ?? ''}
          onChange={(e) => onChange(index, { ...row, clienteid: Number(e.target.value), proyectoid: null, tareaid: null })}
        >
          <option value="">-- Cliente --</option>
          {clientes.map(c=> <option key={c.clienteid} value={c.clienteid}>{c.nombrecliente}</option>)}
        </select>
      </td>

      <td>
        <select
          value={row.proyectoid ?? ''}
          onChange={(e)=> onChange(index, {...row, proyectoid: Number(e.target.value), tareaid: null})}
        >
          <option value="">-- Proyecto --</option>
          {proyectos.map(p=> <option key={p.proyectoid} value={p.proyectoid}>{p.nombreproyecto}</option>)}
        </select>
      </td>

      <td>
        <input
          value={row.referenciacaseware ?? ''}
          onChange={(e)=> onChange(index, {...row, referenciacaseware: e.target.value})}
          placeholder="Ref.Caseware"
        />
      </td>

      <td>
        <select
          value={row.tareaid ?? ''}
          onChange={(e)=> onChange(index, {...row, tareaid: Number(e.target.value)})}
        >
          <option value="">-- Actividad --</option>
          {tareas.map(t => <option key={t.tareaid} value={t.tareaid} data-es={t.escargable}>{t.descripciontarea}</option>)}
        </select>
      </td>

      <td>
        <input
          type="number"
          step="0.25"
          min="0"
          value={row.horas ?? ''}
          onChange={(e)=> onChange(index, {...row, horas: e.target.value})}
        />
      </td>

      <td>
        <input
          value={row.notasadicionales ?? ''}
          onChange={(e)=> onChange(index, {...row, notasadicionales: e.target.value})}
          placeholder="Observacion"
        />
      </td>
    </tr>
  );
}
