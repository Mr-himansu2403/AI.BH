import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatAPI = {
  sendMessage: async (message, sessionId) => {
    const response = await api.post('/aibh/chat', {
      message,
      sessionId,
      messageType: 'TEXT'
    });
    return response.data;
  },

  sendImageMessage: async (message, imageUrl, sessionId) => {
    const response = await api.post('/aibh/chat/image', {
      message,
      imageUrl,
      sessionId,
      messageType: 'IMAGE'
    });
    return response.data;
  },

  getChatHistory: async (sessionId) => {
    const response = await api.get(`/aibh/chat/history?sessionId=${sessionId}`);
    return response.data;
  },

  clearChatHistory: async (sessionId) => {
    await api.delete(`/aibh/chat/history?sessionId=${sessionId}`);
  },

  healthCheck: async () => {
    const response = await api.get('/aibh/health');
    return response.data;
  }
};

export default api;