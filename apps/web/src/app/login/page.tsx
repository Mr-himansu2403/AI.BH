'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Bot, Mail, Github, LogIn, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('demo@aibh.com');
  const [password, setPassword] = useState('demo1234');
  const supabase = createClient();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJavaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const JAVA_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
      const response = await fetch(`${JAVA_BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      toast.success('Successfully logged in via Java Backend!');
      router.push('/chat/workspace_main');
    } catch (error: any) {
      toast.error(error.message || 'Java Auth failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-navy-800 border border-navy-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-sand-500 hover:text-white transition-colors flex items-center space-x-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <div className="w-10 h-10 bg-warm-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">AI.bh Gateway</h1>
          <p className="text-sand-400 text-sm mb-8">Access your secure Java-powered AI workspace.</p>

          <div className="flex flex-col space-y-4">
            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-white text-navy-900 hover:bg-sand-100 h-12 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Google</span>
              </button>

              <button
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-navy-900 text-white hover:bg-black h-12 rounded-xl border border-navy-700 font-semibold transition-all disabled:opacity-50"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </button>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-navy-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-navy-800 px-2 text-sand-500 font-semibold">Or use Java Auth</span>
              </div>
            </div>

            {/* Java Auth Form */}
            <form onSubmit={handleJavaLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-sand-400 uppercase tracking-wider ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-navy-900 border border-navy-700 rounded-xl px-4 text-white focus:outline-none focus:border-warm-500 transition-colors"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-sand-400 uppercase tracking-wider ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-navy-900 border border-navy-700 rounded-xl px-4 text-white focus:outline-none focus:border-warm-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-warm-500 hover:bg-warm-600 text-white h-12 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Sign In with Java'}
                <LogIn className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
        
        <div className="p-6 bg-navy-900/50 border-t border-navy-700 text-center">
          <p className="text-[10px] text-sand-500 leading-relaxed">
            By continuing, you agree to the Enterprise Master Service Agreement and Data Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
