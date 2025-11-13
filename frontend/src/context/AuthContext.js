import React, { useState, useContext, createContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Initialize axios interceptors
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Fetch user data on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          const response = await axios.get('/auth/me');
          setUser(response.data.user);
          setToken(savedToken);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          // If token is invalid, clear it
          localStorage.removeItem('token');
          setToken(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Set authorization header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (studentId, email, password, fullName, role, studentCourse, major) => {
    setLoading(true);
    console.log('🔄 Attempting registration with:', { studentId, email, fullName, role, course: studentCourse, major });
    try {
      const response = await axios.post('/auth/register', {
        studentId,
        email,
        password,
        fullName,
        role,
        course: studentCourse,
        major
      });
      console.log('✅ Registration response:', response.data);
      // Don't auto-login after registration - user should login manually
      // const { token, user } = response.data;
      // setToken(token);
      // setUser(user);
      // localStorage.setItem('token', token);
      // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error);
      throw error.response?.data || { message: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshUser = async () => {
    try {
      const response = await axios.get('/auth/me');
      setUser({ ...response.data.user }); // Create new object reference
      return response.data.user;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
