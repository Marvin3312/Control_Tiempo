import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

export default function RutaProtegidaManager({ children }) {
  const { session, perfilEmpleado, loadingProfile, role } = useAuth();

  if (loadingProfile) {
    return <div>Cargando perfil...</div>; 
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (!perfilEmpleado) {
    return <Navigate to="/acceso-denegado" />;
  }

  if (role !== 'admin' && role !== 'RRHH') {
    return <Navigate to="/acceso-denegado" />;
  }

  return children;
}
