import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const authAPI = {
  login: async (email, password) => {
    // For demo purposes, we'll simulate authentication
    // In a real app, this would call your backend auth endpoint
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const mockUser = {
            id: 1,
            name: email.split('@')[0],
            email: email,
            avatar: null
          };
          const mockToken = 'mock-jwt-token-' + Date.now();
          
          resolve({
            token: mockToken,
            user: mockUser
          });
        } else {
          reject({
            response: {
              data: {
                message: 'Invalid credentials'
              }
            }
          });
        }
      }, 1000);
    });
  },

  signup: async (name, email, password) => {
    // For demo purposes, we'll simulate signup
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (name && email && password) {
          const mockUser = {
            id: Date.now(),
            name: name,
            email: email,
            avatar: null
          };
          const mockToken = 'mock-jwt-token-' + Date.now();
          
          resolve({
            token: mockToken,
            user: mockUser
          });
        } else {
          reject({
            response: {
              data: {
                message: 'All fields are required'
              }
            }
          });
        }
      }, 1000);
    });
  },

  logout: async () => {
    // In a real app, you might want to invalidate the token on the server
    return Promise.resolve();
  }
};

export { authAPI };