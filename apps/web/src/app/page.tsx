'use client';

import { motion } from 'framer-motion';
import { Bot, ArrowRight, Sparkles, Cpu, Layers, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 px-8 py-12">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-warm-500/10 border border-warm-500/30 rounded-full text-warm-400 text-xs font-semibold mb-6 shadow-xl backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>Next-Generation AI Operating System</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Where Intelligence <br />
            <span className="bg-gradient-to-r from-warm-400 via-warm-500 to-sand-400 bg-clip-text text-transparent">Meets Autonomous Execution</span>
          </h1>
          <p className="text-lg text-sand-300 max-w-2xl mx-auto leading-relaxed">
            Experience the ultimate synthesis of Claude-style interactive Artifacts, ChatGPT multi-model routing, and LangGraph autonomous agent execution loops.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <motion.div whileHover={{ y: -5 }} className="p-6 bg-navy-800/80 border border-navy-700 rounded-2xl shadow-xl backdrop-blur-sm flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 bg-warm-500/20 rounded-xl flex items-center justify-center text-warm-400 mb-6 group-hover:scale-110 transition-transform border border-warm-500/30">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-Model Orchestration</h3>
              <p className="text-sand-300 text-sm leading-relaxed">
                Dynamic zero-latency routing between GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, and local air-gapped vLLM models based on intent and token budgets.
              </p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="p-6 bg-navy-800/80 border border-navy-700 rounded-2xl shadow-xl backdrop-blur-sm flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 bg-sand-500/20 rounded-xl flex items-center justify-center text-sand-400 mb-6 group-hover:scale-110 transition-transform border border-sand-500/30">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Live Artifact Sandbox</h3>
              <p className="text-sand-300 text-sm leading-relaxed">
                Generate React components, HTML dashboards, Mermaid diagrams, and Python charts with instant sandboxed execution and split-screen live previewing.
              </p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="p-6 bg-navy-800/80 border border-navy-700 rounded-2xl shadow-xl backdrop-blur-sm flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Autonomous LangGraph Agents</h3>
              <p className="text-sand-300 text-sm leading-relaxed">
                Deploy cyclic reasoning graphs with built-in planner loops, MCP tool execution runners, reflection critiques, and automatic self-correction retries.
              import Link from 'next/link';
              import LoginModal from '@/components/LoginModal';

              export default function HomePage() {
                return (
              ...
                      {/* CTA Section */}
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <LoginModal />
                      </motion.div>
                    </div>
                  </div>
                );
              }
