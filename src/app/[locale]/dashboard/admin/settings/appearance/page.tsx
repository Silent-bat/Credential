'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import { Moon, Sun, Palette, Globe, Monitor, LayoutGrid } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

export default function AppearanceSettingsPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const baseUrl = `/${locale}/dashboard/admin/settings`;
  
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState(locale);
  const [density, setDensity] = useState<'comfortable' | 'compact' | 'spacious'>('comfortable');
  const [fontSize, setFontSize] = useState(16);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showTableBorders, setShowTableBorders] = useState(true);
  const [highContrastMode, setHighContrastMode] = useState(false);
  
  const saveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Appearance settings saved successfully');
    } catch (error) {
      toast.error('Failed to save appearance settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsLayout baseUrl={baseUrl}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              <CardTitle>Theme</CardTitle>
            </div>
            <CardDescription>
              Customize the visual appearance of the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">Theme Mode</Label>
                <RadioGroup 
                  value={theme} 
                  onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light" className="flex items-center cursor-pointer">
                      <Sun className="mr-1.5 h-4 w-4" />
                      Light
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark" className="flex items-center cursor-pointer">
                      <Moon className="mr-1.5 h-4 w-4" />
                      Dark
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system" className="flex items-center cursor-pointer">
                      <Monitor className="mr-1.5 h-4 w-4" />
                      System
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <Select defaultValue="blue">
                    <SelectTrigger id="accent-color">
                      <SelectValue placeholder="Select accent color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select defaultValue="inter">
                    <SelectTrigger id="font-family">
                      <SelectValue placeholder="Select font family" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="system">System UI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              <CardTitle>Language & Region</CardTitle>
            </div>
            <CardDescription>
              Set your preferred language and regional settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Interface Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="mm-dd-yyyy">
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                      <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="time-format">Time Format</Label>
                  <Select defaultValue="24h">
                    <SelectTrigger id="time-format">
                      <SelectValue placeholder="Select time format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (Device)</SelectItem>
                      <SelectItem value="gmt">GMT (UTC+0)</SelectItem>
                      <SelectItem value="est">EST (UTC-5)</SelectItem>
                      <SelectItem value="pst">PST (UTC-8)</SelectItem>
                      <SelectItem value="jst">JST (UTC+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <LayoutGrid className="mr-2 h-5 w-5" />
              <CardTitle>Display Options</CardTitle>
            </div>
            <CardDescription>
              Customize how content is displayed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Layout Density</Label>
                <RadioGroup 
                  value={density} 
                  onValueChange={(value) => setDensity(value as 'comfortable' | 'compact' | 'spacious')}
                  className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="compact" id="density-compact" />
                    <Label htmlFor="density-compact">Compact</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="comfortable" id="density-comfortable" />
                    <Label htmlFor="density-comfortable">Comfortable</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="spacious" id="density-spacious" />
                    <Label htmlFor="density-spacious">Spacious</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div className="space-y-1">
                <Label htmlFor="font-size" className="flex items-center justify-between">
                  <span>Font Size: {fontSize}px</span>
                </Label>
                <Slider
                  id="font-size"
                  min={12}
                  max={24}
                  step={1}
                  value={[fontSize]}
                  onValueChange={([value]) => setFontSize(value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>Small</span>
                  <span>Medium</span>
                  <span>Large</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="font-medium">Animations</h3>
                    <p className="text-sm text-muted-foreground">Enable interface animations</p>
                  </div>
                  <Switch 
                    checked={animationsEnabled} 
                    onCheckedChange={setAnimationsEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="font-medium">Reduce Motion</h3>
                    <p className="text-sm text-muted-foreground">Minimize animations for accessibility</p>
                  </div>
                  <Switch 
                    checked={reduceMotion} 
                    onCheckedChange={setReduceMotion}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="font-medium">Table Borders</h3>
                    <p className="text-sm text-muted-foreground">Show borders in data tables</p>
                  </div>
                  <Switch 
                    checked={showTableBorders} 
                    onCheckedChange={setShowTableBorders}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="font-medium">High Contrast Mode</h3>
                    <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                  </div>
                  <Switch 
                    checked={highContrastMode} 
                    onCheckedChange={setHighContrastMode}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
} 