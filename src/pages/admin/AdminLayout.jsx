import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout() {
  const location = useLocation();
  return (
    <div className="d-flex admin-layout">
      <nav className="admin-sidebar">
        <h4 className="px-3 py-2">Administración</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink to="/admin/clientes" className="nav-link">Clientes</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/proyectos" className="nav-link">Proyectos</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/tareas" className="nav-link">Tareas</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/unified-form-test" className="nav-link">Formulario</NavLink>
          </li>
        </ul>
        <hr />
        <h4 className="px-3 py-2">Sistema de repote</h4>
        <ul className="nav flex-column">
            <li className="nav-item">
                <NavLink to="/" className="nav-link">Hoja Tiempo</NavLink>
            </li> 
            <li className="nav-item">
                <NavLink to="/panel-de-control" className="nav-link">Dashboard</NavLink>
            </li>
        </ul>
      </nav>
      <main className="admin-content">
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}