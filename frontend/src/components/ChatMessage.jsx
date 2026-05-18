import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { User, Bot, Volume2, Copy, Check } from 'lucide-react';
import speechService from '../services/speechService';
import toast from 'react-hot-toast';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

const ChatMessage = ({ message, isUser, timestamp, imageUrl, index, onOpenArtifact }) => {
  const [copied, setCopied] = useState(false);

  const handleSpeak = () => {
    if (!isUser && message) {
      speechService.speak(message);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success('Message copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`flex items-start space-x-3 mb-6 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
          isUser 
            ? 'bg-gradient-to-br from-sand-500 to-sand-700' 
            : 'bg-gradient-to-br from-warm-400 to-warm-600'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </motion.div>
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full lg:max-w-3xl`}>
        {/* Image if present */}
        {imageUrl && (
          <motion.img 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            src={imageUrl} 
            alt="Uploaded content" 
            className="max-w-full h-auto rounded-xl mb-3 border border-navy-700 shadow-md"
          />
        )}
        
        {/* Message Bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`message-bubble relative group w-full ${isUser ? 'user-message' : 'ai-message'}`}
        >
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : 'text';
                  const codeString = String(children).replace(/\n$/, '');
                  const isArtifactable = language === 'html' || language === 'xml' || language === 'javascript' || language === 'js' || language === 'react' || codeString.split('\n').length > 10;
                  
                  return !inline ? (
                    <div className="relative group/code mt-4 mb-4">
                      {isArtifactable && onOpenArtifact && (
                        <button
                          onClick={() => onOpenArtifact({ code: codeString, language })}
                          className="absolute right-4 top-4 z-10 px-3 py-1.5 bg-sand-200/20 hover:bg-sand-200/40 text-sand-300 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors border border-sand-600/30 backdrop-blur-sm opacity-0 group-hover/code:opacity-100"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          <span>Open Artifact</span>
                        </button>
                      )}
                      <div className="rounded-xl overflow-hidden border border-navy-800 shadow-xl">
                        <div className="flex items-center px-4 py-2 bg-[#2D2D2D] border-b border-[#404040]">
                          <span className="text-xs font-mono text-gray-400 capitalize">{language}</span>
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={language}
                          PreTag="div"
                          customStyle={{ margin: 0, padding: '1.5rem', background: '#1E1E1E', fontSize: '0.875rem' }}
                          {...props}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  ) : (
                    <code className="bg-sand-100 text-navy-800 px-1.5 py-0.5 rounded-md font-mono text-sm" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
          
          {/* Action Buttons */}
          <div className={`absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 ${
            isUser ? '-left-16' : '-right-16'
          }`}>
            {!isUser && speechService.isSupported() && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSpeak}
                className="p-2 bg-navy-800 rounded-lg shadow-md hover:bg-navy-700 transition-colors border border-navy-700"
                title="Read aloud"
              >
                <Volume2 className="w-4 h-4 text-warm-600" />
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className="p-2 bg-navy-800 rounded-lg shadow-md hover:bg-navy-700 transition-colors border border-navy-700"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-warm-600" />
              )}
            </motion.button>
          </div>
        </motion.div>
        
        {/* Timestamp */}
        {timestamp && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
            className="text-xs text-warm-400 mt-2 px-1"
          >
            {formatTime(timestamp)}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.string.isRequired,
  isUser: PropTypes.bool.isRequired,
  timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
  imageUrl: PropTypes.string,
  index: PropTypes.number,
  onOpenArtifact: PropTypes.func,
};

export default ChatMessage;
