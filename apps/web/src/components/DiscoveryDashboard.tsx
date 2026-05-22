'use client';

import { motion } from 'framer-motion';
import { Search, History, TrendingUp, Star, Clock, Filter, Zap, Globe, Code, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function DiscoveryDashboard() {
  const [search, setSearch] = useState('');

  const stats = [
    { label: 'AI Operations', value: '1.2M', icon: Zap, color: 'text-warm-400' },
    { label: 'Active Kernels', value: '842', icon: Globe, color: 'text-emerald-400' },
    { label: 'Success Rate', value: '99.9%', icon: Shield, color: 'text-blue-400' },
  ];

  const recentActivities = [
    { id: 1, type: 'artifact', title: 'Revenue Dashboard V2', time: '2 mins ago', icon: Code },
    { id: 2, type: 'agent', title: 'Competitor Analysis Loop', time: '15 mins ago', icon: Zap },
    { id: 3, type: 'search', title: 'Vector DB Chunking Strategy', time: '1 hour ago', icon: Search },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-navy-900 overflow-y-auto">
      {/* Search Header */}
      <section className="px-8 py-12 bg-navy-800/50 border-b border-navy-700 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-white mb-6 tracking-tight"
          >
            Discovery & <span className="text-warm-500">Global Context</span>
          </motion.h1>
          <div className="relative group max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sand-500 group-focus-within:text-warm-500 transition-colors" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workspaces, agents, or global knowledge..."
              className="w-full h-14 bg-navy-900 border-navy-700 pl-12 text-sand-100 rounded-2xl focus-visible:ring-warm-500 transition-all shadow-2xl"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <span className="px-2 py-1 bg-navy-800 border border-navy-700 rounded text-[10px] text-sand-500 font-mono">⌘K</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-sand-500">
            <span>Trending:</span>
            {['Agent Loops', 'React Shaders', 'Firecracker KVM'].map(t => (
              <button key={t} className="hover:text-warm-400 transition-colors">#{t}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats & Quick Actions */}
      <section className="px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-navy-800/80 border border-navy-700 rounded-2xl shadow-xl flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-sand-500 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                </div>
                <stat.icon className={`w-10 h-10 ${stat.color} opacity-20`} />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <History className="w-4 h-4 text-warm-500" />
                  <span>Recent Activity</span>
                </h3>
                <Button variant="ghost" size="sm" className="text-xs text-sand-500 hover:text-white">View All</Button>
              </div>
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div key={act.id} className="p-4 bg-navy-800/40 border border-navy-700/50 rounded-xl hover:bg-navy-800 transition-colors group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center text-sand-400 group-hover:text-warm-400 transition-colors border border-navy-700">
                          <act.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-sand-100">{act.title}</p>
                          <p className="text-[10px] text-sand-500">{act.time}</p>
                        </div>
                      </div>
                      <Star className="w-3.5 h-3.5 text-sand-600 hover:text-warm-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Enterprise Knowledge Graphs</span>
                </h3>
              </div>
              <div className="flex-1 p-6 bg-gradient-to-br from-navy-800 to-navy-900 border border-navy-700 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-all" />
                <div className="relative">
                  <p className="text-xs text-sand-300 leading-relaxed mb-6">
                    Our RAG engine has identified new patterns in your recent LangGraph agent logs. 
                    <span className="text-emerald-400"> 12 optimized paths</span> detected for competitive analysis tasks.
                  </p>
                  <Button className="w-full bg-navy-700 hover:bg-navy-600 border border-navy-600 text-xs text-white rounded-xl h-10">
                    Sync to Knowledge Base
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
