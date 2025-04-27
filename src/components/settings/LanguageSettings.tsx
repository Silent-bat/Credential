'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { availableLocales, Locale } from '@/i18n/config';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface LanguageSettingsProps {
  initialLanguage: string;
  userId: string;
}

export function LanguageSettings({ initialLanguage, userId }: LanguageSettingsProps) {
  const t = useTranslations();
  const router = useRouter();
  const [language, setLanguage] = useState<string>(initialLanguage);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = async () => {
    try {
      setIsLoading(true);
      await axios.put('/api/user/settings/language', { language });
      toast.success(t('settings.languageUpdated'));
      
      // Reload the page to apply the language change immediately
      router.refresh();
    } catch (error) {
      console.error('Failed to update language:', error);
      toast.error(t('common.messages.error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.language')}</CardTitle>
        <CardDescription>
          {t('settings.changeLanguageDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="language" className="text-sm font-medium leading-none">
            {t('common.labels.language')}
          </label>
          <Select 
            value={language} 
            onValueChange={setLanguage}
            disabled={isLoading}
          >
            <SelectTrigger id="language" className="w-full">
              <SelectValue placeholder={t('settings.selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              {availableLocales.map((locale) => (
                <SelectItem key={locale.id} value={locale.id}>
                  {locale.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isLoading || language === initialLanguage}
        >
          {isLoading ? t('common.messages.loading') : t('common.buttons.save')}
        </Button>
      </CardContent>
    </Card>
  );
} 