'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log("Login attempt with email:", email);

    try {
      // Sign in using credentials and allow redirection
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log("Login result:", result);

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        console.log("Login successful, preparing to redirect");
        
        // Redirect to dashboard
        router.refresh();
        
        // Use a timeout to ensure the session is fully updated before redirecting
        setTimeout(() => {
          console.log("Redirecting to dashboard");
          
          // Route to the main dashboard page which will handle role-specific redirects
          router.push(`/${locale}/dashboard`);
          
          // Force a page reload to ensure session data is fresh
          window.location.href = `/${locale}/dashboard`;
        }, 500);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('common.messages.error'));
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