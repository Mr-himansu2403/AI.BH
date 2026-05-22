import './globals.css';
import { ReactNode } from 'react';
import { Bot, MessageSquare, Terminal, GitBranch, Settings, Compass } from 'lucide-react';
import Link from 'next/link';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: 'AI.bh — Enterprise AI Operating System',
  description: 'Multi-model AI orchestration, autonomous agents, and live sandboxed artifacts.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="flex h-screen overflow-hidden bg-navy-900 font-sans">
        {/* Global Enterprise Navigation Sidebar */}
        <aside className="w-16 flex flex-col items-center py-6 bg-navy-800 border-r border-navy-700 flex-shrink-0 z-20 shadow-2xl">
          {/* Brand Logo */}
          <Link href="/" className="w-10 h-10 bg-gradient-to-br from-warm-500 to-warm-700 rounded-xl flex items-center justify-center shadow-lg mb-8 hover:scale-105 transition-transform">
            <Bot className="w-6 h-6 text-white" />
          </Link>

          {/* Nav Items */}
          <nav className="flex flex-col space-y-6 flex-1 items-center">
            <Link href="/" title="Dashboard & Discovery" className="p-3 text-sand-500 hover:text-white hover:bg-navy-700/50 rounded-xl transition-all group relative">
              <Compass className="w-5 h-5" />
              <span className="absolute left-16 bg-navy-800 text-sand-100 px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-navy-700">Discovery</span>
            </Link>

            <Link href="/chat/workspace_main" title="Active AI Workspace" className="p-3 text-sand-500 hover:text-white hover:bg-navy-700/50 rounded-xl transition-all group relative">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute left-16 bg-navy-800 text-sand-100 px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-navy-700">AI Chat & Artifacts</span>
            </Link>

            <Link href="/chat/workspace_main?view=agents" title="Autonomous Agent Execution" className="p-3 text-sand-500 hover:text-white hover:bg-navy-700/50 rounded-xl transition-all group relative">
              <GitBranch className="w-5 h-5" />
              <span className="absolute left-16 bg-navy-800 text-sand-100 px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-navy-700">LangGraph Agents</span>
            </Link>

            <Link href="/chat/workspace_main?view=runtime" title="Firecracker Sandbox Kernels" className="p-3 text-sand-500 hover:text-white hover:bg-navy-700/50 rounded-xl transition-all group relative">
              <Terminal className="w-5 h-5" />
              <span className="absolute left-16 bg-navy-800 text-sand-100 px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-navy-700">Code Kernels</span>
            </Link>
          </nav>

          {/* Settings */}
          <div className="flex flex-col items-center space-y-4">
            <button title="Enterprise Settings" className="p-3 text-sand-500 hover:text-white hover:bg-navy-700/50 rounded-xl transition-all group relative">
              <Settings className="w-5 h-5" />
              <span className="absolute left-16 bg-navy-800 text-sand-100 px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-navy-700">Settings & IAM</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex min-w-0 overflow-hidden relative">
          {children}
        </main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
