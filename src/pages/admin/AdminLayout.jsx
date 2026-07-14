import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Users, Building2, Clock, LayoutDashboard, ShieldCheck } from 'lucide-react';
import './AdminLayout.css';

export default function AdminLayout() {
  const location = useLocation();
  return (
    <div className="d-flex admin-layout">
      <nav className="admin-sidebar">
        <p className="sidebar-section-title">Gestión</p>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink to="/admin/clientes" className="nav-link">
              <Building2 size={17} /> Clientes y Proyectos
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/empleados" className="nav-link">
              <Users size={17} /> Empleados
            </NavLink>
          </li>
        </ul>

        <hr />

        <p className="sidebar-section-title">Reportes</p>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink to="/" className="nav-link">
              <Clock size={17} /> Hoja de Tiempo
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/panel-de-control" className="nav-link">
              <LayoutDashboard size={17} /> Panel de Control
            </NavLink>
          </li>
        </ul>

        <hr />

        <p className="sidebar-section-title">Sistema</p>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink to="/admin/auditoria" className="nav-link">
              <ShieldCheck size={17} /> Auditoría
            </NavLink>
          </li>
        </ul>
      </nav>

      <main className="admin-content">
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}