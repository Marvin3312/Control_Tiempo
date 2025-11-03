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

// Admin Page Imports
import GestionClientes from './pages/admin/GestionClientes';
import GestionProyectos from './pages/admin/GestionProyectos';
import GestionTareas from './pages/admin/GestionTareas';

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
            <Route path="clientes" element={<GestionClientes />} />
            <Route path="proyectos" element={<GestionProyectos />} />
            <Route path="tareas" element={<GestionTareas />} />
          </Route>

          {/* Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}