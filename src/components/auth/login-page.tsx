'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function LoginPage() {
  const { login, navigateTo } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const success = login(email, password);

    if (!success) {
      setError('Invalid email or password. Try the demo accounts below.');
      toast.error('Login failed', {
        description: 'Invalid email or password',
      });
    }

    setIsLoading(false);
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/30 dark:bg-orange-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-200/30 dark:bg-red-900/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-200/20 dark:bg-amber-900/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-orange-100 dark:border-gray-800 shadow-xl shadow-orange-100/50 dark:shadow-black/20">
          <CardHeader className="text-center space-y-4 pb-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex justify-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                MMODRM
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Municipal Disaster Risk Reduction Management Office
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-900"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors"
                    onClick={() => {
                      toast.info('Password reset functionality coming soon');
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-md shadow-orange-500/25 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Demo login hints */}
            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-orange-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@mmodrm.gov')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-orange-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">Admin</p>
                    <p className="text-[10px] text-muted-foreground truncate">admin@mmodrm.gov</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('dispatcher@mmodrm.gov')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-amber-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-gray-800 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Dispatcher</p>
                    <p className="text-[10px] text-muted-foreground truncate">dispatcher@mmodrm.gov</p>
                  </div>
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-center pb-6">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => navigateTo('register')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-semibold transition-colors"
              >
                Register
              </button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
