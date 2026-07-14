import React, { useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

function LayoutPrincipal() {
  const { perfilEmpleado, handleLogout, role } = useAuth();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container-fluid px-4">
          <Link className="navbar-brand fw-bold" to="/" style={{ color: 'var(--color-primary)' }}>GestiónCo</Link>
          <button className="navbar-toggler" type="button" onClick={handleNavCollapse} aria-expanded={!isNavCollapsed} aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link text-body" to="/">Hoja de Tiempo</NavLink>
              </li>
              
              {(role === 'admin' || role === 'RRHH') && (
                <li className="nav-item">
                  <NavLink className="nav-link text-body" to="/panel-de-control">Panel de control</NavLink>
                </li>
              )}
              
              {role === 'admin' && (
                 <li className="nav-item">
                  <NavLink className="nav-link text-body" to="/admin">Administración</NavLink>
                </li>
              )}
            </ul>
            <span className="navbar-text me-4 fw-medium text-body">
              {perfilEmpleado?.nombrecompleto}!
            </span>
            <button className="btn btn-secondary btn-sm px-3 py-2" onClick={handleLogout}>Cerrar sesión</button>
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
