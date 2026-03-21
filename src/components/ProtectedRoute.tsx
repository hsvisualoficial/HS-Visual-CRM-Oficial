import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Timeout para evitar "tela preta" infinita
    const timeout = setTimeout(() => {
      if (isAuthenticated === null) {
        console.warn('Timeout de autenticação atingido. Redirecionando para login.');
        setIsAuthenticated(false);
      }
    }, 3500);

    // Quick local session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Temporarily allowing access if user hasn't configured Supabase yet
      if (!import.meta.env.VITE_SUPABASE_URL) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(!!session);
      }
      clearTimeout(timeout);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (import.meta.env.VITE_SUPABASE_URL) {
        setIsAuthenticated(!!session);
      }
      clearTimeout(timeout);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#B9FF66] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
