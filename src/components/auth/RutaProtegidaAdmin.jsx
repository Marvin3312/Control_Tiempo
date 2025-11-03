import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

export default function RutaProtegidaAdmin({ children }) {
  const { session, perfilEmpleado, loadingProfile, role } = useAuth();

  if (loadingProfile) {
    return <div>Cargando perfil...</div>; 
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (!perfilEmpleado) {
    // This can happen if the user is logged in but has no employee profile
    return <Navigate to="/acceso-denegado" />;
  }

  if (role !== 'admin') {
    return <Navigate to="/acceso-denegado" />;
  }

  return children;
}