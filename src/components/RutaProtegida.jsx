import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function RutaProtegida({ children, rolesPermitidos }) {
  const { session, perfilEmpleado, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!perfilEmpleado) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(role)) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  return children;
}

export default RutaProtegida;
