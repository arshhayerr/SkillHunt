import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only load user data from localStorage (cookie is handled by browser)
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // No need to store token - it's in httpOnly cookie!
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    // Call backend to clear the httpOnly cookie
    try {
      await fetch(import.meta.env.VITE_API_URL?.replace('/api', '/api/auth/logout') || 'http://localhost:4000/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // Send cookie
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return !!user; // Token is in cookie, just check if user exists
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};