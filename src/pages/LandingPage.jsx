import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bot, MessageCircle, Mic, Image, Sparkles, Users, Shield, Zap } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Intelligent Conversations',
      description: 'Engage in natural, context-aware conversations with AI.BH'
    },
    {
      icon: Mic,
      title: 'Voice Interaction',
      description: 'Speak naturally and hear responses with advanced voice technology'
    },
    {
      icon: Image,
      title: 'Visual Understanding',
      description: 'Upload images and get detailed analysis and insights'
    },
    {
      icon: Users,
      title: 'For Everyone',
      description: 'Perfect for students, professionals, and curious minds'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your conversations are protected with enterprise-grade security'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get instant responses powered by cutting-edge AI technology'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-white to-sand-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-beige-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-sand-500 to-sand-700 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-warm-900">AI.BH</h1>
                <p className="text-xs text-warm-600">Assistant</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link to="/login" className="text-warm-700 hover:text-warm-900 font-medium transition-colors">
                Login
              </Link>
              <Link to="/signup" className="btn-primary">
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-sand-500 to-sand-700 rounded-2xl flex items-center justify-center shadow-2xl">
                <Bot className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-warm-900 mb-6">
              Meet <span className="text-sand-600">AI.BH</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-warm-700 mb-4 max-w-3xl mx-auto">
              Your intelligent, friendly AI assistant for learning, building, and solving problems
            </p>
            
            <p className="text-lg text-warm-600 mb-12 max-w-2xl mx-auto">
              Experience conversations that feel natural, get help with complex topics, and unlock your potential with AI that truly understands.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup" className="btn-primary text-lg px-8 py-4">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Chatting Free
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-warm-900 mb-4">
              Why Choose AI.BH?
            </h2>
            <p className="text-xl text-warm-600 max-w-2xl mx-auto">
              Designed for students, professionals, and anyone curious about the world
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-beige-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-sand-500 to-sand-700 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-warm-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-warm-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sand-600 to-sand-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-sand-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already experiencing the future of AI assistance
            </p>
            <Link 
              to="/signup" 
              className="inline-flex items-center bg-white text-sand-700 font-semibold px-8 py-4 rounded-xl hover:bg-beige-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Bot className="w-5 h-5 mr-2" />
              Create Your Account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-warm-900 text-warm-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-sand-500 to-sand-700 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI.BH</h3>
                <p className="text-xs">Intelligent Assistant</p>
              </div>
            </div>
            <p className="text-sm">
              © 2024 AI.BH. Crafted with care for everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;