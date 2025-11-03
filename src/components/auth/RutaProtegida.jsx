import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

export default function RutaProtegida({ children }) {
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