'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export function LoginForm() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const tAuth = useTranslations('auth');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setDebugInfo('Login process started');

    try {
      // Sign in using credentials
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setDebugInfo(`Sign-in error: ${result.error}`);
        setIsLoading(false);
        return;
      }

      setDebugInfo('Sign-in successful, getting session...');
      
      // Wait a moment for the session to be properly established
      setTimeout(async () => {
        try {
          // Get the updated session after login
          const session = await getSession();
          
          if (!session?.user) {
            setError('Session not found after login');
            setDebugInfo('No session found after login');
            setIsLoading(false);
            return;
          }
          
          // Extract and normalize the user role
          const userRole = (session.user.role || '').toUpperCase();
          setDebugInfo(`Session retrieved, user role: ${userRole}`);
          
          // Determine the correct dashboard path based on role
          let dashboardPath;
          
          if (userRole === 'ADMIN') {
            dashboardPath = `/${locale}/dashboard/institution`;
          } else if (userRole === 'INSTITUTION') {
            dashboardPath = `/${locale}/dashboard/institution`;
          } else {
            dashboardPath = `/${locale}/dashboard`;
          }
          
          setDebugInfo(`Redirecting to: ${dashboardPath}`);
          console.log(`Redirecting to: ${dashboardPath}`);
          
          // Perform the redirect
          router.push(dashboardPath);
          router.refresh(); // Force a refresh to ensure the redirect happens
          
        } catch (sessionErr) {
          console.error('Session error:', sessionErr);
          setError('Error retrieving session after login');
          setDebugInfo(`Session error: ${sessionErr}`);
          setIsLoading(false);
        }
      }, 500); // Short delay to ensure session is established
      
    } catch (err) {
      console.error('Login error:', err);
      setError(t('common.messages.error'));
      setDebugInfo(`Unexpected error: ${err}`);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">{t('common.labels.email')}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t('common.labels.password')}</Label>
            <a 
              href={`/${locale}/auth/forgot-password`}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              {tAuth('forgotPassword')}
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex items-center">
        <Checkbox
          id="remember-me"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
        />
        <Label 
          htmlFor="remember-me" 
          className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
        >
          {tAuth('rememberMe')}
        </Label>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
        </div>
      )}
      
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-900/20 text-xs text-gray-500">
          Debug: {debugInfo}
        </div>
      )}

      <div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? t('common.messages.loading') : tAuth('login')}
        </Button>
      </div>
    </form>
  );
} 