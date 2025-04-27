"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Palette, Monitor, Smartphone, Sidebar, Layout, Maximize2, Menu, PanelLeft } from "lucide-react";

export default function InterfaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  // Interface settings state
  const [interfaceSettings, setInterfaceSettings] = useState({
    // Sidebar settings
    sidebarBehavior: "pinned", // "pinned", "floating", "collapsed"
    autoCollapseOnMobile: true,
    rememberSidebarState: true,
    
    // Theme settings
    theme: "system", // "light", "dark", "system"
    highContrastMode: false,
    reducedMotion: false,
    
    // Layout settings
    contentDensity: "compact", // "comfortable", "compact", "spacious"
    defaultView: "table", // "table", "grid", "list"
    cardShadow: true,
    borderRadius: 8, // 0, 4, 8, 12, 16
    
    // Dashboard settings
    showWelcomeBanner: true,
    enableQuickActions: true,
    rememberDashboardLayout: true,
  });

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem('interface-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setInterfaceSettings(prev => ({
          ...prev,
          ...parsed
        }));
      } catch (error) {
        console.error('Failed to parse saved interface settings:', error);
      }
    }
  }, []);

  // Handler for settings changes
  const handleSettingChange = (key: string, value: any) => {
    setInterfaceSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save settings
  const saveSettings = () => {
    // Save to localStorage
    localStorage.setItem('interface-settings', JSON.stringify(interfaceSettings));
    
    // Apply settings
    document.documentElement.style.setProperty('--border-radius', `${interfaceSettings.borderRadius}px`);
    
    // Update sidebar behavior in localStorage for the sidebar component to read
    if (interfaceSettings.sidebarBehavior === "pinned") {
      localStorage.setItem('sidebar-pinned', 'true');
      localStorage.setItem('sidebar-open', 'true');
    } else if (interfaceSettings.sidebarBehavior === "floating") {
      localStorage.setItem('sidebar-pinned', 'false');
      localStorage.setItem('sidebar-open', 'false');
    } else if (interfaceSettings.sidebarBehavior === "collapsed") {
      localStorage.setItem('sidebar-pinned', 'true');
      localStorage.setItem('sidebar-open', 'false');
    }
    
    // Show success message
    toast.success('Interface settings saved successfully');
  };

  // Reset to defaults
  const resetToDefaults = () => {
    const defaultSettings = {
      sidebarBehavior: "pinned",
      autoCollapseOnMobile: true,
      rememberSidebarState: true,
      theme: "system",
      highContrastMode: false,
      reducedMotion: false,
      contentDensity: "compact",
      defaultView: "table",
      cardShadow: true,
      borderRadius: 8,
      showWelcomeBanner: true,
      enableQuickActions: true,
      rememberDashboardLayout: true,
    };
    
    setInterfaceSettings(defaultSettings);
    toast.success('Interface settings reset to defaults');
  };

  return (
    <SettingsLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Interface Settings</h1>
        </div>

        {/* Sidebar Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Sidebar className="mr-2 h-5 w-5" />
              <CardTitle>Sidebar Settings</CardTitle>
            </div>
            <CardDescription>
              Customize how the sidebar behaves and appears
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sidebarBehavior">Sidebar Behavior</Label>
              <Select 
                value={interfaceSettings.sidebarBehavior} 
                onValueChange={(value) => handleSettingChange('sidebarBehavior', value)}
              >
                <SelectTrigger id="sidebarBehavior">
                  <SelectValue placeholder="Select sidebar behavior" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pinned">
                    <div className="flex items-center">
                      <PanelLeft className="mr-2 h-4 w-4" />
                      <span>Pinned (Always visible)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="floating">
                    <div className="flex items-center">
                      <Sidebar className="mr-2 h-4 w-4" />
                      <span>Floating (Show on hover)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="collapsed">
                    <div className="flex items-center">
                      <Menu className="mr-2 h-4 w-4" />
                      <span>Collapsed (Show icons only)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose how the sidebar behaves by default
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoCollapseOnMobile">Auto-collapse on Mobile</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically collapse the sidebar on mobile devices
                </p>
              </div>
              <Switch
                id="autoCollapseOnMobile"
                checked={interfaceSettings.autoCollapseOnMobile}
                onCheckedChange={(checked) => handleSettingChange('autoCollapseOnMobile', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="rememberSidebarState">Remember Sidebar State</Label>
                <p className="text-sm text-muted-foreground">
                  Remember the sidebar state between sessions
                </p>
              </div>
              <Switch
                id="rememberSidebarState"
                checked={interfaceSettings.rememberSidebarState}
                onCheckedChange={(checked) => handleSettingChange('rememberSidebarState', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              <CardTitle>Theme Settings</CardTitle>
            </div>
            <CardDescription>
              Customize the visual appearance of the interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme Preference</Label>
              <Select 
                value={interfaceSettings.theme} 
                onValueChange={(value) => handleSettingChange('theme', value)}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System Default</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="highContrastMode">High Contrast Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Increase contrast for better readability
                </p>
              </div>
              <Switch
                id="highContrastMode"
                checked={interfaceSettings.highContrastMode}
                onCheckedChange={(checked) => handleSettingChange('highContrastMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reducedMotion">Reduced Motion</Label>
                <p className="text-sm text-muted-foreground">
                  Minimize animations and transitions
                </p>
              </div>
              <Switch
                id="reducedMotion"
                checked={interfaceSettings.reducedMotion}
                onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Layout Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Layout className="mr-2 h-5 w-5" />
              <CardTitle>Layout Settings</CardTitle>
            </div>
            <CardDescription>
              Customize the density and appearance of content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="contentDensity">Content Density</Label>
              <Select 
                value={interfaceSettings.contentDensity} 
                onValueChange={(value) => handleSettingChange('contentDensity', value)}
              >
                <SelectTrigger id="contentDensity">
                  <SelectValue placeholder="Select content density" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Adjust spacing between elements
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultView">Default View</Label>
              <Select 
                value={interfaceSettings.defaultView} 
                onValueChange={(value) => handleSettingChange('defaultView', value)}
              >
                <SelectTrigger id="defaultView">
                  <SelectValue placeholder="Select default view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default view for list displays
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="cardShadow">Card Shadows</Label>
                <p className="text-sm text-muted-foreground">
                  Enable shadows on cards for depth
                </p>
              </div>
              <Switch
                id="cardShadow"
                checked={interfaceSettings.cardShadow}
                onCheckedChange={(checked) => handleSettingChange('cardShadow', checked)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="borderRadius">Border Radius</Label>
                <span className="text-sm text-muted-foreground">{interfaceSettings.borderRadius}px</span>
              </div>
              <Slider
                id="borderRadius"
                min={0}
                max={16}
                step={4}
                value={[interfaceSettings.borderRadius]}
                onValueChange={(value) => handleSettingChange('borderRadius', value[0])}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Adjust the roundness of UI elements
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Maximize2 className="mr-2 h-5 w-5" />
              <CardTitle>Dashboard Settings</CardTitle>
            </div>
            <CardDescription>
              Customize your dashboard experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showWelcomeBanner">Welcome Banner</Label>
                <p className="text-sm text-muted-foreground">
                  Show welcome banner on dashboard
                </p>
              </div>
              <Switch
                id="showWelcomeBanner"
                checked={interfaceSettings.showWelcomeBanner}
                onCheckedChange={(checked) => handleSettingChange('showWelcomeBanner', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableQuickActions">Quick Actions</Label>
                <p className="text-sm text-muted-foreground">
                  Show quick action buttons on dashboard
                </p>
              </div>
              <Switch
                id="enableQuickActions"
                checked={interfaceSettings.enableQuickActions}
                onCheckedChange={(checked) => handleSettingChange('enableQuickActions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="rememberDashboardLayout">Remember Dashboard Layout</Label>
                <p className="text-sm text-muted-foreground">
                  Save your dashboard customizations between sessions
                </p>
              </div>
              <Switch
                id="rememberDashboardLayout"
                checked={interfaceSettings.rememberDashboardLayout}
                onCheckedChange={(checked) => handleSettingChange('rememberDashboardLayout', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save/Reset Buttons */}
        <Card>
          <CardFooter className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={resetToDefaults}
            >
              Reset to Defaults
            </Button>
            <Button 
              onClick={saveSettings}
            >
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </SettingsLayout>
  );
} 