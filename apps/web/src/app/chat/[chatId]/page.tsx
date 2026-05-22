'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@aibh/state';
import ChatColumn from '@/components/ChatColumn';
import ArtifactPanel from '@/components/ArtifactPanel';
import AgentWorkflowCanvas from '@/components/AgentWorkflowCanvas';
import CodeKernelManager from '@/components/CodeKernelManager';
import DiscoveryDashboard from '@/components/DiscoveryDashboard';
import ChatSidebar from '@/components/ChatSidebar';

interface PageProps {
  params: Promise<{ chatId: string }>;
  searchParams: Promise<{ view?: string }>;
}

export default function ChatWorkspacePage(props: PageProps) {
  const { 
    chatId 
  } = React.use(props.params);
  
  const { 
    view = 'chat' 
  } = React.use(props.searchParams);

  const setActiveChatId = useAppStore((state) => state.setActiveChatId);
  const activeArtifact = useAppStore((state) => state.activeArtifact);

  useEffect(() => {
    setActiveChatId(chatId);
  }, [chatId, setActiveChatId]);

  return (
    <div className="flex-1 flex h-full overflow-hidden relative bg-navy-900">
      <ChatSidebar />
      {/* Primary Chat Column */}
      <div className={`flex flex-col h-full transition-all duration-300 ${activeArtifact && view === 'chat' ? 'w-1/2 border-r border-navy-700' : 'flex-1'}`}>
        <ChatColumn chatId={chatId} currentView={view} />
      </div>

      {/* Secondary Split Panels based on active view and state */}
      {view === 'chat' && activeArtifact && (
        <div className="w-1/2 flex flex-col h-full bg-navy-800 z-10 shadow-2xl relative min-w-0 animate-in slide-in-from-right duration-300">
          <ArtifactPanel />
        </div>
      )}

      {view === 'chat' && !activeArtifact && (
        <div className="hidden xl:flex w-1/3 flex-col h-full border-l border-navy-700 bg-navy-900/50">
          <DiscoveryDashboard />
        </div>
      )}

      {view === 'agents' && (
        <div className="flex-1 flex flex-col h-full bg-navy-800 z-10 shadow-2xl relative min-w-0 animate-in slide-in-from-bottom duration-300">
          <AgentWorkflowCanvas />
        </div>
      )}

      {view === 'runtime' && (
        <div className="flex-1 flex flex-col h-full bg-navy-800 z-10 shadow-2xl relative min-w-0 animate-in slide-in-from-bottom duration-300">
          <CodeKernelManager />
        </div>
      )}
    </div>
  );
}
