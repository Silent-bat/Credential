import { auth } from "@/auth";
import { LanguageSettings } from "@/components/settings/LanguageSettings";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export default async function SettingsPage() {
  const session = await auth();
  const t = useTranslations();
  
  if (!session?.user) {
    return null;
  }
  
  // Get the user's preferences from the database
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      preferredLocale: true,
      email: true,
      name: true,
    },
  });
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">{t('settings.title')}</h1>
      
      <Tabs defaultValue="language" className="space-y-6">
        <TabsList>
          <TabsTrigger value="language">{t('settings.language')}</TabsTrigger>
          <TabsTrigger value="profile">{t('settings.profile')}</TabsTrigger>
          <TabsTrigger value="security">{t('settings.security')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="language" className="space-y-6">
          <LanguageSettings 
            initialLanguage={user.preferredLocale} 
            userId={user.id} 
          />
        </TabsContent>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.profile')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t('common.labels.name')}: {user.name}</p>
              <p>{t('common.labels.email')}: {user.email}</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.security')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Security settings will be added in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 