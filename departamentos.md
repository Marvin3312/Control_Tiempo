CREATE VIEW vista_kpi_horas_por_empleado AS
SELECT 
  e.nombrecompleto,
  p.nombrepuesto,
  d.nombredepto,
  SUM(rt.horas) AS horas_totales_empleado
FROM 
  public.registrosdetiempo rt
JOIN 
  public.empleados e ON rt.empleadoid = e.empleadoid
JOIN 
  public.puestos p ON e.puestoid = p.puestoid
JOIN 
  public.departamentos d ON e.departamentoid = d.departamentoid
GROUP BY 
  e.nombrecompleto, p.nombrepuesto, d.nombredepto
ORDER BY 
  horas_totales_empleado DESC;