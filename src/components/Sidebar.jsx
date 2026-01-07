import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Plus, MessageCircle, Settings, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = ({ onNewChat, chatHistory = [], currentChatId, onSelectChat }) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleNewChat = () => {
    onNewChat();
    toast.success('New chat started');
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-beige-200"
      >
        {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? 0 : 280,
          opacity: isCollapsed ? 0 : 1
        }}
        transition={{ duration: 0.3 }}
        className={`fixed lg:relative inset-y-0 left-0 z-40 sidebar overflow-hidden ${
          isCollapsed ? 'lg:w-0' : 'lg:w-80'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sand-500 to-sand-700 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-warm-900">AI.BH</h1>
                <p className="text-xs text-warm-600">Assistant</p>
              </div>
            </div>
          </div>

          {/* New Chat Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 bg-sand-600 hover:bg-sand-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl mb-6"
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </motion.button>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-sm font-medium text-warm-700 mb-3 px-2">Recent Chats</h3>
            <div className="space-y-2">
              {chatHistory.length > 0 ? (
                chatHistory.map((chat, index) => (
                  <motion.button
                    key={chat.id || index}
                    whileHover={{ x: 4 }}
                    onClick={() => onSelectChat(chat.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-left ${
                      currentChatId === chat.id
                        ? 'bg-sand-100 border border-sand-200'
                        : 'hover:bg-beige-100'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 text-warm-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-warm-800 truncate">
                        {chat.title || `Chat ${index + 1}`}
                      </p>
                      <p className="text-xs text-warm-500 truncate">
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-8 h-8 text-warm-300 mx-auto mb-2" />
                  <p className="text-sm text-warm-500">No chats yet</p>
                  <p className="text-xs text-warm-400">Start a conversation!</p>
                </div>
              )}
            </div>
          </div>

          {/* User Profile Section */}
          <div className="border-t border-beige-300 pt-4 mt-4">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowProfile(!showProfile)}
                className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-beige-100 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-warm-400 to-warm-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-warm-800">{user?.name || 'User'}</p>
                  <p className="text-xs text-warm-500">{user?.email}</p>
                </div>
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-beige-200 overflow-hidden"
                  >
                    <button className="w-full flex items-center space-x-3 p-3 hover:bg-beige-50 transition-colors text-left">
                      <Settings className="w-4 h-4 text-warm-500" />
                      <span className="text-sm text-warm-700">Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 transition-colors text-left border-t border-beige-100"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;