import React from 'react';
import { Link } from 'react-router-dom';

function NoEncontrado() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>404 - Página No Encontrada</h2>
      <p>La página que buscas no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
}

export default NoEncontrado;
