import React, { useMemo } from 'react';

export function TimeRow({
  index, row, clientes, proyectos, groupedTareas,
  onChange
}) {

  const handleClientChange = (e) => {
    const clienteid = e.target.value ? Number(e.target.value) : null;
    onChange(index, {
      ...row,
      clienteid,
      proyectoid: null,
      tareaid: null,
      referenciacaseware: ''
    });
  };

  const handleProjectChange = (e) => {
    const proyectoid = e.target.value ? Number(e.target.value) : null;
    const project = proyectos.find(p => p.proyectoid == proyectoid);
    onChange(index, {
      ...row,
      proyectoid,
      tareaid: null,
      referenciacaseware: project ? project.referenciacaseware || '' : ''
    });
  };

  const handleTaskChange = (e) => {
    const tareaid = e.target.value ? Number(e.target.value) : null;
    onChange(index, { ...row, tareaid });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange(index, { ...row, [name]: value });
  }

  const filteredProjects = useMemo(() => {
    if (!row.clienteid) return [];
    return proyectos.filter(p => p.clienteid == row.clienteid);
  }, [row.clienteid, proyectos]);

  const taskGroup = row.proyectoid ? groupedTareas.find(g => g.proyectoid == row.proyectoid) : null;

  return (
    <tr>
      <td>{index + 1}</td>
      <td>
        <select
          value={row.clienteid ?? ''}
          onChange={handleClientChange}
          className="form-select"
        >
          <option value="">-- Seleccione Cliente --</option>
          {clientes.map(c => (
            <option key={c.clienteid} value={c.clienteid}>{c.nombrecliente}</option>
          ))}
        </select>
      </td>
      <td>
        <select
          value={row.proyectoid ?? ''}
          onChange={handleProjectChange}
          className="form-select"
          disabled={!row.clienteid}
        >
          <option value="">-- Seleccione Proyecto --</option>
          {filteredProjects.map(p => (
            <option key={p.proyectoid} value={p.proyectoid}>{p.nombreproyecto}</option>
          ))}
        </select>
      </td>
      <td>
        <input
          name="referenciacaseware"
          value={row.referenciacaseware ?? ''}
          onChange={handleInputChange}
          placeholder="Ref.Caseware"
          className="form-control"
        />
      </td>
      <td>
        <select
          value={row.tareaid ?? ''}
          onChange={handleTaskChange}
          className="form-select"
          disabled={!row.proyectoid}
        >
          <option value="">-- Seleccione Actividad --</option>
          {taskGroup && (
            <optgroup label={taskGroup.label}>
              {taskGroup.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </td>
      <td>
        <input
          type="number"
          step="0.25"
          min="0"
          value={row.horas ?? ''}
          onChange={(e)=> onChange(index, {...row, horas: e.target.value})}
          className="form-control"
        />
      </td>
      <td>
        <input
          value={row.notasadicionales ?? ''}
          onChange={(e)=> onChange(index, {...row, notasadicionales: e.target.value})}
          placeholder="Observacion"
          className="form-control"
        />
      </td>
    </tr>
  );
}