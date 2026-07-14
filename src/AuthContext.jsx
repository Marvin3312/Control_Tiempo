import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [perfilEmpleado, setPerfilEmpleado] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setSession({ access_token: token });
      }
      setLoading(false);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const fetchPerfilEmpleado = async () => {
      if (session) {
        setLoadingProfile(true);
        try {
          const res = await fetch('http://localhost:3000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          if (!res.ok) throw new Error('Invalid session');
          const data = await res.json();
          setPerfilEmpleado(data);
          setRole(data.role || 'usuario');
        } catch (error) {
          console.error('Error fetching empleado profile:', error);
          setPerfilEmpleado(null);
          setRole(null);
          localStorage.removeItem('token');
          setSession(null);
        }
        setLoadingProfile(false);
      } else {
        setPerfilEmpleado(null);
        setRole(null);
      }
    };

    fetchPerfilEmpleado();
  }, [session]);

  const value = {
    session,
    perfilEmpleado,
    role,
    loadingProfile,
    setSession,
    handleLogout: () => {
      localStorage.removeItem('token');
      setSession(null);
      setPerfilEmpleado(null);
      setRole(null);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
