/**
 * AI.BH — Global Chat Store (Zustand)
 *
 * Replaces Context API + scattered useState.
 * Claude/ChatGPT reference: Redux Toolkit / Zustand
 *
 * Slices:
 *   messages      — current conversation messages
 *   sessionId     — active session
 *   chatHistory   — sidebar conversation list
 *   artifact      — split-screen artifact state
 *   health        — AI service health status
 *   streaming     — current streaming state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { chatAPI } from '../services/api';

// ── Helper ────────────────────────────────────────────────────────────────────
const generateSessionId = () =>
  'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

const hydrateMessages = (history) => {
  const out = [];
  history.forEach((entry) => {
    if (entry.userMessage)
      out.push({ id: `${entry.id}-user`, message: entry.userMessage, isUser: true, timestamp: entry.createdAt, imageUrl: entry.imageUrl || null });
    if (entry.aiResponse)
      out.push({ id: `${entry.id}-ai`, message: entry.aiResponse, isUser: false, timestamp: entry.createdAt });
  });
  return out;
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. CHAT STORE
// ─────────────────────────────────────────────────────────────────────────────
export const useChatStore = create(
  devtools(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────────────────
      messages: [],
      sessionId: null,
      chatHistory: [],
      currentChatId: null,
      isLoading: false,
      isLoadingHistory: false,
      streamingContent: '',  // accumulates SSE chunks for live typing
      isStreaming: false,

      // ── Message Actions ───────────────────────────────────────────────────
      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),

      setMessages: (messages) => set({ messages }),

      /** Append a streaming chunk to the in-progress AI message */
      appendStreamChunk: (chunk) =>
        set((state) => ({ streamingContent: state.streamingContent + chunk })),

      /** Commit the fully-streamed message as a real message object */
      commitStreamedMessage: () => {
        const { streamingContent } = get();
        if (!streamingContent.trim()) return;
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: Date.now(),
              message: streamingContent,
              isUser: false,
              timestamp: new Date().toISOString(),
            },
          ],
          streamingContent: '',
          isStreaming: false,
        }));
      },

      setIsLoading: (v) => set({ isLoading: v }),
      setIsStreaming: (v) => set({ isStreaming: v }),

      // ── Session ───────────────────────────────────────────────────────────
      setSessionId: (id) => set({ sessionId: id, currentChatId: id }),

      initializeChat: () => {
        const newId = generateSessionId();
        set({
          sessionId: newId,
          currentChatId: newId,
          messages: [
            {
              id: 1,
              message: 'Welcome to AI.BH. I am your professional AI assistant. How can I help you today?',
              isUser: false,
              timestamp: new Date().toISOString(),
            },
          ],
          streamingContent: '',
          isStreaming: false,
        });
      },

      // ── Chat History (Sidebar) ────────────────────────────────────────────
      setChatHistory: (history) => set({ chatHistory: history }),

      updateChatHistoryEntry: (chatId, userMsg) =>
        set((state) => {
          const exists = state.chatHistory.find((c) => c.id === chatId);
          if (exists) {
            return {
              chatHistory: state.chatHistory.map((c) =>
                c.id === chatId ? { ...c, lastMessage: userMsg, updatedAt: new Date() } : c
              ),
            };
          }
          return {
            chatHistory: [
              ...state.chatHistory,
              {
                id: chatId,
                title: userMsg.length > 30 ? userMsg.slice(0, 30) + '...' : userMsg,
                lastMessage: userMsg,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
          };
        }),

      // ── API Actions ───────────────────────────────────────────────────────
      loadConversation: async (chatId) => {
        set({ isLoadingHistory: true });
        try {
          const history = await chatAPI.getChatHistory(chatId);
          set({
            currentChatId: chatId,
            sessionId: chatId,
            messages: hydrateMessages(history),
            isLoadingHistory: false,
          });
        } catch {
          set({ isLoadingHistory: false });
        }
      },

      refreshConversations: async () => {
        try {
          const conversations = await chatAPI.getConversations();
          set({
            chatHistory: conversations.map((c) => ({
              id: c.sessionId,
              title: c.title,
              lastMessage: c.lastMessage,
              createdAt: c.createdAt,
              updatedAt: c.updatedAt,
            })),
          });
        } catch {
          // silent
        }
      },

      clearChat: async (chatId) => {
        try {
          await chatAPI.clearChatHistory(chatId);
          get().initializeChat();
          get().refreshConversations();
        } catch {
          // silent
        }
      },
    }),
    { name: 'aibh-chat' }
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. ARTIFACT STORE  (Claude-style split-screen artifact panel)
// ─────────────────────────────────────────────────────────────────────────────
export const useArtifactStore = create(
  devtools(
    (set, get) => ({
      // State
      artifact: null,         // { code, language, title }
      artifactHistory: [],    // all artifacts from current session
      isOpen: false,

      // Actions
      openArtifact: (artifact) => {
        const id = Date.now();
        const withId = { ...artifact, id };
        set((state) => ({
          artifact: withId,
          isOpen: true,
          artifactHistory: [...state.artifactHistory, withId],
        }));
      },

      closeArtifact: () => set({ isOpen: false, artifact: null }),

      navigateArtifact: (direction) => {
        const { artifact, artifactHistory } = get();
        if (!artifact) return;
        const idx = artifactHistory.findIndex((a) => a.id === artifact.id);
        const next = direction === 'prev' ? idx - 1 : idx + 1;
        if (next >= 0 && next < artifactHistory.length) {
          set({ artifact: artifactHistory[next] });
        }
      },

      clearArtifacts: () => set({ artifact: null, artifactHistory: [], isOpen: false }),
    }),
    { name: 'aibh-artifacts' }
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. HEALTH STORE
// ─────────────────────────────────────────────────────────────────────────────
export const useHealthStore = create(
  devtools(
    (set) => ({
      health: null,
      healthMessage: 'Checking AI service status...',

      checkHealth: async () => {
        try {
          const h = await chatAPI.healthCheck();
          set({ health: h, healthMessage: h.message || 'Service is ready.' });
        } catch {
          set({
            health: { status: 'DOWN', checks: {} },
            healthMessage: 'Backend is unreachable. Start start-dev.bat.',
          });
        }
      },
    }),
    { name: 'aibh-health' }
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. AUTH STORE  (mirrors AuthContext but in Zustand for cross-cutting access)
// ─────────────────────────────────────────────────────────────────────────────
export const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        setAuth: (user, token) =>
          set({ user, token, isAuthenticated: !!token }),

        clearAuth: () =>
          set({ user: null, token: null, isAuthenticated: false }),
      }),
      { name: 'aibh-auth', partialize: (s) => ({ user: s.user, token: s.token }) }
    ),
    { name: 'aibh-auth' }
  )
);
