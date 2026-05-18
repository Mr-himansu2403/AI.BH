/**
 * ArtifactPanel.jsx — Claude-style split-screen Artifact renderer
 *
 * Features:
 *   - Live HTML/CSS/JS preview in sandboxed iframe
 *   - Syntax-highlighted source view (VS Code Dark+)
 *   - Copy to clipboard
 *   - Download as file
 *   - Artifact history navigation (← →)
 *   - Animated slide-in / slide-out transitions
 *   - Title shows language and artifact type
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Code, Play, FileCode2, Copy, Download,
  ChevronLeft, ChevronRight, Check, RefreshCw,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PropTypes from 'prop-types';
import { useArtifactStore } from '../store';

// ── Language → display meta ──────────────────────────────────────────────────
const LANG_META = {
  html:       { label: 'HTML',       color: 'text-orange-400',  icon: '🌐', ext: 'html', isRenderable: true  },
  xml:        { label: 'XML',        color: 'text-orange-300',  icon: '📄', ext: 'xml',  isRenderable: false },
  css:        { label: 'CSS',        color: 'text-blue-400',    icon: '🎨', ext: 'css',  isRenderable: false },
  javascript: { label: 'JavaScript', color: 'text-yellow-400',  icon: '⚡', ext: 'js',   isRenderable: true  },
  js:         { label: 'JavaScript', color: 'text-yellow-400',  icon: '⚡', ext: 'js',   isRenderable: true  },
  react:      { label: 'React',      color: 'text-cyan-400',    icon: '⚛️', ext: 'jsx',  isRenderable: true  },
  jsx:        { label: 'React',      color: 'text-cyan-400',    icon: '⚛️', ext: 'jsx',  isRenderable: true  },
  python:     { label: 'Python',     color: 'text-green-400',   icon: '🐍', ext: 'py',   isRenderable: false },
  java:       { label: 'Java',       color: 'text-red-400',     icon: '☕', ext: 'java', isRenderable: false },
  sql:        { label: 'SQL',        color: 'text-purple-400',  icon: '🗄️', ext: 'sql',  isRenderable: false },
  json:       { label: 'JSON',       color: 'text-lime-400',    icon: '{}', ext: 'json', isRenderable: false },
  bash:       { label: 'Bash',       color: 'text-gray-300',    icon: '💻', ext: 'sh',   isRenderable: false },
  text:       { label: 'Code',       color: 'text-gray-400',    icon: '📝', ext: 'txt',  isRenderable: false },
};

const getMeta = (artifact) => {
  const lang = (artifact.language || '').toLowerCase();
  const isHtmlContent = artifact.code?.includes('<html') || artifact.code?.includes('<!DOCTYPE');
  if (lang === 'html' || isHtmlContent) return LANG_META.html;
  return LANG_META[lang] || LANG_META.text;
};

// ─────────────────────────────────────────────────────────────────────────────
const ArtifactPanel = ({ artifact, onClose }) => {
  const [view, setView] = useState('preview');
  const [copied, setCopied]   = useState(false);
  const [reloading, setReloading] = useState(false);
  const { artifactHistory, navigateArtifact } = useArtifactStore();

  const meta = getMeta(artifact);
  const canPreview = meta.isRenderable;
  const currentIdx = artifactHistory.findIndex((a) => a.id === artifact?.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < artifactHistory.length - 1;

  // Auto-switch to 'code' view if artifact isn't renderable
  const activeView = canPreview ? view : 'code';

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(artifact.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available
    }
  }, [artifact.code]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([artifact.code], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `artifact.${meta.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [artifact.code, meta.ext]);

  const handleReload = () => {
    setReloading(true);
    setTimeout(() => setReloading(false), 300);
  };

  const getIframeSrcDoc = () => {
    const lang = (artifact?.language || '').toLowerCase();
    const isHtmlContent = artifact?.code?.includes('<html') || artifact?.code?.includes('<!DOCTYPE');
    if (lang === 'html' || isHtmlContent) {
      return artifact?.code || '';
    }

    const cleanCode = (artifact?.code || '').replace(/import[\s\S]*?from[\s\S]*?;/g, '');
    const componentTitle = artifact?.title || 'App';

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
            body { margin: 0; font-family: system-ui, sans-serif; background: #0F172A; color: #F8FAFC; }
            ::-webkit-scrollbar { width: 6px; height: 6px; }
            ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.6); }
            ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 3px; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${cleanCode}
            
            const rootElement = document.getElementById('root');
            const root = ReactDOM.createRoot(rootElement);
            
            let CompName = "${componentTitle}";
            if (CompName === "Generated Artifact" || CompName === "App") {
              const match = /export default function (\w+)/.exec(\`${cleanCode.replace(/`/g, '\\`')}\`);
              if (match) CompName = match[1];
              else {
                const match2 = /function (\w+)/.exec(\`${cleanCode.replace(/`/g, '\\`')}\`);
                if (match2) CompName = match2[1];
                else {
                  const match3 = /const (\w+) =/.exec(\`${cleanCode.replace(/`/g, '\\`')}\`);
                  if (match3) CompName = match3[1];
                }
              }
            }
            
            try {
              const ElementToRender = eval(CompName);
              root.render(<ElementToRender />);
            } catch (e) {
              root.render(
                <div style={{ padding: '20px', color: '#EF4444', fontFamily: 'monospace' }}>
                  <h3>Sandbox Render Error</h3>
                  <p>{e.message}</p>
                </div>
              );
            }
          </script>
        </body>
      </html>
    `;
  };

  if (!artifact) return null;

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="flex flex-col h-full bg-[#0F0F13] border-l border-white/10"
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#16161C]">
        {/* Left: icon + title */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
            <FileCode2 className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">
              {artifact.title || 'Generated Artifact'}
            </h2>
            <p className={`text-xs font-mono ${meta.color} flex items-center space-x-1`}>
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
            </p>
          </div>
        </div>

        {/* Center: history navigation */}
        {artifactHistory.length > 1 && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigateArtifact('prev')}
              disabled={!hasPrev}
              className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Previous artifact"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-white/40 px-1 font-mono">
              {currentIdx + 1} / {artifactHistory.length}
            </span>
            <button
              onClick={() => navigateArtifact('next')}
              disabled={!hasNext}
              className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Next artifact"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right: actions */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {/* Preview / Code toggle */}
          {canPreview && (
            <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10 mr-2">
              <button
                onClick={() => setView('preview')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                  activeView === 'preview'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                <Play className="w-3 h-3" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setView('code')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                  activeView === 'code'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                <Code className="w-3 h-3" />
                <span>Code</span>
              </button>
            </div>
          )}

          {/* Reload (preview only) */}
          {canPreview && activeView === 'preview' && (
            <button
              onClick={handleReload}
              className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Reload preview"
            >
              <RefreshCw className={`w-4 h-4 ${reloading ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Copy code"
          >
            {copied
              ? <Check className="w-4 h-4 text-green-400" />
              : <Copy className="w-4 h-4" />
            }
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title={`Download as .${meta.ext}`}
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">

          {/* ── PREVIEW (sandboxed iframe) ─────────────────────────────────── */}
          {activeView === 'preview' && canPreview && !reloading && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white"
            >
              {/* Browser chrome bar */}
              <div className="flex items-center px-4 py-2 bg-[#1C1C24] border-b border-white/10 space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex-1 bg-white/5 rounded-md px-3 py-1 text-xs text-white/30 font-mono ml-2">
                  artifact-preview://localhost
                </div>
              </div>
              <iframe
                key={reloading ? 'reload' : 'stable'}
                title="Artifact Preview"
                srcDoc={getIframeSrcDoc()}
                sandbox="allow-scripts allow-forms allow-same-origin allow-modals allow-popups"
                className="w-full border-none bg-white"
                style={{ height: 'calc(100% - 40px)' }}
              />
            </motion.div>
          )}

          {/* ── CODE VIEW ─────────────────────────────────────────────────── */}
          {activeView === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col overflow-hidden"
            >
              {/* Editor title bar */}
              <div className="flex items-center px-4 py-2 bg-[#1C1C24] border-b border-white/10 space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <span className="ml-3 text-xs font-mono text-white/30">
                  artifact.{meta.ext}
                </span>
                <span className={`ml-auto text-xs ${meta.color} font-mono font-semibold`}>
                  {meta.icon} {meta.label}
                </span>
              </div>

              {/* Code area */}
              <div className="flex-1 overflow-auto">
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={artifact.language || 'text'}
                  showLineNumbers
                  lineNumberStyle={{ color: '#4B5563', fontSize: '0.75rem', minWidth: '2.5rem' }}
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    background: '#0F0F13',
                    fontSize: '0.8125rem',
                    lineHeight: '1.6',
                    minHeight: '100%',
                  }}
                >
                  {artifact.code}
                </SyntaxHighlighter>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer: line count + char count ──────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-2 border-t border-white/10 bg-[#16161C] text-xs text-white/30 font-mono">
        <span>{artifact.code.split('\n').length} lines</span>
        <span>{artifact.code.length.toLocaleString()} chars</span>
      </div>
    </motion.div>
  );
};

ArtifactPanel.propTypes = {
  artifact: PropTypes.shape({
    id: PropTypes.number,
    code: PropTypes.string.isRequired,
    language: PropTypes.string,
    title: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

export default ArtifactPanel;
