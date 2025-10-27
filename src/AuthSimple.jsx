// src/AuthSimple.jsx
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Notification } from './components/Notification';

export default function AuthSimple() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  function showNotification(message, type) {
    setNotification({ message, type });
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      showNotification('¡Revisa tu correo para el enlace de inicio de sesión!', 'success');
    } catch (error) {
      showNotification(error.error_description || error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ message: '', type: '' })} 
        />
        <h1 className="text-center mb-4">Iniciar Sesión</h1>
        <p className="text-center mb-4">Ingresa tu email para recibir un enlace mágico de inicio de sesión.</p>
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
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? <span>Cargando...</span> : <span>Enviar enlace</span>}
          </button>
        </form>
      </div>
    </div>
  );
}