import React, { useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

function LayoutPrincipal() {
  const { perfilEmpleado, handleLogout, role } = useAuth();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="container-fluid">
          <Link className="navbar-brand" to="/" style={{ color: 'var(--color-white)' }}>GestiónCo</Link>
          <button className="navbar-toggler" type="button" onClick={handleNavCollapse} aria-expanded={!isNavCollapsed} aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link" to="/" style={{ color: 'var(--color-white)' }}>Hoja de Tiempo</NavLink>
              </li>
              
              {(role === 'admin' || role === 'tecnico') && (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/panel-de-control" style={{ color: 'var(--color-white)' }}>Panel de control</NavLink>
                </li>
              )}
              
              {role === 'admin' && (
                 <li className="nav-item">
                  <NavLink className="nav-link" to="/admin" style={{ color: 'var(--color-white)' }}>Administración</NavLink>
                </li>
              )}
            </ul>
            <span className="navbar-text me-3" style={{ color: 'var(--color-white)' }}>
              ¡Hola, {perfilEmpleado?.nombrecompleto}!
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default LayoutPrincipal;
