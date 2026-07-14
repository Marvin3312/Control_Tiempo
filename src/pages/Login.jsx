import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Notification } from '../components/common/Notification';
import api from '../api';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  
  const from = location.state?.from?.pathname || "/";

  function showNotification(message, type) {
    setNotification({ message, type });
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', data.token);
      setSession({ access_token: data.token });
      
      showNotification('Inicio de sesión exitoso', 'success');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (error) {
      showNotification(error.message || 'Error al iniciar sesión', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ message: '', type: '' })} 
        />
        <h1 className="text-center mb-4">Iniciar Sesión</h1>
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
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="passwordInput" className="form-label">Contraseña</label>
            <input
              id="passwordInput"
              className="form-control"
              type="password"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 d-inline-flex justify-content-center align-items-center gap-2" disabled={loading}>
            {loading ? 'Cargando...' : <><LogIn size={18} /> Entrar</>}
          </button>
        </form>
      </div>
    </div>
  );
}