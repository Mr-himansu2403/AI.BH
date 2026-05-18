import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, Play, FileCode2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PropTypes from 'prop-types';

const ArtifactPanel = ({ artifact, onClose }) => {
  const [view, setView] = useState('preview'); // 'preview' or 'code'

  if (!artifact) return null;

  const isHtml = artifact.language === 'html' || artifact.language === 'xml' || artifact.code.includes('<html');

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="flex flex-col h-full bg-white border-l border-sand-200 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-sand-200 bg-gradient-to-r from-sand-50 to-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center shadow-md">
            <FileCode2 className="w-4 h-4 text-warm-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-navy-900">Generated Artifact</h2>
            <p className="text-xs text-sand-500 capitalize">{artifact.language} snippet</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Toggle Switch */}
          {isHtml && (
            <div className="flex items-center space-x-1 bg-sand-100 rounded-lg p-1 border border-sand-200 shadow-inner">
              <button 
                onClick={() => setView('preview')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                  view === 'preview' 
                    ? 'bg-white text-navy-800 shadow-sm' 
                    : 'text-sand-500 hover:text-navy-700 hover:bg-white/50'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button 
                onClick={() => setView('code')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                  view === 'code' 
                    ? 'bg-white text-navy-800 shadow-sm' 
                    : 'text-sand-500 hover:text-navy-700 hover:bg-white/50'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Code</span>
              </button>
            </div>
          )}

          <button 
            onClick={onClose}
            className="p-2 text-sand-400 hover:text-navy-800 hover:bg-sand-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden bg-sand-50/30 p-6 relative">
        <AnimatePresence mode="wait">
          {view === 'preview' && isHtml ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full h-full border border-sand-200 rounded-xl overflow-hidden bg-white shadow-sm"
            >
              <iframe
                title="Artifact Preview"
                srcDoc={artifact.code}
                sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                className="w-full h-full border-none"
              />
            </motion.div>
          ) : (
            <motion.div 
              key="code"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full h-full overflow-hidden rounded-xl border border-navy-800 bg-[#1E1E1E] shadow-xl flex flex-col"
            >
              <div className="flex items-center px-4 py-2 bg-[#2D2D2D] border-b border-[#404040]">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                </div>
                <span className="ml-4 text-xs font-mono text-gray-400">artifact.{artifact.language === 'html' ? 'html' : 'js'}</span>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={artifact.language || 'javascript'}
                  customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '0.875rem' }}
                >
                  {artifact.code}
                </SyntaxHighlighter>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

ArtifactPanel.propTypes = {
  artifact: PropTypes.shape({
    code: PropTypes.string.isRequired,
    language: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

export default ArtifactPanel;
