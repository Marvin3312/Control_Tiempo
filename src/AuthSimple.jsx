// src/AuthSimple.jsx
import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function AuthSimple() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('¡Revisa tu correo para el enlace de inicio de sesión!');
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-6">
        <h1>Iniciar Sesión</h1>
        <p>Ingresa tu email para recibir un enlace mágico de inicio de sesión.</p>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label">Email</label>
            <input
              id="emailInput"
              className="form-control"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span>Cargando...</span> : <span>Enviar enlace</span>}
          </button>
        </form>
      </div>
    </div>
  );
}