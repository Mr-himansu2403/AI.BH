import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const authAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authAPI = {
  login: async (email, password) => {
    try {
      const response = await authAxios.post('/auth/login', {
        email,
        password
      });
      
      const { token, refreshToken, user } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          avatar: null
        }
      };
    } catch (error) {
      throw {
        response: {
          data: {
            message: error.response?.data?.message || 'Login failed'
          }
        }
      };
    }
  },

  signup: async (firstName, lastName, email, password) => {
    try {
      const response = await authAxios.post('/auth/signup', {
        firstName,
        lastName,
        email,
        password
      });
      
      const { token, refreshToken, user } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          avatar: null
        }
      };
    } catch (error) {
      throw {
        response: {
          data: {
            message: error.response?.data?.message || 'Signup failed'
          }
        }
      };
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await authAxios.post('/auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAxios.post('/auth/refresh', {
        refreshToken
      });

      const { token, refreshToken: newRefreshToken } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      return token;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token available');
      }

      const response = await authAxios.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const user = response.data;
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        avatar: null
      };
    } catch (error) {
      throw error;
    }
  }
};

export { authAPI };