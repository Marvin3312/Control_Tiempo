import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [perfilEmpleado, setPerfilEmpleado] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPerfilEmpleado = async () => {
      if (session?.user) {
        setLoadingProfile(true);
        const { data, error } = await supabase
          .from('empleados')
          .select('*, puestos(nombrepuesto), departamentos(nombredepto)')
          .eq('usuario_id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching empleado profile:', error);
          setPerfilEmpleado(null);
          setRole(null);
        } else {
          setPerfilEmpleado(data);
          if (data.puestos) {
            setRole(data.puestos.nombrepuesto);
          }
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
    handleLogout: () => supabase.auth.signOut(),
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
