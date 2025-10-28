¡Claro\! Aquí tienes el archivo `.md` con los requisitos para el Dashboard de KPIs, diseñado para que tu IA (o cualquier desarrollador) entienda perfectamente las instrucciones.

-----

# Requisitos del Dashboard de KPIs y Exportación a CSV

## 1\. Resumen de la Funcionalidad

El objetivo es crear un nuevo componente de React llamado `DashboardKPIs` que muestre métricas clave (KPIs) sobre el tiempo registrado en la aplicación. Esta pantalla debe incluir una función para exportar los datos visualizados a un archivo CSV.

## 2\. Requisitos de Acceso (Roles)

El acceso a este componente debe estar estrictamente controlado por la columna `role` en la tabla `public.empleados`.

  * **Acceso Permitido:**
      * `role = 'admin'`
      * `role = 'tecnico'`
  * **Acceso Denegado:**
      * `role = 'gerente'`
      * `role = 'usuario'`
      * Cualquier otro rol.

La implementación se manejará en `App.jsx`, que renderizará condicionalmente el componente `DashboardKPIs` solo si el `perfilEmpleado.role` coincide con los roles permitidos.

## 3\. Requisitos de Datos (KPIs)

El dashboard debe consultar la tabla `public.registrosdetiempo` y (potencialmente) unirse a las tablas `proyectos`, `clientes`, `empleados` y `tareas` para agregar y mostrar la siguiente información:

### KPIs Sugeridos:

  * **Horas Totales por Proyecto:** Un resumen o gráfico que muestre el total de horas (`SUM(horas)`) agrupadas por `proyectoid`.
  * **Horas Totales por Cliente:** Total de horas (`SUM(horas)`) agrupadas por `clienteid`.
  * **Horas Totales por Empleado:** Total de horas (`SUM(horas)`) agrupadas por `empleadoid` (para ver la productividad).
  * **Horas Cargables vs. No Cargables:** Una comparación (ej. gráfico de pastel) basada en la columna `tareas.escargable`.
  * **Filtros:** El dashboard DEBE incluir filtros de rango de fechas (`fechaInicio`, `fechaFin`) para que el administrador pueda seleccionar el período de los KPIs.

## 4\. Requisitos de Funcionalidad (Exportar a CSV)

  * Debe existir un botón en la interfaz del dashboard etiquetado como "Exportar a CSV".
  * Al hacer clic, la aplicación debe tomar los datos **actualmente filtrados** (basados en el rango de fechas seleccionado) que se están utilizando para los KPIs.
  * Estos datos deben ser procesados y convertidos a formato CSV.
  * El navegador debe descargar automáticamente un archivo (ej: `reporte_kpi_[fecha].csv`).
  * **Librería Recomendada:** `papaparse` o `react-csv` para manejar la conversión de JSON a CSV de forma eficiente.

## 5\. Instrucciones de Implementación (Paso a Paso)

1.  **Crear `src/DashboardKPIs.jsx`:**
      * Crear el componente base de React.
      * Añadir estados (`useState`) para los filtros de fecha (`fechaInicio`, `fechaFin`) y para los datos (`kpiData`).
2.  **Lógica de Carga de Datos:**
      * Crear una función asíncrona (`fetchKpiData`) que se ejecute cuando cambien los filtros de fecha.
      * Esta función debe usar `supabase.rpc()` para llamar a una **Función de PostgreSQL** (recomendado para agregaciones complejas) o construir una consulta Supabase (`.select()`) para obtener los datos agregados (`SUM`, `GROUP BY`) de `registrosdetiempo`.
3.  **Visualización:**
      * Renderizar los datos en `kpiData` usando componentes simples o una librería de gráficos (ej. `recharts` o `chart.js`).
4.  **Lógica de Exportación CSV:**
      * Instalar una librería de CSV (ej: `npm install papaparse`).
      * Crear una función `handleExportCSV`.
      * Esta función tomará `kpiData`, usará `Papa.unparse()` (de `papaparse`) para convertir el JSON a un string CSV.
      * Creará un elemento `<a>` oculto con un `href` de tipo `data:text/csv;charset=utf-8,...` y simulará un clic para iniciar la descarga.
5.  **Integración en `App.jsx`:**
      * Importar `DashboardKPIs` en `App.jsx`.
      * Renderizarlo condicionalmente usando la lógica de roles ya implementada:
        ```