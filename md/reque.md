¡Entendido\! Aquí tienes el plan de acción paso a paso para implementar esta nueva lógica de roles.

He actualizado las reglas de permisos basándome en tus últimas instrucciones:

| Rol | Hoja de Tiempo (Propia) | Dashboard (KPIs) | Reporte de Tiempo |
| :--- | :---: | :---: | :---: |
| `'admin'` | ✅ | ✅ | ✅ | (Asumimos que es igual a "tecnico")
| `'gerente'` | ✅ | ❌ | ✅ | (Ve "hoja" y "reporte")
| `'usuario'` | ✅ | ❌ | ❌ | (Solo ve "hoja")

-----

### Paso 1: (Prerrequisito) Verificar la Base de Datos

Confirma que tu tabla `public.empleados` ya tiene la columna `role`. Si no la has añadido, ejecuta este comando en tu Editor SQL de Supabase:

```sql
ALTER TABLE public.empleados
ADD COLUMN role text DEFAULT 'usuario';// confirmado
```

-----

### Paso 2: Crear los Componentes de Pantalla

Si aún no lo has hecho, crea estos archivos para las nuevas pantallas.

#### A. Archivo Nuevo: `src/DashboardKPIs.jsx`

```javascript
import React from 'react';

function DashboardKPIs() {
  return (
    <div style={{ padding: '20px', background: 'lightyellow', border: '1px solid #ccc', margin: '10px' }}>
      <h2>Dashboard de KPIs (Solo para Admin/Tecnico)</h2>
      {/* Aquí irá el contenido de tus gráficas y KPIs */}
    </div>
  );
}

export default DashboardKPIs;
```

#### B. Archivo Nuevo: `src/Reportes.jsx`

```javascript
import React from 'react';

function Reportes() {
  return (
    <div style={{ padding: '20px', background: 'lightblue', border: '1px solid #ccc', margin: '10px' }}>
      <h2>Pantalla de Reportes (Solo para Admin/Tecnico/Gerente)</h2>
      {/* Aquí irá el contenido de tu pantalla de reportes */}
    </div>
  );
}

export default Reportes;
```

-----

### Paso 3: Implementar el "Guardia de Roles" en `App.jsx`

Esta es la instrucción principal. Reemplaza todo el contenido de tu archivo `src/App.jsx` con este código. Ya tiene la nueva lógica de roles implementada.

```javascript
import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import HojaDeTiempo from './HojaDeTiempo'
import AuthSimple from './AuthSimple'

// 1. IMPORTAMOS LAS NUEVAS PANTALLAS
import DashboardKPIs from './DashboardKPIs'
import Reportes from './Reportes'

// --- Componente de Acceso Denegado (sin cambios) ---
function AccesoDenegado({ email, onLogout }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Acceso Denegado</h2>
      <p>La cuenta <strong>{email}</strong> está autenticada pero no tiene permiso para acceder a este sistema.</p>
      <p>Por favor, contacte al administrador para enlazar su cuenta.</p>
      <button onClick={onLogout}>Cerrar Sesión</button>
    </div>
  )
}

// --- Componente Principal de la App (con Lógica de Roles) ---
function App() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [perfilEmpleado, setPerfilEmpleado] = useState(null) 

  // ... (useEffect para getSession - sin cambios) ...
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (!session) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (!session) {
          setPerfilEmpleado(null)
          setLoading(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])


  // 2. useEffect del "Guardia de Seguridad" (sin cambios)
  // Esta función ya trae el perfil completo, INCLUYENDO la columna 'role'
  useEffect(() => {
    if (session) {
      getPerfilEmpleado(session.user.id)
    }
  }, [session])

  async function getPerfilEmpleado(usuarioId) {
    setLoading(true)
    
    // Esta consulta ya trae el '*' (que incluye 'role')
    const { data, error } = await supabase
      .from('empleados')
      .select('*, departamentos(nombredepto), puestos(nombrepuesto)')
      .eq('usuario_id', usuarioId) 
      .single() 

    if (error && error.code !== 'PGRST116') {
      console.error('Error buscando perfil:', error)
    }
    
    if (data) {
      setPerfilEmpleado(data)
    } else {
      setPerfilEmpleado(null)
    }
    
    setLoading(false)
  }

  // ... (función handleLogout - sin cambios) ...
  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
    setSession(null)
    setPerfilEmpleado(null)
  }

  // --- 3. RENDERIZADO SEGURO (CON LÓGICA DE ROLES) ---

  if (loading) {
    return <p>Cargando...</p>
  }

  // 1. Si NO hay sesión...
  if (!session) {
    return <AuthSimple />
  }

  // 2. Si SÍ hay sesión, pero NO hay perfil de empleado...
  if (session && !perfilEmpleado) {
    return <AccesoDenegado email={session.user.email} onLogout={handleLogout} />
  }

  // 3. ¡AQUÍ ESTÁ LA NUEVA LÓGICA!
  //    Si SÍ hay sesión Y SÍ hay perfil de empleado...
  if (session && perfilEmpleado) {
    
    // Guardamos el rol para que sea fácil de leer
    const userRole = perfilEmpleado.role; 
    
    return (
      <div>
        <header style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f4f4f4' }}>
          <span>¡Hola, {perfilEmpleado.nombrecompleto}! (Rol: {userRole})</span>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </header>
        
        {/* --- PANTALLAS CONDICIONALES --- */}

        {/* Regla: Mostrar Dashboard si el rol es 'admin' O 'tecnico'
        */}
        {(userRole === 'admin' || userRole === 'tecnico') && (
          <DashboardKPIs />
        )}

        {/* Regla: Mostrar Reportes si el rol es 'admin' O 'tecnico' O 'gerente'
        */}
        {(userRole === 'admin' || userRole === 'tecnico' || userRole === 'gerente') && (
          <Reportes />
        )}

        {/* Regla: TODOS los roles validados pueden ver su hoja de tiempo
        */}
        <main>
          <HojaDeTiempo perfilEmpleado={perfilEmpleado} />
        </main>

      </div>
    )
  }
}

export default App
```

-----

### Paso 4: (Manual) Asignar los Roles en la Base de Datos

El código ya está listo. Ahora, tú como administrador debes **asignar los roles** a tus empleados en la base de datos (ya que por defecto, todos son `'usuario'`).

Ve a tu **Table Editor** en Supabase, abre la tabla `empleados` y cambia el valor de la columna `role` para los empleados que quieras:

  * Ponle `'gerente'` a los gerentes.
  * Ponle `'tecnico'` a tu propia cuenta de desarrollador.
  * Ponle `'admin'` a quien lo necesite.

O puedes hacerlo con un comando SQL:

```sql
-- Ejemplo: Asigna el rol 'tecnico' a tu empleado
UPDATE public.empleados
SET role = 'tecnico'
WHERE empleadoid = 59; -- (O el ID de tu empleado)

-- Ejemplo: Asigna el rol 'gerente' a un gerente
UPDATE public.empleados
SET role = 'gerente'
WHERE nombrecompleto = 'Carlos Humberto Ruiz';
```

¡Eso es todo\! Al recargar la aplicación, el `App.jsx` leerá el rol asignado y mostrará las pantallas correctas.