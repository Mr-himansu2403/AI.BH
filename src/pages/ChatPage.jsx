import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import TypingIndicator from '../components/TypingIndicator';
import { chatAPI } from '../services/api';
import speechService from '../services/speechService';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setCurrentChatId(newSessionId);
    
    // Add welcome message
    const welcomeMessage = {
      id: 1,
      message: "Hello! I'm AI.BH, your intelligent assistant. I'm here to help you learn, build projects, and solve problems clearly and efficiently. How can I assist you today?",
      isUser: false,
      timestamp: new Date().toISOString()
    };
    
    setMessages([welcomeMessage]);
    
    // Speak welcome message if speech is supported
    setTimeout(() => {
      if (speechService.isSupported()) {
        speechService.speak(welcomeMessage.message);
      }
    }, 1000);
  };

  const generateSessionId = () => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText, imageData = null) => {
    if (!messageText && !imageData) return;

    const userMessage = {
      id: Date.now(),
      message: messageText,
      isUser: true,
      timestamp: new Date().toISOString(),
      imageUrl: imageData
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let response;
      if (imageData) {
        response = await chatAPI.sendImageMessage(messageText, imageData, sessionId);
      } else {
        response = await chatAPI.sendMessage(messageText, sessionId);
      }

      const aiMessage = {
        id: Date.now() + 1,
        message: response.response,
        isUser: false,
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update chat history
      updateChatHistory(sessionId, messageText, response.response);

      // Auto-speak AI response if speech is supported
      if (speechService.isSupported()) {
        setTimeout(() => {
          speechService.speak(response.response);
        }, 500);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage = {
        id: Date.now() + 1,
        message: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatHistory = (chatId, userMsg, aiMsg) => {
    setChatHistory(prev => {
      const existingChat = prev.find(chat => chat.id === chatId);
      if (existingChat) {
        return prev.map(chat => 
          chat.id === chatId 
            ? { ...chat, lastMessage: userMsg, updatedAt: new Date() }
            : chat
        );
      } else {
        return [...prev, {
          id: chatId,
          title: userMsg.length > 30 ? userMsg.substring(0, 30) + '...' : userMsg,
          lastMessage: userMsg,
          createdAt: new Date(),
          updatedAt: new Date()
        }];
      }
    });
  };

  const handleNewChat = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setCurrentChatId(newSessionId);
    setMessages([{
      id: 1,
      message: "New conversation started! How can I help you today?",
      isUser: false,
      timestamp: new Date().toISOString()
    }]);
  };

  const handleSelectChat = (chatId) => {
    // In a real app, you would load the chat history from the backend
    setCurrentChatId(chatId);
    setSessionId(chatId);
    setMessages([{
      id: 1,
      message: "Chat history loaded. How can I continue helping you?",
      isUser: false,
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-beige-50 via-white to-sand-50">
      {/* Sidebar */}
      <Sidebar
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border-b border-beige-200 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sand-500 to-sand-700 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-warm-900">AI.BH Assistant</h1>
                <p className="text-sm text-warm-600">
                  {isLoading ? 'Thinking...' : 'Ready to help'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-xs text-warm-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto chat-container">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {messages.length === 0 ? (
              // Empty State
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-sand-500 to-sand-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-warm-900 mb-4">
                  Welcome to AI.BH
                </h2>
                <p className="text-warm-600 mb-8 max-w-md mx-auto">
                  Your intelligent assistant is ready to help you learn, create, and solve problems. Start a conversation below!
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    "Explain a complex topic",
                    "Help with coding",
                    "Analyze an image",
                    "Creative writing"
                  ].map((suggestion, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSendMessage(suggestion)}
                      className="px-4 py-2 bg-beige-100 hover:bg-beige-200 text-warm-700 rounded-xl transition-colors border border-beige-300"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              // Messages
              <>
                {messages.map((msg, index) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg.message}
                    isUser={msg.isUser}
                    timestamp={msg.timestamp}
                    imageUrl={msg.imageUrl}
                    index={index}
                  />
                ))}
                
                <AnimatePresence>
                  {isLoading && <TypingIndicator />}
                </AnimatePresence>
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area */}
        <ChatInput 
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatPage;