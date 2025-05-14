import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const { token, expiresAt } = JSON.parse(storedToken);
        if (expiresAt > new Date().getTime()) {
          setToken(token);
          setIsAuthenticated(true);
        } else {
          logout();
        }
      } catch (e) {
        console.error('Error parsing token from localStorage:', e);
        logout();
      }
    }
  }, []);

  // Check token expiration periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const { expiresAt } = JSON.parse(storedToken);
          if (expiresAt <= new Date().getTime()) {
            logout();
          }
        } catch (e) {
          console.error('Error checking token expiration:', e);
          logout();
        }
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const login = (newToken, expiresIn = 3600) => { // Default to 1 hour if expiresIn is missing
    const tokenData = {
      token: newToken,
      expiresAt: new Date().getTime() + expiresIn * 1000,
    };
    localStorage.setItem('token', JSON.stringify(tokenData));
    setToken(newToken);
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Axios interceptor to add token to requests and handle 401 errors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Skip Authorization header for public endpoints
        if (
          token &&
          !config.url.includes('/api/categories') &&
          !config.url.includes('/api/products')
        ) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.error('Unauthorized access, logging out...');
          logout();
        } else if (error.response?.status === 403) {
          console.error('Forbidden: Insufficient permissions');
          error.message = 'You lack the required permissions (ROLE_ADMIN) for this action.';
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};