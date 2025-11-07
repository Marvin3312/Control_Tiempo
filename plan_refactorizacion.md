# Plan de Refactorización de la Base de Datos

Este plan detalla los pasos para refactorizar la base de datos y la aplicación para usar un catálogo de tareas centralizado.

## Pasos

1.  **Crear la nueva tabla `catalogo_tareas`**
    *   Definir la estructura de la tabla `catalogo_tareas` con columnas como `id`, `codigo_tarea`, `descripcion`, `escargable`, etc.-----

2.  **Poblar la tabla `catalogo_tareas`**
    *   Insertar los datos de las tareas maestras en la nueva tabla `catalogo_tareas`. Se utilizará el archivo `tareas_rows.sql` como fuente de datos.

3.  **Modificar la tabla `tareas`**
    *   Añadir una columna `catalogo_tarea_id` a la tabla `tareas` para que sea una clave foránea a `catalogo_tareas`.
    *   Eliminar las columnas duplicadas (como `descripciontarea`, `escargable`) de la tabla `tareas`, ya que ahora esa información estará en `catalogo_tareas`.
    *   La tabla `tareas` ahora servirá como una tabla de unión que asigna tareas de catálogo a proyectos específicos.

4.  **Refactorizar el código de la aplicación**
    *   **Gestión de Tareas (`GestionTareas.jsx`):** Modificar esta página para que ahora administre el `catalogo_tareas` (añadir, editar, activar/desactivar tareas maestras).
    *   **Hoja de Tiempo (`HojaDeTiempo.jsx`):** Actualizar la lógica para obtener las tareas. Ahora deberá mostrar las tareas (`tareas`) asignadas al proyecto (`proyectoid`) seleccionado, obteniendo la descripción desde `catalogo_tareas`.
    *   **Formularios (`TaskForm.jsx`, `UnifiedForm.jsx`):** Ajustar los formularios para que trabajen con la nueva estructura. Por ejemplo, el formulario para asignar tareas a un proyecto ahora debería permitir seleccionar tareas del `catalogo_tareas`.n
    *   **Dashboard y Reportes (`useDashboardData.js`):** Actualizar las consultas y la lógica de la función `obtener_reporte_filtrado` para que refleje los cambios en el esquema y los joins necesarios entre `registrosdetiempo`, `tareas`, y `catalogo_tareas`.
    *   **Autenticación y Perfil (`AuthContext.jsx`):** Revisar si hay alguna dependencia con la estructura de tareas anterior.

5.  **Probar la aplicación**
    *   Realizar pruebas exhaustivas de todas las funcionalidades afectadas:
        *   Creación/edición de tareas en el catálogo.
        *   Asignación de tareas a proyectos.
        *   Registro de horas en la hoja de tiempo.
        *   Visualización de reportes y KPIs.

---
*Nota: Cada vez que se complete un paso, se marcará con una línea divisoria `----------` debajo del paso correspondiente.*
