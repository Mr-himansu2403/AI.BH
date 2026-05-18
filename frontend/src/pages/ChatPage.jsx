/**
 * ChatPage.jsx — Refactored to use Zustand stores
 * State is now shared globally; no prop-drilling or Context re-render issues.
 */

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import TypingIndicator from '../components/TypingIndicator';
import ArtifactPanel from '../components/ArtifactPanel';
import { chatAPI } from '../services/api';
import speechService from '../services/speechService';
import toast from 'react-hot-toast';
import { useChatStore, useArtifactStore, useHealthStore } from '../store';

const ChatPage = () => {
  // ── Zustand stores ──────────────────────────────────────────────────────────
  const {
    messages, sessionId, chatHistory, currentChatId,
    isLoading, isLoadingHistory,
    addMessage, setMessages, setIsLoading,
    initializeChat, setSessionId,
    loadConversation, refreshConversations,
    updateChatHistoryEntry,
  } = useChatStore();

  const { artifact, isOpen: artifactOpen, openArtifact, closeArtifact } = useArtifactStore();
  const { health: serviceHealth, healthMessage, checkHealth } = useHealthStore();

  const messagesEndRef = useRef(null);

  // ── Session management (generate IDs on the frontend) ──────────────────────
  const generateSessionId = useCallback(
    () => 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    []
  );

  // ── Bootstrap: load existing conversations or start fresh ──────────────────
  const bootstrapChat = useCallback(async () => {
    try {
      const conversations = await chatAPI.getConversations();
      const mapped = conversations.map((c) => ({
        id: c.sessionId, title: c.title,
        lastMessage: c.lastMessage, createdAt: c.createdAt, updatedAt: c.updatedAt,
      }));
      // Use the store action, not setState directly
      useChatStore.getState().setChatHistory(mapped);
      if (mapped.length > 0) {
        await loadConversation(mapped[0].id);
        return;
      }
    } catch {
      // No conversations yet — start fresh
    }
    initializeChat();
  }, [loadConversation, initializeChat]);

  useEffect(() => {
    bootstrapChat();
    checkHealth();
    const id = setInterval(checkHealth, 30_000);
    return () => clearInterval(id);
  }, [bootstrapChat, checkHealth]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message (streaming) ────────────────────────────────────────────────
  const handleSendMessage = async (messageText, imageData = null) => {
    if (!messageText && !imageData) return;

    // Ensure we have a session
    let activeSession = sessionId;
    if (!activeSession) {
      activeSession = generateSessionId();
      setSessionId(activeSession);
    }

    const userMsg = {
      id: Date.now(),
      message: messageText,
      isUser: true,
      timestamp: new Date().toISOString(),
      imageUrl: imageData || null,
    };
    addMessage(userMsg);
    setIsLoading(true);

    if (serviceHealth?.status === 'DOWN') {
      toast.error(serviceHealth?.message || 'Backend is unavailable right now.');
    }

    try {
      if (imageData) {
        // Image chat (non-streaming)
        const resp = await chatAPI.sendImageMessage(messageText, imageData, activeSession);
        addMessage({ id: Date.now() + 1, message: resp.response, isUser: false, timestamp: resp.timestamp });
        updateChatHistoryEntry(activeSession, messageText);
        await refreshConversations();
        if (speechService.isSupported())
          setTimeout(() => speechService.speak(resp.response), 500);
      } else {
        // Streaming text chat
        const aiMsgId = Date.now() + 1;
        addMessage({ id: aiMsgId, message: '', isUser: false, timestamp: new Date().toISOString() });

        let fullResponse = '';
        try {
          await chatAPI.streamMessage(messageText, activeSession, (chunk) => {
            fullResponse += chunk;
            // Use functional updater — safe against React batching
            setMessages(
              useChatStore.getState().messages.map((m) =>
                m.id === aiMsgId ? { ...m, message: fullResponse } : m
              )
            );
          });
        } catch (streamErr) {
          // Fallback to non-streaming
          console.warn('Stream failed, falling back:', streamErr);
          try {
            const resp = await chatAPI.sendMessage(messageText, activeSession);
            fullResponse = resp.response || 'The assistant could not generate a response.';
          } catch {
            fullResponse = '⚠️ Both streaming and fallback failed. Please check your AI provider configuration.';
          }
          setMessages(
            useChatStore.getState().messages.map((m) =>
              m.id === aiMsgId ? { ...m, message: fullResponse } : m
            )
          );
        }

        updateChatHistoryEntry(activeSession, messageText);
        await refreshConversations();
        if (speechService.isSupported())
          setTimeout(() => speechService.speak(fullResponse), 500);
      }
    } catch (err) {
      console.error('handleSendMessage error:', err);
      toast.error(err.message || 'Failed to send message.');
      addMessage({
        id: Date.now() + 2,
        message: err.message || 'The assistant is unavailable. Check your API key configuration.',
        isUser: false,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    initializeChat();
    closeArtifact();
  };

  const handleSelectChat = (chatId) => loadConversation(chatId);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-navy-900">
      {/* Sidebar */}
      <Sidebar
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
      />

      {/* Main Chat Column */}
      <div className={`flex flex-col transition-all duration-300 ${artifactOpen ? 'flex-1 border-r border-navy-700' : 'flex-1'}`}>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-navy-800/80 backdrop-blur-sm border-b border-navy-700 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-warm-500 to-warm-700 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">AI.BH Assistant</h1>
                <p className="text-sm text-sand-400">
                  {isLoading ? 'Thinking...' : serviceHealth?.status === 'UP' ? 'Ready to help' : 'Service needs attention'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Artifact history badge */}
              {artifactOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-1 px-2 py-1 bg-warm-500/20 text-warm-300 rounded-lg text-xs font-semibold border border-warm-500/30"
                >
                  <Zap className="w-3 h-3" />
                  <span>Artifact Preview</span>
                </motion.div>
              )}
              <div className="flex items-center space-x-1 text-xs text-sand-400">
                {serviceHealth?.status === 'UP' ? (
                  <><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Online</span></>
                ) : (
                  <><AlertTriangle className="w-4 h-4 text-warm-400" /><span>Degraded</span></>
                )}
              </div>
            </div>
          </div>
        </motion.header>

        {/* Health Banner */}
        {serviceHealth?.status !== 'UP' && (
          <div className="border-b border-warm-500/30 bg-warm-500/10 px-6 py-3 text-sm text-warm-300">
            {healthMessage}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto chat-container">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-warm-500 to-warm-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Welcome to AI.BH</h2>
                <p className="text-sand-300 mb-8 max-w-md mx-auto">
                  Your intelligent assistant is ready to help you learn, create, and solve problems.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['Explain a complex topic', 'Help with coding', 'Create an HTML app', 'Creative writing'].map((s, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSendMessage(s)}
                      className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-sand-200 hover:text-white rounded-xl transition-colors border border-navy-700 shadow-md font-medium text-sm"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg.message}
                    isUser={msg.isUser}
                    timestamp={msg.timestamp}
                    imageUrl={msg.imageUrl}
                    index={index}
                    onOpenArtifact={openArtifact}
                  />
                ))}
                <AnimatePresence>
                  {(isLoading || isLoadingHistory) && <TypingIndicator />}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading || serviceHealth?.status !== 'UP'}
          statusMessage={
            serviceHealth?.status === 'UP'
              ? 'Ask anything. Upload documents to improve domain-specific answers.'
              : healthMessage
          }
        />
      </div>

      {/* Artifact Split-Screen Panel */}
      <AnimatePresence>
        {artifactOpen && artifact && (
          <div className="flex-1 flex flex-col bg-white z-10 shadow-2xl relative min-w-0">
            <ArtifactPanel artifact={artifact} onClose={closeArtifact} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
