import React from 'react';
import { useAuth } from '../AuthContext';

function AccesoDenegado() {
  const { session, handleLogout } = useAuth();

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Acceso Denegado</h2>
      <p>La cuenta <strong>{session?.user?.email}</strong> está autenticada pero no tiene permiso para acceder a este sistema.</p>
      <p>Por favor, contacte al administrador para enlazar su cuenta.</p>
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
}

export default AccesoDenegado;
