'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, Message } from '@aibh/state';
import { Bot, User, Send, Cpu, Sparkles, AlertCircle, RefreshCw, Edit3, Check, Layers } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatColumnProps {
  chatId: string;
  currentView: string;
}

export default function ChatColumn({ chatId, currentView }: ChatColumnProps) {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet');
  const [systemPrompt, setSystemPrompt] = useState('You are AI.bh, an elite enterprise AI operating system. Provide clear, modular, and production-ready code or analysis.');
  const [isEditingSystem, setIsEditingSystem] = useState(false);
  const [, startTransition] = useTransition();

  const messages = useAppStore((state) => state.messages[chatId] || []);
  const isStreaming = useAppStore((state) => state.isStreaming);
  const streamingContent = useAppStore((state) => state.streamingContent);
  const addMessage = useAppStore((state) => state.addMessage);
  const appendStreamChunk = useAppStore((state) => state.appendStreamChunk);
  const commitStreamedMessage = useAppStore((state) => state.commitStreamedMessage);
  const setActiveArtifact = useAppStore((state) => state.setActiveArtifact);
  const setExecutionGraph = useAppStore((state) => state.setExecutionGraph);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Simulated SSE token streaming for demonstration of high-performance rendering
  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    addMessage(chatId, userMsg);
    setInput('');

    // Trigger LangGraph Agent Workflow simulation if view is agents or specific intent detected
    if (currentView === 'agents' || input.toLowerCase().includes('research') || input.toLowerCase().includes('agent')) {
      startTransition(() => {
        setExecutionGraph([
          { id: 'step_1', action: 'Decomposing objective into task DAG', status: 'success', result: 'Identified 3 sub-tasks: Web Search, Data Extraction, Sandbox Charting.' },
          { id: 'step_2', action: 'Executing MCP Tool: DuckDuckGo Web Search', status: 'success', result: 'Retrieved top 10 relevant industry reports.' },
          { id: 'step_3', action: 'Executing Firecracker Sandbox: Python Data Aggregation', status: 'running' },
          { id: 'step_4', action: 'LLM Reflection & Self-Correction Critique', status: 'pending' },
        ]);
      });
    }

    // Simulate token streaming response
    let sampleResponse = '';
    if (input.toLowerCase().includes('react') || input.toLowerCase().includes('dashboard') || input.toLowerCase().includes('html')) {
      sampleResponse = `Here is the interactive React component dashboard you requested. I have created a fully functional analytics tracker with rich metrics and responsive layout.\n\n\`\`\`tsx\n// language-tsx\nimport React, { useState } from 'react';\n\nexport default function AnalyticsDashboard() {\n  const [count, setCount] = useState(10420);\n  return (\n    <div className="p-8 bg-slate-900 text-white rounded-2xl shadow-2xl font-sans">\n      <h1 className="text-3xl font-extrabold mb-2">Enterprise Analytics Portal</h1>\n      <p className="text-slate-400 mb-6">Real-time metrics from AI.bh streaming gateway</p>\n      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">\n        <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl shadow-lg">\n          <h3 className="text-sm font-semibold text-slate-400 mb-1">Active Firecracker microVMs</h3>\n          <div className="text-4xl font-black text-emerald-400">42 Kernels</div>\n        </div>\n        <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl shadow-lg">\n          <h3 className="text-sm font-semibold text-slate-400 mb-1">Tokens Processed</h3>\n          <div className="text-4xl font-black text-warm-400">{count}</div>\n        </div>\n      </div>\n      <button onClick={() => setCount(c => c + 150)} className="px-6 py-3 bg-warm-500 hover:bg-warm-600 text-white font-bold rounded-xl transition-all shadow-lg">\n        Simulate Token Ingest (+150)\n      </button>\n    </div>\n  );\n}\n\`\`\`\n\nYou can interact with this live preview in the Artifact Panel on the right!`;
    } else {
      sampleResponse = `I have processed your request using **${selectedModel}**. Our multi-model routing engine evaluated your prompt complexity and allocated it to the optimal inference tier.\n\n### Architectural Synthesis\n- **Context Truncation**: Preserved system directives and compressed middle episodic memory.\n- **Tool Grounding**: Verified zero external MCP dependencies required for this query.\n- **TTFT Benchmark**: Achieved Time-To-First-Token of 142ms via vLLM speculative decoding.\n\nLet me know if you would like me to generate a live code artifact or spawn an autonomous LangGraph agent loop!`;
    }

    const words = sampleResponse.split(' ');
    let i = 0;

    const interval = setInterval(() => {
      if (i < words.length) {
        appendStreamChunk((i > 0 ? ' ' : '') + words[i]);
        i++;
      } else {
        clearInterval(interval);
        commitStreamedMessage('assistant');

        // Automatically trigger artifact detection if code block exists
        if (sampleResponse.includes('```tsx')) {
          const codeMatch = sampleResponse.match(/```tsx[\s\S]*?export default function (\w+)[\s\S]*?```/);
          const rawCode = sampleResponse.replace(/[\s\S]*```tsx\n\/\/ language-tsx\n([\s\S]*?)```[\s\S]*/, '$1');
          setActiveArtifact({
            id: `art_${Date.now()}`,
            title: codeMatch ? codeMatch[1] : 'ReactDashboard',
            language: 'tsx',
            content: rawCode,
            version: 1,
          });
        }
      }
    }, 25);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-navy-900 z-10 relative">
      {/* Top Header & Model Router Selector */}
      <header className="px-6 py-4 bg-navy-800/80 backdrop-blur-md border-b border-navy-700 flex items-center justify-between flex-shrink-0 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-warm-500 to-warm-700 rounded-xl flex items-center justify-center shadow-md">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>AI.bh Orchestrator</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-[10px] font-mono">v2026.1</span>
            </h2>
            <p className="text-xs text-sand-400">Multi-Model Routing & Token Streaming</p>
          </div>
        </div>

        {/* Model Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-sand-400 font-semibold">Active Model:</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-navy-900 border border-navy-700 text-sand-100 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-warm-500 shadow-inner font-semibold"
          >
            <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Coding/Artifacts)</option>
            <option value="gpt-4o">GPT-4o (Reasoning/Math)</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro (1M Context/RAG)</option>
            <option value="vllm-llama-3-70b">vLLM Llama-3 70B (Local Air-Gapped)</option>
          </select>
        </div>
      </header>

      {/* Collapsible System Prompt Configuration */}
      <div className="bg-navy-800/50 border-b border-navy-700 px-6 py-2.5 flex flex-col justify-center flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-sand-400">
            <Sparkles className="w-3.5 h-3.5 text-warm-400" />
            <span className="font-semibold">System Directives (Persona):</span>
            {!isEditingSystem && <span className="text-sand-300 italic truncate max-w-md">{systemPrompt}</span>}
          </div>
          <button onClick={() => setIsEditingSystem(!isEditingSystem)} className="text-xs text-warm-400 hover:text-warm-300 flex items-center space-x-1 font-semibold">
            {isEditingSystem ? <><Check className="w-3.5 h-3.5" /><span>Save Directives</span></> : <><Edit3 className="w-3.5 h-3.5" /><span>Edit Persona</span></>}
          </button>
        </div>
        <AnimatePresence>
          {isEditingSystem && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 overflow-hidden">
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={3}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl p-3 text-xs text-sand-100 focus:outline-none focus:border-warm-500 shadow-inner resize-none"
                placeholder="Enter custom enterprise system prompt directives..."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message History Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && !isStreaming ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-navy-800 border border-navy-700 rounded-2xl flex items-center justify-center text-sand-400 mb-6 shadow-2xl">
              <Bot className="w-8 h-8 text-warm-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Start an Enterprise Conversation</h3>
            <p className="text-xs text-sand-400 mb-6 leading-relaxed">
              Ask a complex coding question, request an interactive React dashboard, or deploy an autonomous LangGraph agent loop.
            </p>
            <div className="flex flex-col space-y-2 w-full">
              {[
                'Create an interactive React analytics dashboard',
                'Research competitive AI platforms using LangGraph agents',
                'Explain our vector DB semantic chunking strategy',
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="p-3 bg-navy-800 hover:bg-navy-700/80 border border-navy-700 rounded-xl text-left text-xs text-sand-200 hover:text-white transition-all shadow-md flex items-center justify-between group"
                >
                  <span className="truncate">{prompt}</span>
                  <Send className="w-3.5 h-3.5 text-sand-500 group-hover:text-warm-400 transition-colors flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${msg.role === 'user' ? 'bg-gradient-to-br from-warm-500 to-warm-700 text-white' : 'bg-navy-800 border border-navy-700 text-warm-400'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`flex flex-col max-w-2xl ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl shadow-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-warm-500 text-white rounded-tr-none' : 'bg-navy-800 border border-navy-700 text-sand-100 rounded-tl-none'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert max-w-none prose-pre:bg-navy-900 prose-pre:border prose-pre:border-navy-700 prose-pre:rounded-xl">
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  <span className="text-[10px] text-sand-500 mt-1.5 px-1 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Live Token Streaming Bubble */}
            {isStreaming && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-navy-800 border border-navy-700 text-warm-400 flex items-center justify-center flex-shrink-0 shadow-md animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex flex-col max-w-2xl items-start">
                  <div className="p-4 rounded-2xl shadow-xl text-xs leading-relaxed bg-navy-800 border border-navy-700 text-sand-100 rounded-tl-none border-l-2 border-l-warm-500">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert max-w-none prose-pre:bg-navy-900 prose-pre:border prose-pre:border-navy-700 prose-pre:rounded-xl">
                      {streamingContent}
                    </ReactMarkdown>
                    <span className="inline-block w-2 h-3 bg-warm-400 animate-pulse ml-1 align-middle" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="p-6 bg-navy-800/80 backdrop-blur-md border-t border-navy-700 flex-shrink-0 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-end space-x-3 bg-navy-900 border border-navy-700 rounded-2xl p-2 shadow-inner focus-within:border-warm-500 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isStreaming ? 'AI is generating tokens...' : 'Ask AI.bh anything... (Shift+Enter for newline)'}
            disabled={isStreaming}
            rows={2}
            className="flex-1 bg-transparent border-none text-xs text-sand-100 placeholder-sand-500 p-2 focus:outline-none resize-none font-sans"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="p-3 bg-gradient-to-r from-warm-500 to-warm-600 hover:from-warm-600 hover:to-warm-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg flex items-center justify-center flex-shrink-0 hover:scale-105 active:scale-95"
          >
            {isStreaming ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-center justify-between mt-3 px-2 text-[10px] text-sand-500 font-semibold">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Layers className="w-3 h-3 text-sand-400" />
              <span>Claude Artifacts Sandboxing Active</span>
            </span>
            <span className="flex items-center space-x-1">
              <AlertCircle className="w-3 h-3 text-emerald-400" />
              <span>Firecracker microVM Pool Online</span>
            </span>
          </div>
          <span>Enterprise SSO Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}
