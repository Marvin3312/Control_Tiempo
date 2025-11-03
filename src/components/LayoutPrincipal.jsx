import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function LayoutPrincipal() {
  const { perfilEmpleado, handleLogout, role } = useAuth();

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">GestiónCo</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">Hoja de Tiempo</NavLink>
              </li>
              
              {(role === 'admin' || role === 'tecnico') && (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/panel-de-control">Panel de control</NavLink>
                </li>
              )}
              
              {role === 'admin' && (
                 <li className="nav-item">
                  <NavLink className="nav-link" to="/admin">Administración</NavLink>
                </li>
              )}
            </ul>
            <span className="navbar-text me-3">
              ¡Hola, {perfilEmpleado?.nombrecompleto}!
            </span>
            <button className="btn btn-outline-secondary" onClick={handleLogout}>Cerrar sesión</button>
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
