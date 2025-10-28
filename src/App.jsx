import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import HojaDeTiempo from './pages/HojaDeTiempo';
import Login from './pages/Login';
import AccesoDenegado from './pages/AccesoDenegado';
import NotFound from './pages/NotFound';
import LayoutPrincipal from './components/LayoutPrincipal';
import DashboardKPIs from './pages/DashboardKPIs';
import Reportes from './pages/Reportes';
import PanelDeControl from './pages/PanelDeControl';

function RutaProtegida({ children }) {
  const { session, perfilEmpleado, loadingProfile } = useAuth();

  if (loadingProfile) {
    return <div>Cargando perfil...</div>; 
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (!perfilEmpleado) {
    return <Navigate to="/acceso-denegado" />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/acceso-denegado" element={<AccesoDenegado />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}