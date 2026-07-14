import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Users, Briefcase, CheckSquare, User, FileText, Clock, LayoutDashboard } from 'lucide-react';
import './AdminLayout.css';

export default function AdminLayout() {
  const location = useLocation();
  return (
    <div className="d-flex admin-layout">
      <nav className="admin-sidebar">
        <h4 className="px-3 py-2">Administración</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink to="/admin/clientes" className="nav-link d-flex align-items-center gap-2"><Briefcase size={18} /> Clientes</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/proyectos" className="nav-link d-flex align-items-center gap-2"><FileText size={18} /> Proyectos</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/tareas" className="nav-link d-flex align-items-center gap-2"><CheckSquare size={18} /> Tareas</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/empleados" className="nav-link d-flex align-items-center gap-2"><Users size={18} /> Empleados</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/unified-form-test" className="nav-link d-flex align-items-center gap-2"><FileText size={18} /> Formulario</NavLink>
          </li>
        </ul>
        <hr />
        <h4 className="px-3 py-2">Sistema de reporte</h4>
        <ul className="nav flex-column">
            <li className="nav-item">
                <NavLink to="/" className="nav-link d-flex align-items-center gap-2"><Clock size={18} /> Hoja Tiempo</NavLink>
            </li> 
            <li className="nav-item">
                <NavLink to="/panel-de-control" className="nav-link d-flex align-items-center gap-2"><LayoutDashboard size={18} /> Dashboard</NavLink>
            </li>
        </ul>
      </nav>
      <main className="admin-content">
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}