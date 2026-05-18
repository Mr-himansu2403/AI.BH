'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@aibh/state';
import { Code, Eye, SplitSquareVertical, Copy, Check, Download, ChevronLeft, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ArtifactPanel() {
  const [copied, setCopied] = useState(false);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);

  const activeArtifact = useAppStore((state) => state.activeArtifact);
  const artifactHistory = useAppStore((state) => state.artifactHistory);
  const viewMode = useAppStore((state) => state.viewMode);
  const setViewMode = useAppStore((state) => state.setViewMode);
  const setActiveArtifact = useAppStore((state) => state.setActiveArtifact);

  // Keep version index in sync with active artifact changes
  useEffect(() => {
    if (activeArtifact && artifactHistory.length > 0) {
      const idx = artifactHistory.findIndex((a) => a.id === activeArtifact.id);
      if (idx !== -1) setActiveVersionIndex(idx);
    }
  }, [activeArtifact, artifactHistory]);

  if (!activeArtifact) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeArtifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeArtifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeArtifact.title}.${activeArtifact.language === 'tsx' || activeArtifact.language === 'jsx' ? 'tsx' : activeArtifact.language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigateVersion = (direction: 'prev' | 'next') => {
    const newIdx = direction === 'prev' ? activeVersionIndex - 1 : activeVersionIndex + 1;
    if (newIdx >= 0 && newIdx < artifactHistory.length) {
      setActiveVersionIndex(newIdx);
      setActiveArtifact(artifactHistory[newIdx]);
    }
  };

  // Construct secure iframe srcDoc with Tailwind and Babel/React standalone for live previewing
  const getIframeSrcDoc = () => {
    if (activeArtifact.language === 'html') {
      return activeArtifact.content;
    }

    // Transpile React JSX/TSX on the fly inside the sandbox
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            body { margin: 0; font-family: system-ui, sans-serif; background: #0F172A; color: #F5F5F0; }
            ::-webkit-scrollbar { width: 6px; height: 6px; }
            ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.6); }
            ::-webkit-scrollbar-thumb { background: rgba(184, 184, 159, 0.3); border-radius: 3px; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${activeArtifact.content.replace(/import[\s\S]*?from[\s\S]*?;/g, '')}
            
            // Render the component
            const rootElement = document.getElementById('root');
            const root = ReactDOM.createRoot(rootElement);
            
            // Assume the main export is the component
            root.render(<${activeArtifact.title} />);
          </script>
        </body>
      </html>
    `;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-navy-800 border-l border-navy-700 z-10 relative overflow-hidden">
      {/* Top Header & Navigation */}
      <header className="px-6 py-4 bg-navy-800 border-b border-navy-700 flex items-center justify-between flex-shrink-0 shadow-lg">
        <div className="flex items-center space-x-3 truncate">
          <div className="w-8 h-8 bg-sand-500/20 border border-sand-500/30 rounded-xl flex items-center justify-center text-sand-400 flex-shrink-0 shadow-md">
            <Zap className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h3 className="text-xs font-bold text-white truncate flex items-center space-x-2">
              <span>{activeArtifact.title}</span>
              <span className="px-2 py-0.5 bg-navy-900 border border-navy-700 rounded text-sand-400 text-[10px] font-mono uppercase">{activeArtifact.language}</span>
            </h3>
            <p className="text-[10px] text-sand-400">Sandboxed Firecracker Artifact Preview</p>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Version History Navigator */}
          {artifactHistory.length > 1 && (
            <div className="flex items-center space-x-1 bg-navy-900 border border-navy-700 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => navigateVersion('prev')}
                disabled={activeVersionIndex === 0}
                className="p-1 text-sand-400 hover:text-white disabled:opacity-30 disabled:hover:text-sand-400 rounded-lg transition-colors"
                title="Previous Version"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-sand-300 font-mono font-semibold px-1">
                {activeVersionIndex + 1} / {artifactHistory.length}
              </span>
              <button
                onClick={() => navigateVersion('next')}
                disabled={activeVersionIndex === artifactHistory.length - 1}
                className="p-1 text-sand-400 hover:text-white disabled:opacity-30 disabled:hover:text-sand-400 rounded-lg transition-colors"
                title="Next Version"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* View Toggles */}
          <div className="flex items-center bg-navy-900 border border-navy-700 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${viewMode === 'preview' ? 'bg-navy-700 text-white shadow-md' : 'text-sand-400 hover:text-sand-200'}`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${viewMode === 'code' ? 'bg-navy-700 text-white shadow-md' : 'text-sand-400 hover:text-sand-200'}`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${viewMode === 'split' ? 'bg-navy-700 text-white shadow-md' : 'text-sand-400 hover:text-sand-200'}`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
          </div>

          {/* Download & Copy */}
          <div className="flex items-center space-x-1 border-l border-navy-700 pl-3">
            <button onClick={handleDownload} className="p-2 bg-navy-900 hover:bg-navy-700 border border-navy-700 rounded-xl text-sand-300 hover:text-white transition-all shadow-md" title="Download Artifact">
              <Download className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleCopy} className="p-2 bg-navy-900 hover:bg-navy-700 border border-navy-700 rounded-xl text-sand-300 hover:text-white transition-all shadow-md" title="Copy Code">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (Split / Preview / Code) */}
      <div className="flex-1 flex overflow-hidden relative bg-navy-900">
        <AnimatePresence mode="wait">
          {(viewMode === 'preview' || viewMode === 'split') && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`flex-1 h-full flex flex-col bg-navy-900 relative ${viewMode === 'split' ? 'border-r border-navy-700' : ''}`}
            >
              <div className="bg-navy-800 px-4 py-2 border-b border-navy-700 flex items-center justify-between flex-shrink-0">
                <span className="text-[10px] font-bold text-sand-400 font-mono uppercase tracking-wider">Live Sandbox Preview</span>
                <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Secure iframe</span>
                </span>
              </div>
              <iframe
                title="Sandboxed Artifact Preview"
                srcDoc={getIframeSrcDoc()}
                sandbox="allow-scripts allow-forms allow-modals"
                className="flex-1 w-full bg-navy-900 border-none"
              />
            </motion.div>
          )}

          {(viewMode === 'code' || viewMode === 'split') && (
            <motion.div
              key="code"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 h-full flex flex-col bg-navy-900 overflow-hidden relative"
            >
              <div className="bg-navy-800 px-4 py-2 border-b border-navy-700 flex items-center justify-between flex-shrink-0">
                <span className="text-[10px] font-bold text-sand-400 font-mono uppercase tracking-wider">Source Code</span>
                <span className="text-[10px] text-sand-500 font-mono">{activeArtifact.content.split('\n').length} lines</span>
              </div>
              <div className="flex-1 overflow-auto bg-[#1E1E1E]">
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={activeArtifact.language === 'tsx' || activeArtifact.language === 'jsx' ? 'typescript' : activeArtifact.language}
                  PreTag="div"
                  showLineNumbers
                  customStyle={{ margin: 0, padding: '1rem', background: '#1E1E1E', fontSize: '0.75rem', fontFamily: 'font-mono' }}
                >
                  {activeArtifact.content}
                </SyntaxHighlighter>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
