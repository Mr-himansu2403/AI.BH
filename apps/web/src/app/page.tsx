'use client';

import { Bot, Sparkles, Cpu, Layers, ShieldCheck, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-navy-900 px-8 py-12 text-white">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-warm-500/10 border border-warm-500/30 rounded-full text-warm-400 text-xs font-semibold mb-6 shadow-xl backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>Next-Generation AI Operating System</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Where Intelligence <br />
            <span className="bg-gradient-to-r from-warm-400 via-warm-500 to-sand-400 bg-clip-text text-transparent">Meets Autonomous Execution</span>
          </h1>
          <p className="text-lg text-sand-300 max-w-2xl mx-auto leading-relaxed">
            Experience the ultimate synthesis of Claude-style interactive Artifacts, ChatGPT multi-model routing, and LangGraph autonomous agent execution loops.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 bg-navy-800 border border-navy-700 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-warm-500/20 rounded-xl flex items-center justify-center text-warm-400 mb-6 border border-warm-500/30">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-Model Orchestration</h3>
              <p className="text-sand-300 text-sm leading-relaxed">
                Dynamic zero-latency routing between GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, and local air-gapped vLLM models based on intent and token budgets.
              </p>
            </div>
          </div>

          <div className="p-6 bg-navy-800 border border-navy-700 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-sand-500/20 rounded-xl flex items-center justify-center text-sand-400 mb-6 border border-sand-500/30">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Live Artifact Sandbox</h3>
              <p className="text-sand-300 text-sm leading-relaxed">
                Generate React components, HTML dashboards, Mermaid diagrams, and Python charts with instant sandboxed execution and split-screen live previewing.
              </p>
            </div>
          </div>

          <div className="p-6 bg-navy-800 border border-navy-700 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Autonomous LangGraph Agents</h3>
              <p className="text-sand-300 text-sm leading-relaxed">
                Deploy cyclic reasoning graphs with built-in planner loops, MCP tool execution runners, reflection critiques, and automatic self-correction retries.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/login" 
            className="px-8 py-4 bg-gradient-to-r from-warm-500 to-warm-600 hover:from-warm-600 hover:to-warm-700 text-white font-bold rounded-xl shadow-2xl flex items-center space-x-3 transition-all hover:scale-105 border border-warm-400/30 w-full sm:w-auto justify-center"
          >
            <LogIn className="w-5 h-5" />
            <span>Launch Enterprise Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
