import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Volume2, Copy, Check } from 'lucide-react';
import speechService from '../services/speechService';
import toast from 'react-hot-toast';

const ChatMessage = ({ message, isUser, timestamp, imageUrl, index }) => {
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
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-xs lg:max-w-2xl`}>
        {/* Image if present */}
        {imageUrl && (
          <motion.img 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
            src={imageUrl} 
            alt="Uploaded content" 
            className="max-w-full h-auto rounded-xl mb-3 border border-beige-200 shadow-md"
          />
        )}
        
        {/* Message Bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
          className={`message-bubble relative group ${isUser ? 'user-message' : 'ai-message'}`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
          
          {/* Action Buttons */}
          <div className={`absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 ${
            isUser ? '-left-16' : '-right-16'
          }`}>
            {!isUser && speechService.isSupported() && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSpeak}
                className="p-2 bg-white rounded-lg shadow-md hover:bg-beige-50 transition-colors border border-beige-200"
                title="Read aloud"
              >
                <Volume2 className="w-4 h-4 text-warm-600" />
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className="p-2 bg-white rounded-lg shadow-md hover:bg-beige-50 transition-colors border border-beige-200"
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

export default ChatMessage;