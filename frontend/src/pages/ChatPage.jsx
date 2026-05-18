import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import TypingIndicator from '../components/TypingIndicator';
import ArtifactPanel from '../components/ArtifactPanel';
import { chatAPI } from '../services/api';
import speechService from '../services/speechService';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [serviceHealth, setServiceHealth] = useState(null);
  const [healthMessage, setHealthMessage] = useState('Checking AI service status...');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const mapConversationSummaries = useCallback((conversations) => (
    conversations.map((chat) => ({
      id: chat.sessionId,
      title: chat.title,
      lastMessage: chat.lastMessage,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }))
  ), []);

  const generateSessionId = useCallback(() => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }, []);

  const hydrateMessages = useCallback((history) => {
    const hydrated = [];

    history.forEach((entry) => {
      if (entry.userMessage) {
        hydrated.push({
          id: `${entry.id}-user`,
          message: entry.userMessage,
          isUser: true,
          timestamp: entry.createdAt,
          imageUrl: entry.imageUrl || null
        });
      }

      if (entry.aiResponse) {
        hydrated.push({
          id: `${entry.id}-ai`,
          message: entry.aiResponse,
          isUser: false,
          timestamp: entry.createdAt
        });
      }
    });

    return hydrated;
  }, []);

  const loadConversation = useCallback(async (chatId) => {
    setIsLoadingHistory(true);
    try {
      const history = await chatAPI.getChatHistory(chatId);
      setCurrentChatId(chatId);
      setSessionId(chatId);
      setMessages(hydrateMessages(history));
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Failed to load conversation history.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [hydrateMessages]);

  const initializeChat = useCallback(() => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setCurrentChatId(newSessionId);
    
    // Add welcome message
    const welcomeMessage = {
      id: 1,
      message: "Welcome to AI.BH. I am your professional assistant. How can I help you today?",
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
  }, [generateSessionId]);

  const bootstrapChat = useCallback(async () => {
    try {
      const conversations = await chatAPI.getConversations();
      const mappedConversations = mapConversationSummaries(conversations);
      setChatHistory(mappedConversations);

      if (mappedConversations.length > 0) {
        await loadConversation(mappedConversations[0].id);
        return;
      }
    } catch (error) {
      console.error('Failed to bootstrap conversations:', error);
    }

    initializeChat();
  }, [loadConversation, mapConversationSummaries, initializeChat]);

  const checkHealth = useCallback(async () => {
    try {
      const health = await chatAPI.healthCheck();
      setServiceHealth(health);
      setHealthMessage(health.message || 'Service status updated.');
    } catch (error) {
      setServiceHealth({
        status: 'DOWN',
        checks: {},
        message: 'Backend is unreachable. Check API deployment and network access.'
      });
      setHealthMessage('Backend is unreachable. Check API deployment and network access.');
    }
  }, []);

  useEffect(() => {
    bootstrapChat();
    checkHealth();
    const intervalId = setInterval(checkHealth, 30000);
    return () => clearInterval(intervalId);
  }, [bootstrapChat, checkHealth]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const refreshConversations = async () => {
    try {
      const conversations = await chatAPI.getConversations();
      setChatHistory(mapConversationSummaries(conversations));
    } catch (error) {
      console.error('Failed to refresh conversations:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateChatHistory = useCallback((chatId, userMsg) => {
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
  }, []);

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
      if (serviceHealth?.status === 'DOWN') {
        toast.error(serviceHealth?.message || 'Backend is unavailable right now.');
      } else if (serviceHealth?.status === 'DEGRADED') {
        toast(serviceHealth?.message || 'AI provider is degraded. Attempting fallback response.');
      }

      if (imageData) {
        const response = await chatAPI.sendImageMessage(messageText, imageData, sessionId);
        const aiMessage = {
          id: Date.now() + 1,
          message: response.response,
          isUser: false,
          timestamp: response.timestamp
        };
        setMessages(prev => [...prev, aiMessage]);
        updateChatHistory(sessionId, messageText);
        await refreshConversations();
        if (speechService.isSupported()) {
          setTimeout(() => speechService.speak(response.response), 500);
        }
      } else {
        // Streaming for text messages
        const aiMessageId = Date.now() + 1;
        const initialAiMessage = {
          id: aiMessageId,
          message: '',
          isUser: false,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, initialAiMessage]);
        
        let fullResponse = '';
        try {
          await chatAPI.streamMessage(messageText, sessionId, (chunk) => {
            fullResponse += chunk;
            setMessages(prev => prev.map(msg => 
              msg.id === aiMessageId ? { ...msg, message: fullResponse } : msg
            ));
          });
        } catch (streamError) {
          console.error('Streaming failed, falling back to standard response:', streamError);
          const response = await chatAPI.sendMessage(messageText, sessionId);
          fullResponse = response.response || response.error || 'The assistant could not generate a response.';
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessageId ? { ...msg, message: fullResponse } : msg
          ));
          if (streamError?.message) {
            toast.error(`Streaming failed: ${streamError.message}`);
          }
        }

        updateChatHistory(sessionId, messageText);
        await refreshConversations();
        
        if (speechService.isSupported()) {
          setTimeout(() => speechService.speak(fullResponse), 500);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
      
      const errorMessage = {
        id: Date.now() + 2,
        message: error.message || 'The assistant is unavailable right now. Check AI provider configuration and try again.',
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
    loadConversation(chatId);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-beige-50 via-white to-sand-50">
      {/* Sidebar */}
      <Sidebar
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
      />

      {/* Main Chat Area */}
      <div className={`flex flex-col transition-all duration-300 ${activeArtifact ? 'flex-1 border-r border-sand-200' : 'flex-1'}`}>
        {/* Chat Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-navy-800/80 backdrop-blur-sm border-b border-navy-700 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sand-500 to-sand-700 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-warm-900">AI.BH Assistant</h1>
                <p className="text-sm text-warm-600">
                  {isLoading ? 'Thinking...' : serviceHealth?.status === 'UP' ? 'Ready to help' : 'Service needs attention'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-xs text-warm-500">
                {serviceHealth?.status === 'UP' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Degraded</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.header>

        {serviceHealth?.status !== 'UP' && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
            {healthMessage}
          </div>
        )}

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
                      className="px-4 py-2 bg-navy-800 hover:bg-navy-900 text-warm-700 rounded-xl transition-colors border border-beige-300"
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
                    onOpenArtifact={setActiveArtifact}
                  />
                ))}

                <AnimatePresence>
                  {isLoadingHistory && <TypingIndicator />}
                </AnimatePresence>
                
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
          disabled={isLoading || serviceHealth?.status !== 'UP'}
          statusMessage={serviceHealth?.status === 'UP'
            ? 'Ask anything. If project-specific knowledge is missing, upload text documents to improve answers.'
            : healthMessage}
        />
      </div>
      
      {/* Artifact Panel (Split Screen) */}
      <AnimatePresence>
        {activeArtifact && (
          <div className="flex-1 flex flex-col bg-white z-10 shadow-2xl relative min-w-0">
            <ArtifactPanel 
              artifact={activeArtifact} 
              onClose={() => setActiveArtifact(null)} 
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
