import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, AuthState } from '../types';

type AuthContextType = {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Base URL for your API (replace with your actual backend URL)
const API_BASE_URL = 'http://localhost:3001/api/auth'; // Example: if your backend runs on port 3001

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem('watchbox_token');
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setAuthState({
              user: data.user, // Assuming API returns user data under 'user' key
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token might be invalid or expired
            localStorage.removeItem('watchbox_token');
            localStorage.removeItem('watchbox_user'); // Clear old user data if any
            setAuthState({ ...initialAuthState, isLoading: false });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setAuthState({ ...initialAuthState, isLoading: false });
        }
      } else {
        setAuthState({ ...initialAuthState, isLoading: false });
      }
    };

    checkLoggedInUser();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('watchbox_token', data.token); // Assuming API returns JWT in 'token'
      localStorage.setItem('watchbox_user', JSON.stringify(data.user)); // Store user separately or derive from token
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message }));
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }
      
      localStorage.setItem('watchbox_token', data.token);
      localStorage.setItem('watchbox_user', JSON.stringify(data.user));
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message }));
      throw error;
    }
  };

  const logout = async () => { // Made async to potentially call a backend logout endpoint
    setAuthState(prev => ({ ...prev, isLoading: true }));
    // Optional: Call a backend endpoint to invalidate the token server-side
    // try {
    //   const token = localStorage.getItem('watchbox_token');
    //   if (token) {
    //     await fetch(`${API_BASE_URL}/logout`, {
    //       method: 'POST',
    //       headers: { 'Authorization': `Bearer ${token}` },
    //     });
    //   }
    // } catch (error) {
    //   console.error('Logout API error:', error);
    //   // Still proceed with client-side logout
    // }

    localStorage.removeItem('watchbox_token');
    localStorage.removeItem('watchbox_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};