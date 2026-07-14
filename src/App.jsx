import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';

// Page Imports
import HojaDeTiempo from './pages/HojaDeTiempo';
import Login from './pages/Login';
import AccesoDenegado from './pages/AccesoDenegado';
import NotFound from './pages/NotFound';
import DashboardKPIs from './pages/DashboardKPIs';
import Reportes from './pages/Reportes';
import PanelDeControl from './pages/PanelDeControl';

// Layout Imports
import LayoutPrincipal from './components/layout/LayoutPrincipal';
import AdminLayout from './pages/admin/AdminLayout';
import RutaProtegida from './components/auth/RutaProtegida';
import RutaProtegidaAdmin from './components/auth/RutaProtegidaAdmin';
import RutaProtegidaManager from './components/auth/RutaProtegidaManager';

// Admin Pages — solo los que permanecen independientes
import GestionClientes from './pages/admin/GestionClientes';   // Incluye Proyectos y Tareas
import GestionEmpleados from './pages/admin/GestionEmpleados';
import Auditoria from './pages/admin/Auditoria';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/acceso-denegado" element={<AccesoDenegado />} />

          {/* Main App Routes */}
          <Route
            path="/"
            element={
              <RutaProtegida>
                <LayoutPrincipal />
              </RutaProtegida>
            }
          >
            <Route index element={<HojaDeTiempo />} />
            <Route path="dashboard" element={<DashboardKPIs />} />
            <Route path="reportes" element={<Reportes />} />
          </Route>

          {/* Manager Routes */}
          <Route element={
            <RutaProtegidaManager>
              <LayoutPrincipal />
            </RutaProtegidaManager>
          }>
            <Route path="panel-de-control" element={<PanelDeControl />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RutaProtegidaAdmin>
                <AdminLayout />
              </RutaProtegidaAdmin>
            }
          >
            <Route index element={<Navigate to="clientes" replace />} />
            {/* Clientes unifica Proyectos y Tareas en una sola vista jerárquica */}
            <Route path="clientes" element={<GestionClientes />} />
            <Route path="empleados" element={<GestionEmpleados />} />
            <Route path="auditoria" element={<Auditoria />} />
          </Route>

          {/* Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
