import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const chatAPI = {
  sendMessage: async (message, sessionId) => {
    try {
      const response = await api.post('/aibh/chat', {
        message,
        sessionId,
        messageType: 'TEXT'
      });
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  streamMessage: async (message, sessionId, onChunk) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/aibh/chat/stream?message=${encodeURIComponent(message)}${sessionId ? `&sessionId=${sessionId}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Streaming failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // SSE format is "data: content\n\n"
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.slice(5).trim();
          if (data === '[ERROR]') {
            throw new Error('AI generation error');
          }
          onChunk(data);
        }
      }
    }
  },

  sendImageMessage: async (message, imageUrl, sessionId) => {
    try {
      const response = await api.post('/aibh/chat/image', {
        message,
        imageUrl,
        sessionId,
        messageType: 'IMAGE'
      });
      return response.data;
    } catch (error) {
      console.error('Send image message error:', error);
      throw error;
    }
  },

  getChatHistory: async (sessionId) => {
    try {
      const response = await api.get(`/aibh/chat/history?sessionId=${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Get chat history error:', error);
      throw error;
    }
  },

  clearChatHistory: async (sessionId) => {
    try {
      await api.delete(`/aibh/chat/history?sessionId=${sessionId}`);
    } catch (error) {
      console.error('Clear chat history error:', error);
      throw error;
    }
  },

  uploadDocument: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/aibh/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  },

  healthCheck: async () => {
    try {
      const response = await api.get('/aibh/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }
};

export default api;