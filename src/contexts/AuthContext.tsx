import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signInAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
  signInAsGuest: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to construct guest session
  const getMockUser = () => ({
    id: 'admin-user-id',
    email: 'boshqahramon0@gmail.com',
    email_confirmed_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  } as any);

  useEffect(() => {
    // Check if user previously logged in as guest
    const isGuest = localStorage.getItem('is_guest_user') === 'true';
    
    if (isGuest) {
      const mockUser = getMockUser();
      setSession({
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: mockUser
      } as any);
      setUser(mockUser);
      setIsLoading(false);
    } else {
      // Current sessionni olish
      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          if (session) {
            setSession(session);
            setUser(session.user);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn('Supabase getSession failed, falling back to mock user profile:', err);
          const mockUser = getMockUser();
          setSession({
            access_token: 'mock-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh-token',
            user: mockUser
          } as any);
          setUser(mockUser);
          setIsLoading(false);
        });
    }

    // Auth holati o'zgarishini tinglash (login, logout)
    let subscription: any = null;
    try {
      const res = supabase.auth.onAuthStateChange((_event, session) => {
        if (localStorage.getItem('is_guest_user') !== 'true') {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
      });
      subscription = res.data?.subscription;
    } catch (err) {
      console.warn('Supabase onAuthStateChange failed:', err);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signInAsGuest = () => {
    localStorage.setItem('is_guest_user', 'true');
    const mockUser = getMockUser();
    setSession({
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: mockUser
    } as any);
    setUser(mockUser);
  };

  const signOut = async () => {
    localStorage.removeItem('is_guest_user');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout failed, clearing local state anyway:', e);
    }
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signOut, signInAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
