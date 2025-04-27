  "use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { Separator } from "@/components/ui/separator";
import PasswordField from "@/components/forms/PasswordField";
import { ChevronLeft } from "lucide-react";

export default function SecuritySettingsPage() {
  const t = useTranslations("settings");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("password");

  // Password settings
  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 2FA settings
  const [twoFactorSettings, setTwoFactorSettings] = useState({
    enabled: false,
    preferredMethod: "app", // "app" or "sms"
    phoneNumber: "",
  });

  // Session settings
  const [sessionSettings, setSessionSettings] = useState({
    rememberMe: true,
    logoutOnInactivity: true,
    inactivityTimeout: 30, // minutes
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordSettings({
      ...passwordSettings,
      [field]: value,
    });
  };

  const handleTwoFactorChange = (field: string, value: any) => {
    setTwoFactorSettings({
      ...twoFactorSettings,
      [field]: value,
    });
  };

  const handleSessionChange = (field: string, value: any) => {
    setSessionSettings({
      ...sessionSettings,
      [field]: value,
    });
  };

  const savePasswordSettings = () => {
    if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    if (passwordSettings.newPassword.length < 8) {
      toast.error(t("passwordTooShort"));
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success(t("passwordUpdated"));
      setPasswordSettings({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setLoading(false);
    }, 1000);
  };

  const saveTwoFactorSettings = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success(t("twoFactorSettingsSaved"));
      setLoading(false);
    }, 1000);
  };

  const saveSessionSettings = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success(t("sessionSettingsSaved"));
      setLoading(false);
    }, 1000);
  };

  return (
    <SettingsLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push(`/${locale}/dashboard/settings`)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">{t("security")}</h1>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="password">{t("password")}</TabsTrigger>
            <TabsTrigger value="twoFactor">{t("twoFactorAuthentication")}</TabsTrigger>
            <TabsTrigger value="sessions">{t("sessions")}</TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("changePassword")}</CardTitle>
                <CardDescription>{t("changePasswordDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">{t("currentPassword")}</Label>
                  <PasswordField
                    id="current-password"
                    value={passwordSettings.currentPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handlePasswordChange("currentPassword", e.target.value)}
                    placeholder={t("enterCurrentPassword")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t("newPassword")}</Label>
                  <PasswordField
                    id="new-password"
                    value={passwordSettings.newPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handlePasswordChange("newPassword", e.target.value)}
                    placeholder={t("enterNewPassword")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
                  <PasswordField
                    id="confirm-password"
                    value={passwordSettings.confirmPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handlePasswordChange("confirmPassword", e.target.value)}
                    placeholder={t("confirmNewPassword")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={savePasswordSettings} 
                  disabled={loading || !passwordSettings.currentPassword || !passwordSettings.newPassword || !passwordSettings.confirmPassword}
                >
                  {loading ? t("saving") : t("saveChanges")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="twoFactor" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("twoFactorAuthentication")}</CardTitle>
                <CardDescription>{t("twoFactorDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("enable2FA")}</p>
                    <p className="text-sm text-muted-foreground">{t("enable2FADescription")}</p>
                  </div>
                  <Switch
                    checked={twoFactorSettings.enabled}
                    onCheckedChange={(checked) => handleTwoFactorChange("enabled", checked)}
                  />
                </div>
                
                {twoFactorSettings.enabled && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">{t("preferredMethod")}</h3>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="authenticator-app"
                            name="2fa-method"
                            checked={twoFactorSettings.preferredMethod === "app"}
                            onChange={() => handleTwoFactorChange("preferredMethod", "app")}
                          />
                          <Label htmlFor="authenticator-app">{t("authenticatorApp")}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="sms"
                            name="2fa-method"
                            checked={twoFactorSettings.preferredMethod === "sms"}
                            onChange={() => handleTwoFactorChange("preferredMethod", "sms")}
                          />
                          <Label htmlFor="sms">{t("sms")}</Label>
                        </div>
                      </div>
                    </div>
                    
                    {twoFactorSettings.preferredMethod === "sms" && (
                      <div className="space-y-2">
                        <Label htmlFor="phone-number">{t("phoneNumber")}</Label>
                        <Input
                          id="phone-number"
                          value={twoFactorSettings.phoneNumber}
                          onChange={(e) => handleTwoFactorChange("phoneNumber", e.target.value)}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={saveTwoFactorSettings} 
                  disabled={loading || (twoFactorSettings.enabled && twoFactorSettings.preferredMethod === "sms" && !twoFactorSettings.phoneNumber)}
                >
                  {loading ? t("saving") : t("saveChanges")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("sessionSettings")}</CardTitle>
                <CardDescription>{t("sessionSettingsDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("rememberMe")}</p>
                    <p className="text-sm text-muted-foreground">{t("rememberMeDescription")}</p>
                  </div>
                  <Switch
                    checked={sessionSettings.rememberMe}
                    onCheckedChange={(checked) => handleSessionChange("rememberMe", checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("autoLogout")}</p>
                    <p className="text-sm text-muted-foreground">{t("autoLogoutDescription")}</p>
                  </div>
                  <Switch
                    checked={sessionSettings.logoutOnInactivity}
                    onCheckedChange={(checked) => handleSessionChange("logoutOnInactivity", checked)}
                  />
                </div>
                
                {sessionSettings.logoutOnInactivity && (
                  <div className="space-y-2">
                    <Label htmlFor="timeout">{t("inactivityTimeout")} (minutes)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="timeout"
                        type="number"
                        min="5"
                        max="120"
                        value={sessionSettings.inactivityTimeout}
                        onChange={(e) => handleSessionChange("inactivityTimeout", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <Button variant="destructive">
                    {t("logoutAllDevices")}
                  </Button>
                  <p className="mt-2 text-sm text-muted-foreground">{t("logoutAllDevicesDescription")}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={saveSessionSettings} 
                  disabled={loading}
                >
                  {loading ? t("saving") : t("saveChanges")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SettingsLayout>
  );
} 