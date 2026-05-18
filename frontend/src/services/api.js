import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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
        'Accept': 'text/event-stream',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      let failureReason = 'Streaming failed';
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const payload = await response.json();
          failureReason = payload.message || payload.error || failureReason;
        } else {
          const text = await response.text();
          if (text.trim()) {
            failureReason = text.trim();
          }
        }
      } catch (error) {
        console.error('Failed to parse stream error response:', error);
      }

      throw new Error(failureReason);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';

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

    const trailingLine = buffer.trim();
    if (trailingLine.startsWith('data:')) {
      const data = trailingLine.slice(5).trim();
      if (data === '[ERROR]') {
        throw new Error('AI generation error');
      }
      onChunk(data);
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

  getConversations: async () => {
    try {
      const response = await api.get('/aibh/chat/conversations');
      return response.data;
    } catch (error) {
      console.error('Get conversations error:', error);
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
      throw new Error(error.response?.data?.message || 'Document upload failed');
    }
  },

  healthCheck: async () => {
    try {
      const response = await api.get('/aibh/health');
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      console.error('Health check error:', error);
      throw error;
    }
  }
};

export default api;
