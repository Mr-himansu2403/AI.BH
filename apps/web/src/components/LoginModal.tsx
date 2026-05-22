'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Bot, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginModal() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="px-8 py-4 bg-gradient-to-r from-warm-500 to-warm-600 hover:from-warm-600 hover:to-warm-700 text-white font-bold rounded-xl shadow-2xl flex items-center space-x-3 transition-all hover:scale-105 border border-warm-400/30 w-full sm:w-auto justify-center">
          <Bot className="w-5 h-5" />
          <span>Launch Enterprise Workspace</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-navy-800 border-navy-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center space-x-2">
            <Bot className="w-6 h-6 text-warm-500" />
            <span>AI.bh Gateway</span>
          </DialogTitle>
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

          const handlePhoneLogin = async (phone: string) => {
            setIsLoading(true);
            try {
              const { error } = await supabase.auth.signInWithOtp({
                phone: phone,
              });
              if (error) throw error;
              toast.success('Check your phone for the login code!');
            } catch (error: any) {
              toast.error(error.message || 'Failed to send SMS');
            } finally {
              setIsLoading(false);
            }
          };

          return (
            <Dialog>
          ...
                <div className="flex flex-col space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full bg-white text-navy-900 hover:bg-sand-100 border-none h-12 text-sm font-semibold transition-all flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span>Google</span>
                    </Button>

                    <Button
                      onClick={handleGitHubLogin}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full bg-navy-900 text-white hover:bg-navy-950 border border-navy-700 h-12 text-sm font-semibold transition-all flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                      <span>GitHub</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs text-sand-400">Phone Number Login</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="bg-navy-900 border-navy-700 text-sand-100"
                      />
                      <Button 
                        variant="secondary" 
                        className="bg-warm-500 hover:bg-warm-600 text-white"
                        onClick={() => {
                          const val = (document.getElementById('phone') as HTMLInputElement).value;
                          handlePhoneLogin(val);
                        }}
                      >
                        Send
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
          ...
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-navy-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-navy-800 px-2 text-sand-500">Or business email</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full border-navy-700 hover:bg-navy-700 text-sand-100 transition-all h-12"
              onClick={() => toast.info('Email login coming soon in the next sprint.')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Sign in with SAML / SSO
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-center text-sand-500">
          By continuing, you agree to the Enterprise Master Service Agreement and Data Privacy Policy.
        </p>
      </DialogContent>
    </Dialog>
  );
}
