'use client';

import { useAppStore } from '@aibh/state';
import { MessageSquare, Plus, Hash, Clock, Settings, Search, Folder } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ChatSidebar() {
  const chats = useAppStore((state) => Object.values(state.chats).sort((a, b) => b.lastMessageAt - a.lastMessageAt));
  const activeChatId = useAppStore((state) => state.activeChatId);

  const topics = ['General', 'Engineering', 'Research', 'Creative', 'Security'];

  return (
    <aside className="w-64 bg-navy-800 border-r border-navy-700 flex flex-col h-full flex-shrink-0 z-20">
      <div className="p-4">
        <Link href="/chat/new" className="w-full flex items-center justify-center space-x-2 bg-warm-500 hover:bg-warm-600 text-white rounded-xl py-3 px-4 transition-all shadow-lg font-bold text-sm">
          <Plus className="w-4 h-4" />
          <span>New Workspace</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-6 pb-6">
        {/* Topic Filters */}
        <div className="space-y-2">
          <h3 className="px-3 text-[10px] font-bold text-sand-500 uppercase tracking-widest flex items-center space-x-2">
            <Hash className="w-3 h-3" />
            <span>Topics</span>
          </h3>
          <div className="space-y-1">
            {topics.map(topic => (
              <button key={topic} className="w-full text-left px-3 py-2 rounded-lg text-xs text-sand-400 hover:bg-navy-700 hover:text-white transition-all flex items-center justify-between group">
                <span>{topic}</span>
                <span className="bg-navy-900 px-1.5 py-0.5 rounded text-[10px] group-hover:bg-navy-600 transition-colors">
                  {chats.filter(c => c.topic === topic).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Workspaces */}
        <div className="space-y-2">
          <h3 className="px-3 text-[10px] font-bold text-sand-500 uppercase tracking-widest flex items-center space-x-2">
            <Clock className="w-3 h-3" />
            <span>Recent Activity</span>
          </h3>
          <div className="space-y-1">
            {chats.length === 0 && (
              <div className="px-3 py-4 text-[10px] text-sand-600 italic">No recent workspaces</div>
            )}
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all group ${
                  activeChatId === chat.id ? 'bg-navy-700 text-white shadow-md' : 'text-sand-400 hover:bg-navy-700/50 hover:text-sand-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                  activeChatId === chat.id ? 'bg-navy-900 border-warm-500/50 text-warm-400' : 'bg-navy-900 border-navy-700 text-sand-500 group-hover:border-navy-600'
                }`}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{chat.title}</p>
                  <p className="text-[9px] text-sand-600 truncate">{chat.topic}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-navy-700 bg-navy-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between text-sand-500">
          <button className="p-2 hover:bg-navy-700 rounded-lg transition-colors"><Search className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-navy-700 rounded-lg transition-colors"><Folder className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-navy-700 rounded-lg transition-colors"><Settings className="w-4 h-4" /></button>
        </div>
      </div>
    </aside>
  );
}
