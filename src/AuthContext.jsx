import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [perfilEmpleado, setPerfilEmpleado] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        setSession(session);
        if (session) {
          const { data, error } = await supabase
            .from('empleados')
            .select('*, departamentos(nombredepto), puestos(nombrepuesto)')
            .eq('usuario_id', session.user.id)
            .single();
          if (error && error.code !== 'PGRST116') {
            console.error('Error buscando perfil:', error);
          }
          setPerfilEmpleado(data || null);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error getting session:", error);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const { data, error } = await supabase
          .from('empleados')
          .select('*, departamentos(nombredepto), puestos(nombrepuesto)')
          .eq('usuario_id', session.user.id)
          .single();
        if (error && error.code !== 'PGRST116') {
          console.error('Error buscando perfil:', error);
        }
        setPerfilEmpleado(data || null);
      } else {
        setPerfilEmpleado(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setPerfilEmpleado(null);
  }

  const value = {
    session,
    perfilEmpleado,
    loading,
    handleLogout,
    role: perfilEmpleado?.role,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}