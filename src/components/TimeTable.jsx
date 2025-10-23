// src/components/TimeTable.jsx
import React, { useMemo } from 'react';
import { TimeRow } from './TimeRow';

export function TimeTable({
  rows, setRows, clientes, proyectos, tareas, proyectosByCliente, tareasByProyecto
}) {
  const onChange = (index, newRow) => {
    const copy = [...rows];
    copy[index] = newRow;
    setRows(copy);
  };

  // totals
  const totals = useMemo(() => {
    let carg = 0, nocarg = 0;
    for (const r of rows) {
      const t = tareas.find(tt => tt.tareaid === r.tareaid);
      const h = parseFloat(r.horas) || 0;
      if (t) {
        if (t.escargable) carg += h; else nocarg += h;
      } else {
        // if no task selected, assume cargable by default
        carg += h;
      }
    }
    return { carg, nocarg };
  }, [rows, tareas]);

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th>#</th>
            <th>Cliente</th>
            <th>Proyecto</th>
            <th>Ref.Caseware</th>
            <th>Actividad</th>
            <th>Horas</th>
            <th>Observacion</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <TimeRow
              key={r.id || r.registroid || i}
              index={i}
              row={r}
              clientes={clientes}
              proyectosByCliente={proyectosByCliente}
              tareasByProyecto={tareasByProyecto}
              onChange={onChange}
            />
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}><strong>Total Horas Cargables:</strong></td>
            <td colSpan={3}>{totals.carg.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan={4}><strong>Total Horas No Cargables:</strong></td>
            <td colSpan={3}>{totals.nocarg.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
