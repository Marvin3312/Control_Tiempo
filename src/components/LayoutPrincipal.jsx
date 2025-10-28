import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function LayoutPrincipal() {
  const { perfilEmpleado, handleLogout, role } = useAuth();

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f4f4f4' }}>
        <div>
          <span>¡Hola, {perfilEmpleado?.nombrecompleto}! (Rol: {role})</span>
        </div>
        <nav>
          <Link to="/" style={{ marginRight: '10px' }}>Hoja de Tiempo</Link>
          {(role === 'admin' || role === 'tecnico') && (
            <Link to="/dashboard" style={{ marginRight: '10px' }}>Dashboard</Link>
          )}
          {(role === 'admin' || role === 'tecnico' || role === 'gerente') && (
            <Link to="/reportes" style={{ marginRight: '10px' }}>Reportes</Link>
          )}
        </nav>
        <div>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default LayoutPrincipal;
