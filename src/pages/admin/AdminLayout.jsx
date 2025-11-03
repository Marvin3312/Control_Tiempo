import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout() {
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
          {/* Add other admin links here */}
        </ul>
      </nav>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}