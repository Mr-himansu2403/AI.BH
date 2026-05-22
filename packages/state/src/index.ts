import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

// --- Domain Models ---
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Chat {
  id: string;
  title: string;
  topic: string;
  lastMessageAt: number;
}

export interface Artifact {
  id: string;
  title: string;
  language: string;
  content: string;
  version: number;
}

export interface AgentStep {
  id: string;
  action: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  result?: string;
}

// --- Slice Interfaces ---
export interface ChatSlice {
  chats: Record<string, Chat>;
  messages: Record<string, Message[]>;
  activeChatId: string | null;
  isStreaming: boolean;
  streamingContent: string;
  setActiveChatId: (chatId: string) => void;
  setChatTopic: (chatId: string, topic: string) => void;
  appendStreamChunk: (chunk: string) => void;
  commitStreamedMessage: (role?: 'assistant' | 'tool') => string | undefined;
  addMessage: (chatId: string, message: Message) => void;
}

export interface ArtifactSlice {
  activeArtifact: Artifact | null;
  artifactHistory: Artifact[];
  viewMode: 'preview' | 'code' | 'split';
  setActiveArtifact: (artifact: Artifact) => void;
  setViewMode: (mode: 'preview' | 'code' | 'split') => void;
}

export interface AgentSlice {
  executionGraph: AgentStep[];
  activeStepId: string | null;
  setExecutionGraph: (steps: AgentStep[]) => void;
  updateStepStatus: (stepId: string, status: 'pending' | 'running' | 'success' | 'failed', result?: string) => void;
}

// --- Combined Store Type ---
export type AppStore = ChatSlice & ArtifactSlice & AgentSlice;

// --- Slice Implementations ---
const createChatSlice: StateCreator<AppStore, [['zustand/devtools', never]], [], ChatSlice> = (set, get) => ({
  chats: {},
  messages: {},
  activeChatId: null,
  isStreaming: false,
  streamingContent: '',
  setActiveChatId: (chatId) => set({ activeChatId: chatId }, false, 'chat/setActiveChatId'),
  setChatTopic: (chatId, topic) => 
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: { 
          ...(state.chats[chatId] || { id: chatId, title: 'New Chat', lastMessageAt: Date.now() }), 
          topic 
        }
      }
    }), false, 'chat/setChatTopic'),
  appendStreamChunk: (chunk) =>
    set(
      (state) => ({
        isStreaming: true,
        streamingContent: state.streamingContent + chunk,
      }),
      false,
      'chat/appendStreamChunk'
    ),
  commitStreamedMessage: (role = 'assistant') => {
    const { activeChatId, streamingContent, messages } = get();
    if (!activeChatId || !streamingContent) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      role,
      content: streamingContent,
      timestamp: Date.now(),
    };

    const currentMessages = messages[activeChatId] || [];
    set(
      {
        messages: { ...messages, [activeChatId]: [...currentMessages, newMessage] },
        isStreaming: false,
        streamingContent: '',
      },
      false,
      'chat/commitStreamedMessage'
    );
    return newMessage.content;
  },
  addMessage: (chatId, message) =>
    set(
      (state) => ({
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] || []), message],
        },
        chats: {
          ...state.chats,
          [chatId]: {
            ...(state.chats[chatId] || { id: chatId, title: message.content.slice(0, 30), topic: 'General' }),
            lastMessageAt: Date.now()
          }
        }
      }),
      false,
      'chat/addMessage'
    ),
});

const createArtifactSlice: StateCreator<AppStore, [['zustand/devtools', never]], [], ArtifactSlice> = (set) => ({
  activeArtifact: null,
  artifactHistory: [],
  viewMode: 'split',
  setActiveArtifact: (artifact) =>
    set(
      (state) => ({
        activeArtifact: artifact,
        artifactHistory: [...state.artifactHistory.filter((a) => a.id !== artifact.id), artifact],
      }),
      false,
      'artifact/setActiveArtifact'
    ),
  setViewMode: (mode) => set({ viewMode: mode }, false, 'artifact/setViewMode'),
});

const createAgentSlice: StateCreator<AppStore, [['zustand/devtools', never]], [], AgentSlice> = (set) => ({
  executionGraph: [],
  activeStepId: null,
  setExecutionGraph: (steps) => set({ executionGraph: steps, activeStepId: steps[0]?.id || null }, false, 'agent/setExecutionGraph'),
  updateStepStatus: (stepId, status, result) =>
    set(
      (state) => ({
        executionGraph: state.executionGraph.map((step) =>
          step.id === stepId ? { ...step, status, ...(result ? { result } : {}) } : step
        ),
        activeStepId: status === 'success' ? state.executionGraph.find((s) => s.id !== stepId && s.status === 'pending')?.id || null : state.activeStepId,
      }),
      false,
      'agent/updateStepStatus'
    ),
});

// --- Root Store Export ---
export const useAppStore = create<AppStore>()(
  devtools(
    (...a) => ({
      ...createChatSlice(...a),
      ...createArtifactSlice(...a),
      ...createAgentSlice(...a),
    }),
    { name: 'AI.bh-Enterprise-Store' }
  )
);
