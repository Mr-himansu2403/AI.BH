import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Image, X, Paperclip, FileText, Loader2 } from 'lucide-react';
import speechService from '../services/speechService';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';

const ChatInput = ({ onSendMessage, disabled, statusMessage }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  const textareaRef = useRef(null);
  const attachMenuRef = useRef(null);

  // Close attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || selectedImage) {
      onSendMessage(message.trim(), selectedImage);
      setMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleVoiceInput = () => {
    if (!speechService.isSupported()) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening(
        (transcript) => {
          setMessage(prev => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
          toast.success('Voice input captured!');
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          toast.error('Voice input failed. Please try again.');
        }
      );
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setSelectedImage(base64);
        setImagePreview(base64);
        setShowAttachMenu(false);
        toast.success('Image selected!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      setShowAttachMenu(false);
      try {
        await chatAPI.uploadDocument(file);
        toast.success(`Document "${file.name}" indexed for RAG!`);
      } catch (error) {
        toast.error(error.message || 'Failed to index document.');
      } finally {
        setIsUploading(false);
        if (docInputRef.current) docInputRef.current.value = '';
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-navy-800 border-t border-navy-700 p-4">
      {/* Image Preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Selected" 
                className="max-w-32 max-h-32 rounded-xl border border-navy-700 shadow-md"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
              >
                <X className="w-3 h-3" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={docInputRef}
          onChange={handleDocSelect}
          accept=".pdf,.txt,.md,.doc,.docx,.json,.csv"
          className="hidden"
        />
        
        {/* Attachment Button & Menu */}
        <div className="relative" ref={attachMenuRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`p-3 rounded-xl transition-all duration-200 ${
              showAttachMenu ? 'bg-sand-100 text-sand-700' : 'text-warm-500 hover:text-warm-700 hover:bg-navy-800'
            }`}
            title="Attach file"
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-sand-600" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </motion.button>

          <AnimatePresence>
            {showAttachMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute bottom-full mb-2 left-0 bg-navy-800 rounded-xl shadow-2xl border border-navy-700 p-2 min-w-[160px] z-50"
              >
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-navy-700 rounded-lg transition-colors text-warm-700"
                >
                  <Image className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-navy-700 rounded-lg transition-colors text-warm-700"
                >
                  <FileText className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Document</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Press Enter to send)"
            className="w-full px-4 py-3 pr-12 bg-navy-700 border border-beige-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sand-500 focus:border-transparent transition-all duration-200 resize-none min-h-[48px] max-h-[120px]"
            disabled={disabled || isUploading}
            rows={1}
          />
          
          {/* Voice Input Button */}
          {speechService.isSupported() && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleVoiceInput}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                isListening 
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                  : 'text-warm-500 hover:text-warm-700 hover:bg-navy-800'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input'}
              disabled={disabled || isUploading}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </motion.button>
          )}
        </div>

        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={disabled || isUploading || (!message.trim() && !selectedImage)}
          className="p-3 bg-sand-600 text-white rounded-xl hover:bg-sand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:hover:scale-100"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </form>

      {statusMessage && (
        <p className="mt-3 text-xs text-warm-500">
          {statusMessage}
        </p>
      )}

      {/* Voice Listening Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 flex items-center justify-center space-x-2 text-red-600"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-red-500 rounded-full"
            />
            <span className="text-sm font-medium">Listening...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

ChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  statusMessage: PropTypes.string,
};

export default ChatInput;
