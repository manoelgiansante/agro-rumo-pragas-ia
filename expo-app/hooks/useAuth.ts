import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import * as authService from '../services/auth';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isAuthenticated: !!session,
        error: null,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session,
        isAuthenticated: !!session,
        isLoading: false,
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.signIn(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.signUp(email, password, fullName);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.signOut();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao sair';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.resetPassword(email);
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar email';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
  };
}
