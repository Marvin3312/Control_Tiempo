## nueva_funcionalidad.log - Observaciones sobre el control de acceso basado en roles

**Fecha:** 24 de octubre de 2025

**Objetivo:** Implementar un sistema de roles para controlar el acceso a diferentes pantallas, incluyendo un dashboard con KPIs y una segunda pantalla específica.

### Discusión sobre la Definición de Roles

El usuario expresó una preocupación sobre la redundancia al añadir un atributo que indique "es empleado" si la tabla ya se llama `empleados`. Se aclaró que la intención de la columna `role` no es redundar la condición de ser empleado, sino especificar el *tipo de rol* o nivel de permisos que ese empleado posee dentro del sistema de la aplicación.

Se consideraron dos enfoques iniciales sugeridos por el usuario para la gestión de acceso:

1.  **Acceso basado en `puesto` específico:** Habilitar el acceso solo a aquellos usuarios con un `puesto` determinado.
    *   **Ventajas:** Aprovecha datos existentes, no requiere añadir nuevas columnas.
    *   **Desventajas:** Menos flexible para futuras expansiones de roles. Si los derechos de acceso de un `puesto` cambian, podría generar confusión. Limita la posibilidad de que múltiples `puestos` tengan los mismos derechos, o que un `puesto` tenga derechos diferentes en distintos contextos.

2.  **Atributo booleano `admin`:** Añadir una columna booleana (`true`/`false`) en la tabla `empleados` para designar administradores (`admin=true`) y usuarios regulares (`admin=false`).
    *   **Ventajas:** Solución clara y sencilla para un control de acceso binario (administrador/no administrador).
    *   **Desventajas:** Demasiado restrictivo si se requieren más de dos niveles de acceso en el futuro (ej. 'gerente', 'editor', 'visualizador'). No escalable para la creación de dos pantallas específicas con distintos permisos, como un dashboard y una segunda pantalla, a menos que ambas sean exclusivas de los `admin`s.

### Propuesta Recomendada: Columna `role` en la tabla `empleados`

Para ofrecer mayor flexibilidad y un diseño más escalable que permita manejar los requisitos de acceso a las nuevas pantallas (dashboard con KPIs y segunda pantalla), se recomienda añadir una columna `role` a la tabla `public.empleados`.

*   **Tipo de Columna:** `text` o `varchar`.
*   **Propósito:** Almacenar el rol específico de cada empleado (ej. 'admin', 'gerente', 'usuario_normal', 'visualizador_kpi', etc.). Esto permite una definición granular de los permisos.
*   **Ventajas:**
    *   **Flexibilidad:** Permite definir un número N de roles, adaptándose fácilmente a futuros requisitos sin necesidad de reestructurar la base de datos de forma drástica.
    *   **Claridad:** Cada empleado tiene un rol explícito que puede ser consultado directamente.
    *   **Escalabilidad:** Compatible con sistemas de control de acceso más complejos si la aplicación crece.
    *   **Control Granular:** Permite asociar diferentes pantallas o funcionalidades a roles específicos de manera más intuitiva que con un solo flag booleano o un `puesto`.

### Siguientes Pasos Requeridos

1.  **Definir Roles Específicos:** El usuario debe especificar los nombres exactos de los roles que desea implementar. Por ejemplo:
    *   ¿Quiénes tendrán acceso al dashboard con KPIs?
    *   ¿Quiénes tendrán acceso a la segunda pantalla?
    *   ¿Habrá roles para usuarios con acceso básico a la aplicación sin estas pantallas adicionales?
2.  **Modificación de Esquema:** Una vez definidos los roles, se realizará la modificación de la tabla `public.empleados` para añadir la columna `role` y se actualizarán los datos existentes con un rol por defecto si es necesario.
3.  **Implementación en el Frontend:** Utilizar el `role` obtenido en el `empleadoProfile` para la renderización condicional de las nuevas pantallas y funcionalidades en `App.jsx`.