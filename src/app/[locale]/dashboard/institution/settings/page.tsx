import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  Save, 
  Building, 
  Palette, 
  Bell, 
  Shield, 
  CreditCard,
  Upload,
  ExternalLink,
  Phone,
  Globe,
  Mail,
  MapPin,
  Clock
} from "lucide-react";
import { getTranslations } from 'next-intl/server';
import { db } from "@/lib/db";

type Props = {
  params: { locale: string }
};

export default async function InstitutionSettingsPage({ params }: Props) {
  // Properly await params to avoid warnings
  const resolvedParams = await Promise.resolve(params);
  const { locale } = resolvedParams;

  // Get translations
  const settingsT = await getTranslations({ locale, namespace: 'settings' });
  const commonT = await getTranslations({ locale, namespace: 'common' });

  // Safe translation utility to handle missing keys
  const safeTranslation = (translator: any, key: string, fallback: string): string => {
    try {
      return translator.raw(key) || fallback;
    } catch {
      return fallback;
    }
  };

  // Pre-translate strings with fallbacks - using fixed hardcoded fallbacks for error messages
  const translations = {
    back: safeTranslation(commonT, 'buttons.back', 'Back to Dashboard'),
    institutionSettings: safeTranslation(settingsT, 'institutionSettings', 'Institution Settings'),
    general: safeTranslation(settingsT, 'general', 'General'),
    appearance: safeTranslation(settingsT, 'appearance', 'Appearance'),
    notifications: safeTranslation(settingsT, 'notifications', 'Notifications'),
    security: safeTranslation(settingsT, 'security', 'Security'),
    generalSettings: safeTranslation(settingsT, 'generalSettings', 'General Settings'),
    generalDescription: safeTranslation(settingsT, 'generalDescription', 'Manage your institution\'s basic information.'),
    institutionName: safeTranslation(settingsT, 'institutionName', 'Institution Name'),
    emailAddress: safeTranslation(settingsT, 'emailAddress', 'Email Address'),
    website: safeTranslation(settingsT, 'website', 'Website'),
    phoneNumber: safeTranslation(settingsT, 'phoneNumber', 'Phone Number'),
    timezone: safeTranslation(settingsT, 'timezone', 'Timezone'),
    address: safeTranslation(settingsT, 'address', 'Address'),
    saveChanges: safeTranslation(commonT, 'buttons.save', 'Save Changes'),
    appearanceSettings: safeTranslation(settingsT, 'appearanceSettings', 'Appearance Settings'),
    appearanceDescription: safeTranslation(settingsT, 'appearanceDescription', 'Customize how your credentials and certificates appear.'),
    institutionLogo: safeTranslation(settingsT, 'institutionLogo', 'Institution Logo'),
    changeLogo: safeTranslation(settingsT, 'changeLogo', 'Change Logo'),
    brandColors: safeTranslation(settingsT, 'brandColors', 'Brand Colors'),
    primaryColor: safeTranslation(settingsT, 'primaryColor', 'Primary Color'),
    secondaryColor: safeTranslation(settingsT, 'secondaryColor', 'Secondary Color'),
    certificateTemplates: safeTranslation(settingsT, 'certificateTemplates', 'Certificate Templates'),
    classic: safeTranslation(settingsT, 'classic', 'Classic'),
    errorMessage: safeTranslation(commonT, 'messages.error', 'An error occurred')
  };
  
  // Hardcoded fallback for DB connection error to avoid translation issues
  const dbConnectionErrorMessage = "Database connection error. Please try again later.";
  
  const session = await auth();
  const user = session?.user;
  
  if (!user) {
    redirect(`/${locale}/auth/login`);
  }
  
  // Check for institution role (case-insensitive check for any role containing 'institution')
  const isInstitutionAdmin = user.role?.toUpperCase()?.includes('INSTITUTION');
  
  if (!isInstitutionAdmin) {
    redirect(`/${locale}/dashboard`);
  }
  
  // Default institution details (fallback in case of DB error)
  let institutionDetails = {
    name: "Institution Name",
    email: "contact@institution.edu",
    website: "https://institution.edu",
    phone: "",
    address: "",
    logo: "/placeholder.svg",
  };

  let errorMessage = null;
  
  try {
    // Get the user's institution
    const institutionUser = await db.institutionUser.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!institutionUser) {
      redirect(`/${locale}/dashboard`);
    }

    const institution = await db.institution.findUnique({
      where: {
        id: institutionUser.institutionId,
      },
    });

    if (institution) {
      institutionDetails = {
        name: institution.name || "Institution Name",
        email: user.email || "contact@institution.edu", // Use user email as fallback for institution contact
        website: institution.website || "https://institution.edu",
        phone: institution.phone || "",
        address: institution.address || "",
        logo: institution.logo || "/placeholder.svg",
      };
    }
  } catch (error) {
    console.error("Error fetching institution details:", error);
    errorMessage = dbConnectionErrorMessage;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href={`/${locale}/dashboard/institution`} className="flex items-center text-muted-foreground hover:text-primary">
              <ChevronLeft className="mr-1 h-4 w-4" />
              {translations.back}
          </Link>
        </Button>
          <h1 className="text-3xl font-bold">{translations.institutionSettings}</h1>
        </div>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
          {institutionDetails.logo && institutionDetails.logo !== "/placeholder.svg" ? (
            <img 
              src={institutionDetails.logo} 
              alt={institutionDetails.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <Building className="h-8 w-8 text-gray-400" />
          )}
        </div>
      </div>
      
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
          <div className="flex items-center">
            <div className="py-1 text-red-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium">{translations.errorMessage}</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        <Tabs defaultValue="general" className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/4">
              <div className="bg-card rounded-lg shadow-sm p-4 sticky top-4">
                <TabsList className="flex flex-col space-y-1 h-auto w-full bg-transparent p-0">
                  <TabsTrigger value="general" className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted">
                    <Building className="mr-2 h-4 w-4" />
                    {translations.general}
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted">
                    <Palette className="mr-2 h-4 w-4" />
                    {translations.appearance}
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted">
                    <Bell className="mr-2 h-4 w-4" />
                    {translations.notifications}
                  </TabsTrigger>
                  <TabsTrigger value="security" className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted">
                    <Shield className="mr-2 h-4 w-4" />
                    {translations.security}
                  </TabsTrigger>
        </TabsList>
              </div>
            </div>
        
            <div className="lg:w-3/4">
        <TabsContent value="general">
                <Card className="border-none shadow-sm">
                  <CardHeader className="bg-muted/50 rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <Building className="mr-2 h-5 w-5 text-primary" />
                      {translations.generalSettings}
                    </CardTitle>
              <CardDescription>
                      {translations.generalDescription}
              </CardDescription>
            </CardHeader>
                  <form action="/api/institution/update" method="POST">
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                            <Label htmlFor="institutionName" className="text-sm font-medium">
                              {translations.institutionName}
                            </Label>
                            <div className="relative">
                              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="institutionName" 
                                name="name"
                                className="pl-10"
                  defaultValue={institutionDetails.name} 
                  placeholder="Enter your institution name"
                />
                            </div>
              </div>
              
              <div className="space-y-2">
                            <Label htmlFor="institutionEmail" className="text-sm font-medium">
                              {translations.emailAddress}
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="institutionEmail" 
                                name="email"
                  type="email"
                                className="pl-10"
                  defaultValue={institutionDetails.email}
                  placeholder="contact@yourinstitution.edu"
                />
                            </div>
                          </div>
              </div>
              
              <div className="space-y-2">
                          <Label htmlFor="institutionWebsite" className="text-sm font-medium">
                            {translations.website}
                          </Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="institutionWebsite" 
                              name="website"
                              className="pl-10"
                  defaultValue={institutionDetails.website}
                  placeholder="https://yourinstitution.edu"
                />
                          </div>
              </div>
              
                        <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                            <Label htmlFor="institutionPhone" className="text-sm font-medium">
                              {translations.phoneNumber}
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="institutionPhone" 
                                name="phone"
                                className="pl-10"
                    defaultValue={institutionDetails.phone}
                    placeholder="+1 (555) 123-4567"
                  />
                            </div>
                </div>
                
                <div className="space-y-2">
                            <Label htmlFor="timezone" className="text-sm font-medium">
                              {translations.timezone}
                            </Label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <select 
                    id="timezone"
                                name="timezone"
                                className="flex w-full h-10 rounded-md border border-input bg-background pl-10 py-2 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC+0">UTC</option>
                    <option value="UTC+1">Central European Time (UTC+1)</option>
                    <option value="UTC+8">China Standard Time (UTC+8)</option>
                  </select>
                            </div>
                </div>
              </div>
              
              <div className="space-y-2">
                          <Label htmlFor="institutionAddress" className="text-sm font-medium">
                            {translations.address}
                          </Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  id="institutionAddress"
                              name="address"
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background pl-10 py-2 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  defaultValue={institutionDetails.address}
                  placeholder="Enter your institution's address"
                />
                          </div>
                        </div>
              </div>
            </CardContent>
                    <CardFooter className="flex justify-end border-t bg-muted/20 py-4">
                      <Button type="submit" className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                        {translations.saveChanges}
              </Button>
            </CardFooter>
                  </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
                <Card className="border-none shadow-sm">
                  <CardHeader className="bg-muted/50 rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <Palette className="mr-2 h-5 w-5 text-primary" />
                      {translations.appearanceSettings}
                    </CardTitle>
              <CardDescription>
                      {translations.appearanceDescription}
              </CardDescription>
            </CardHeader>
                  <form action="/api/institution/update-appearance" method="POST">
                    <CardContent className="pt-6">
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">{translations.institutionLogo}</h3>
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                              {institutionDetails.logo && institutionDetails.logo !== "/placeholder.svg" ? (
                    <img 
                      src={institutionDetails.logo} 
                      alt="Institution logo" 
                                  className="max-w-full max-h-full object-contain"
                                />
                              ) : (
                                <Building className="h-12 w-12 text-gray-300" />
                              )}
                            </div>
                            <div className="space-y-3">
                              <p className="text-sm text-muted-foreground">Upload your institution logo in PNG or JPG format. The recommended size is 400x400px.</p>
                              <div className="flex flex-wrap gap-2">
                                <Button variant="outline" type="button" className="flex items-center">
                                  <Upload className="mr-2 h-4 w-4" />
                                  {translations.changeLogo}
                                </Button>
                                {institutionDetails.logo && institutionDetails.logo !== "/placeholder.svg" && (
                                  <Button variant="ghost" type="button" className="text-destructive hover:text-destructive/90">
                                    Remove
                                  </Button>
                                )}
                              </div>
                  </div>
                </div>
              </div>
              
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">{translations.brandColors}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="primaryColor" className="text-sm font-medium">{translations.primaryColor}</Label>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-md bg-blue-600 ring-1 ring-muted"></div>
                                <Input id="primaryColor" name="primaryColor" defaultValue="#2563eb" className="w-32" />
                    </div>
                              <p className="text-xs text-muted-foreground">Used for buttons, links, and accent colors</p>
                  </div>
                            <div className="space-y-3">
                              <Label htmlFor="secondaryColor" className="text-sm font-medium">{translations.secondaryColor}</Label>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-md bg-purple-600 ring-1 ring-muted"></div>
                                <Input id="secondaryColor" name="secondaryColor" defaultValue="#9333ea" className="w-32" />
                    </div>
                              <p className="text-xs text-muted-foreground">Used for highlights and secondary elements</p>
                  </div>
                </div>
              </div>
              
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">{translations.certificateTemplates}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors relative group">
                              <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full"></div>
                              <div className="h-32 bg-gray-100 flex items-center justify-center mb-3 rounded overflow-hidden">
                                <img src="/templates/classic.png" alt="Classic template" className="max-w-full max-h-full" />
                    </div>
                              <p className="text-sm font-medium">{translations.classic}</p>
                              <input type="radio" name="template" value="classic" className="hidden" defaultChecked />
                  </div>
                            <div className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors group">
                              <div className="h-32 bg-gray-100 flex items-center justify-center mb-3 rounded overflow-hidden">
                                <img src="/templates/modern.png" alt="Modern template" className="max-w-full max-h-full" />
                    </div>
                    <p className="text-sm font-medium">Modern</p>
                              <input type="radio" name="template" value="modern" className="hidden" />
                  </div>
                            <div className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors group">
                              <div className="h-32 bg-gray-100 flex items-center justify-center mb-3 rounded overflow-hidden">
                                <img src="/templates/academic.png" alt="Academic template" className="max-w-full max-h-full" />
                    </div>
                    <p className="text-sm font-medium">Academic</p>
                              <input type="radio" name="template" value="academic" className="hidden" />
                            </div>
                  </div>
                </div>
              </div>
            </CardContent>
                    <CardFooter className="flex justify-end border-t bg-muted/20 py-4">
                      <Button type="submit" className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                        {translations.saveChanges}
              </Button>
            </CardFooter>
                  </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
                <Card className="border-none shadow-sm">
                  <CardHeader className="bg-muted/50 rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <Bell className="mr-2 h-5 w-5 text-primary" />
                      Notification Settings
                    </CardTitle>
              <CardDescription>
                Manage how you receive notifications about certificates and user activities.
              </CardDescription>
            </CardHeader>
                  <form action="/api/institution/update-notifications" method="POST">
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                <div className="space-y-4">
                            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="text-sm font-medium">New Certificate Requests</h4>
                                <p className="text-sm text-muted-foreground">Receive emails when someone requests a certificate</p>
                    </div>
                    <div className="flex items-center h-6">
                                <input 
                                  type="checkbox" 
                                  name="notifyCertRequest" 
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                                  id="cert-request" 
                                  defaultChecked 
                                />
                    </div>
                  </div>
                            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="text-sm font-medium">Certificate Verifications</h4>
                                <p className="text-sm text-muted-foreground">Receive emails when someone verifies one of your certificates</p>
                    </div>
                    <div className="flex items-center h-6">
                                <input 
                                  type="checkbox" 
                                  name="notifyCertVerify" 
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                                  id="cert-verify" 
                                  defaultChecked 
                                />
                    </div>
                  </div>
                            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="text-sm font-medium">System Updates</h4>
                                <p className="text-sm text-muted-foreground">Receive emails about system updates and maintenance</p>
                    </div>
                    <div className="flex items-center h-6">
                                <input 
                                  type="checkbox" 
                                  name="notifySystemUpdates" 
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                                  id="system-updates" 
                                />
                              </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
                    <CardFooter className="flex justify-end border-t bg-muted/20 py-4">
                      <Button type="submit" className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                        {translations.saveChanges}
              </Button>
            </CardFooter>
                  </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
                <Card className="border-none shadow-sm">
                  <CardHeader className="bg-muted/50 rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-primary" />
                      Security Settings
                    </CardTitle>
              <CardDescription>
                Configure security options for your institution account.
              </CardDescription>
            </CardHeader>
                  <form action="/api/institution/update-security" method="POST">
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Password Requirements</h3>
                <div className="space-y-4">
                            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="text-sm font-medium">Require Strong Passwords</h4>
                                <p className="text-sm text-muted-foreground">Require staff to use passwords with letters, numbers, and special characters</p>
                    </div>
                    <div className="flex items-center h-6">
                                <input 
                                  type="checkbox" 
                                  name="requireStrongPasswords" 
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                                  id="strong-passwords" 
                                  defaultChecked 
                                />
                    </div>
                  </div>
                            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="text-sm font-medium">Password Expiration</h4>
                                <p className="text-sm text-muted-foreground">Require staff to change passwords periodically</p>
                    </div>
                    <div className="flex items-center h-6">
                                <input 
                                  type="checkbox" 
                                  name="passwordExpiration" 
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                                  id="password-expiration" 
                                />
                    </div>
                  </div>
                </div>
              </div>
              
                        <div className="space-y-3">
                          <h3 className="text-lg font-medium">API Access</h3>
                          <p className="text-sm text-muted-foreground">Manage API keys for integrating with third-party services</p>
                          <Button variant="outline" type="button" className="flex items-center">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Manage API Keys
                          </Button>
                </div>
              </div>
            </CardContent>
                    <CardFooter className="flex justify-end border-t bg-muted/20 py-4">
                      <Button type="submit" className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                        {translations.saveChanges}
              </Button>
            </CardFooter>
                  </form>
          </Card>
        </TabsContent>
            </div>
          </div>
      </Tabs>
      </div>
    </div>
  );
} 