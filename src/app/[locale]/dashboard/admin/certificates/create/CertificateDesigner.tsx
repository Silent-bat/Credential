"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { UploadCloud, Type, Image, Square, Circle, Save, Plus, Loader2, RefreshCw, Settings2, Info } from 'lucide-react';
import ColorPicker from './ColorPicker';
import { useTranslations } from 'next-intl';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  onComplete: (designData: string) => void;
  onSaveTemplate?: (designData: string, templateName: string) => void;
  savedTemplates?: Array<{id: string, name: string, designData: string}>;
};

// Predefined certificate templates
const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    background: '#ffffff',
    border: true,
    borderColor: '#000000',
    logo: true,
  },
  {
    id: 'modern',
    name: 'Modern',
    background: '#f8f9fa',
    border: false,
    borderColor: '#3b82f6',
    logo: true,
  },
  {
    id: 'elegant',
    name: 'Elegant',
    background: '#f5f5f4',
    border: true,
    borderColor: '#a16207',
    logo: true,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    background: '#ffffff',
    border: false,
    borderColor: '#000000',
    logo: false,
  },
  {
    id: 'dark',
    name: 'Dark',
    background: '#1f2937',
    textColor: '#ffffff',
    border: true,
    borderColor: '#4b5563',
    logo: true,
    accentColor: '#6366f1',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    background: '#f0f9ff',
    border: true,
    borderColor: '#0ea5e9',
    logo: true,
    accentColor: '#0284c7',
  },
  {
    id: 'gradient',
    name: 'Gradient',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    border: false,
    borderColor: '#0ea5e9',
    logo: true,
    accentColor: '#0284c7',
  },
];

// Font options
const FONT_OPTIONS = [
  { value: 'serif', label: 'Serif' },
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'cursive', label: 'Cursive' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'system-ui', label: 'System UI' },
];

export default function CertificateDesigner({ onComplete, onSaveTemplate, savedTemplates = [] }: Props) {
  const t = useTranslations('Certificates');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);
  
  // Certificate data state for preview
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0]);
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Design options
  const [backgroundColor, setBackgroundColor] = useState(TEMPLATES[0].background);
  const [textColor, setTextColor] = useState('#000000');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [fontSize, setFontSize] = useState(16);
  const [showBorder, setShowBorder] = useState(TEMPLATES[0].border);
  const [borderColor, setBorderColor] = useState(TEMPLATES[0].borderColor);
  const [borderWidth, setBorderWidth] = useState(8);
  const [borderRadius, setBorderRadius] = useState(0);
  const [fontFamily, setFontFamily] = useState('serif');
  const [showLogo, setShowLogo] = useState(TEMPLATES[0].logo);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isDesignComplete, setIsDesignComplete] = useState(false);
  
  // Advanced options
  const [showBackgroundImage, setShowBackgroundImage] = useState(false);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(0.2);
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureText, setSignatureText] = useState('Institution Director');
  const [showBadge, setShowBadge] = useState(false);
  const [badgePosition, setBadgePosition] = useState('bottom-right');
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Load template from saved templates
  const loadSavedTemplate = (templateData: string) => {
    try {
      const parsedData = JSON.parse(templateData);
      setActiveTemplate({
        id: 'custom',
        name: 'Custom',
        ...parsedData
      });
      
      // Update all design state variables
      setBackgroundColor(parsedData.backgroundColor || '#ffffff');
      setTextColor(parsedData.textColor || '#000000');
      setAccentColor(parsedData.accentColor || '#3b82f6');
      setFontSize(parsedData.fontSize || 16);
      setShowBorder(parsedData.showBorder !== undefined ? parsedData.showBorder : true);
      setBorderColor(parsedData.borderColor || '#000000');
      setBorderWidth(parsedData.borderWidth || 8);
      setBorderRadius(parsedData.borderRadius || 0); 
      setFontFamily(parsedData.fontFamily || 'serif');
      setShowLogo(parsedData.showLogo !== undefined ? parsedData.showLogo : true);
      
      // Advanced options
      setShowBackgroundImage(parsedData.showBackgroundImage || false);
      setBackgroundImageOpacity(parsedData.backgroundImageOpacity || 0.2);
      setShowSignature(parsedData.showSignature || false);
      setSignatureText(parsedData.signatureText || 'Institution Director');
      setShowBadge(parsedData.showBadge || false);
      setBadgePosition(parsedData.badgePosition || 'bottom-right');
      setShowQRCode(parsedData.showQRCode || false);
      
      setActiveTab('preview');
    } catch (error) {
      console.error('Error parsing template data:', error);
    }
  };
  
  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
    setActiveTemplate(template);
    setBackgroundColor(template.background);
    setTextColor(template.textColor || '#000000');
    setAccentColor(template.accentColor || '#3b82f6');
    setShowBorder(template.border);
    setBorderColor(template.borderColor);
    setShowLogo(template.logo);
    
    // Reset advanced options
    setShowBackgroundImage(false);
    setBackgroundImagePreview(null);
    setShowSignature(false);
    setShowBadge(false);
    setShowQRCode(false);
  };
  
  // Handle logo upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle background image upload
  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Complete design and switch to form
  const handleCompleteDesign = () => {
    setIsDesignComplete(true);
  };
  
  // Save template (admin only)
  const handleSaveTemplateClick = () => {
    if (onSaveTemplate) {
      setIsSaving(true);
      setTimeout(() => {
        onSaveTemplate(getDesignData(), templateName || 'Untitled Template');
        setIsSaving(false);
        setIsDialogOpen(false);
      }, 1000);
    }
  };
  
  // Get design data as JSON string
  const getDesignData = () => {
    return JSON.stringify({
      templateId: activeTemplate.id,
      backgroundColor,
      textColor,
      accentColor,
      fontSize,
      showBorder,
      borderColor,
      borderWidth,
      borderRadius,
      fontFamily,
      showLogo,
      
      // Advanced options
      showBackgroundImage,
      backgroundImageOpacity,
      showSignature,
      signatureText,
      showBadge,
      badgePosition,
      showQRCode,
    });
  };
  
  // If design is complete, show the certificate form
  if (isDesignComplete) {
    return <>{onComplete(getDesignData())}</>;
  }
  
  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Basic Design</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          {savedTemplates.length > 0 && (
            <TabsTrigger value="saved">Saved Templates</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="basic" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{t('chooseTemplate')}</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {TEMPLATES.map(template => (
                <div 
                  key={template.id}
                  className={`border rounded-lg p-2 cursor-pointer transition-all ${
                    activeTemplate.id === template.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleTemplateChange(template.id)}
                >
                  <div 
                    className="w-full aspect-[16/11] rounded-md mb-2"
                    style={{ 
                      background: typeof template.background === 'string' ? template.background : 'white',
                      border: template.border ? `4px solid ${template.borderColor}` : 'none',
                    }}
                  ></div>
                  <div className="text-center text-sm font-medium">{template.name}</div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-base font-medium">Content Preview</h3>
              <div className="space-y-2">
                <Label htmlFor="preview-title">{t('titlePreview')}</Label>
                <Input 
                  id="preview-title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('certificateTitle')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preview-name">{t('recipientNamePreview')}</Label>
                <Input 
                  id="preview-name" 
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder={t('recipientName')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preview-description">{t('descriptionPreview')}</Label>
                <Textarea 
                  id="preview-description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('certificateDescription')}
                  className="h-20"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-base font-medium">Styling</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backgroundColor">{t('backgroundColor')}</Label>
                  <ColorPicker 
                    color={backgroundColor} 
                    onChange={setBackgroundColor}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="textColor">{t('textColor')}</Label>
                  <ColorPicker 
                    color={textColor} 
                    onChange={setTextColor}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="accentColor">{t('accentColor')}</Label>
                  <ColorPicker 
                    color={accentColor} 
                    onChange={setAccentColor}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fontFamily">{t('fontFamily')}</Label>
                  <Select 
                    value={fontFamily}
                    onValueChange={setFontFamily}
                    className="mt-1"
                  >
                    <SelectTrigger id="fontFamily">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map(font => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fontSize">{t('fontSize')}</Label>
                  <span className="text-sm">{fontSize}px</span>
                </div>
                <Slider
                  id="fontSize"
                  defaultValue={[fontSize]}
                  min={12}
                  max={24}
                  step={1}
                  onValueChange={(values) => setFontSize(values[0])}
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="showBorder"
                  checked={showBorder}
                  onCheckedChange={(checked) => setShowBorder(checked as boolean)}
                />
                <Label htmlFor="showBorder">{t('showBorder')}</Label>
              </div>
              
              {showBorder && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <Label htmlFor="borderColor">{t('borderColor')}</Label>
                    <ColorPicker 
                      color={borderColor} 
                      onChange={setBorderColor}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="borderWidth">Border Width</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        id="borderWidth"
                        defaultValue={[borderWidth]}
                        min={1}
                        max={20}
                        step={1}
                        onValueChange={(values) => setBorderWidth(values[0])}
                        className="flex-1"
                      />
                      <span className="text-sm w-10 text-right">{borderWidth}px</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="borderRadius">Border Radius</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        id="borderRadius"
                        defaultValue={[borderRadius]}
                        min={0}
                        max={20}
                        step={1}
                        onValueChange={(values) => setBorderRadius(values[0])}
                        className="flex-1"
                      />
                      <span className="text-sm w-10 text-right">{borderRadius}px</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showLogo"
                  checked={showLogo}
                  onCheckedChange={(checked) => setShowLogo(checked as boolean)}
                />
                <Label htmlFor="showLogo">{t('showLogo')}</Label>
              </div>
              
              {showLogo && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="logoFile">{t('uploadLogo')}</Label>
                  <Input 
                    id="logoFile"
                    name="logoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    ref={logoInputRef}
                  />
                  <p className="text-sm text-gray-500">
                    {t('logoDescription')}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('advanced')}
                    className="flex items-center gap-2"
                  >
                    <Settings2 className="h-4 w-4" />
                    Advanced Options
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configure advanced design options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button 
              type="button" 
              onClick={() => setActiveTab('preview')}
              className="flex items-center gap-2"
            >
              Preview Design
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-base font-medium">Background Options</h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showBackgroundImage"
                  checked={showBackgroundImage}
                  onCheckedChange={(checked) => setShowBackgroundImage(checked as boolean)}
                />
                <Label htmlFor="showBackgroundImage">Show Background Image</Label>
              </div>
              
              {showBackgroundImage && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="backgroundImageFile">Upload Background Image</Label>
                  <Input 
                    id="backgroundImageFile"
                    name="backgroundImageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundImageChange}
                    ref={backgroundImageInputRef}
                  />
                  
                  <div className="space-y-1">
                    <Label htmlFor="backgroundImageOpacity">Background Image Opacity</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        id="backgroundImageOpacity"
                        defaultValue={[backgroundImageOpacity]}
                        min={0.1}
                        max={1}
                        step={0.1}
                        onValueChange={(values) => setBackgroundImageOpacity(values[0])}
                        className="flex-1"
                      />
                      <span className="text-sm w-10 text-right">{backgroundImageOpacity}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <h3 className="text-base font-medium">Signature Options</h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showSignature"
                  checked={showSignature}
                  onCheckedChange={(checked) => setShowSignature(checked as boolean)}
                />
                <Label htmlFor="showSignature">Show Signature Line</Label>
              </div>
              
              {showSignature && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="signatureText">Signature Text</Label>
                  <Input 
                    id="signatureText"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    placeholder="Institution Director"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-base font-medium">Additional Elements</h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showBadge"
                  checked={showBadge}
                  onCheckedChange={(checked) => setShowBadge(checked as boolean)}
                />
                <Label htmlFor="showBadge">Show Badge</Label>
              </div>
              
              {showBadge && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="badgePosition">Badge Position</Label>
                  <Select 
                    value={badgePosition}
                    onValueChange={setBadgePosition}
                  >
                    <SelectTrigger id="badgePosition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showQRCode"
                  checked={showQRCode}
                  onCheckedChange={(checked) => setShowQRCode(checked as boolean)}
                />
                <Label htmlFor="showQRCode">Include QR Code for Verification</Label>
              </div>
              
              <div className="flex items-center mt-4 p-2 bg-blue-50 rounded-md">
                <Info className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  QR codes will be generated automatically during certificate issuance and will link to the certificate verification page.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab('basic')}
            >
              Back to Basic Settings
            </Button>
            
            <Button 
              type="button" 
              onClick={() => setActiveTab('preview')}
              className="flex items-center gap-2"
            >
              Preview Design
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="preview">
          <div className="space-y-6">
      {/* Certificate Preview */}
      <div>
        <h3 className="text-lg font-medium mb-4">{t('preview')}</h3>
        <div 
                className="border rounded-lg overflow-hidden aspect-[16/11] flex items-center justify-center relative mx-auto max-w-4xl"
          style={{ 
            backgroundColor: backgroundColor,
                  border: showBorder ? `${borderWidth}px solid ${borderColor}` : 'none',
                  borderRadius: `${borderRadius}px`,
                  position: 'relative',
                }}
              >
                {/* Background image */}
                {showBackgroundImage && backgroundImagePreview && (
                  <div 
                    className="absolute inset-0 bg-center bg-cover bg-no-repeat" 
                    style={{ 
                      backgroundImage: `url(${backgroundImagePreview})`,
                      opacity: backgroundImageOpacity,
                    }}
                  ></div>
                )}
                
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                  style={{ color: textColor, fontFamily: fontFamily }}
          >
            {showLogo && (
              <div className="mb-6">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Institution logo" 
                    className="max-h-16 max-w-xs object-contain"
                  />
                ) : (
                  <div className="w-24 h-16 bg-gray-200 flex items-center justify-center rounded">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            )}
            
            <h1 className="text-3xl font-bold mb-2" style={{ fontSize: `${fontSize + 10}px` }}>
              {title || t('certificateTitle')}
            </h1>
            
            <div 
              className="w-32 h-1 my-4 rounded"
              style={{ backgroundColor: accentColor }}
            ></div>
            
            <p className="text-xl my-2" style={{ fontSize: `${fontSize + 4}px` }}>
              {t('awardedTo')}
            </p>
            
            <h2 className="text-2xl font-bold my-2" style={{ fontSize: `${fontSize + 8}px` }}>
              {recipientName || t('recipientName')}
            </h2>
            
            <p className="my-4 max-w-md" style={{ fontSize: `${fontSize}px` }}>
              {description || t('certificateDescription')}
            </p>
            
                  <div className="mt-6">
                    <p className="text-sm" style={{ fontSize: `${fontSize - 2}px` }}>
                      {new Date().toLocaleDateString()}
                    </p>
                    
                    {showSignature && (
                      <div className="mt-4">
                        <div className="w-40 h-px bg-gray-400 mx-auto mb-1"></div>
                        <p className="text-sm" style={{ fontSize: `${fontSize - 2}px` }}>
                          {signatureText}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* QR Code placeholder */}
                  {showQRCode && (
                    <div className="absolute bottom-4 left-4 w-16 h-16 bg-white border border-gray-300 flex items-center justify-center">
                      <Square className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Badge element */}
                  {showBadge && (
                    <div className={`absolute ${
                      badgePosition === 'top-left' ? 'top-4 left-4' :
                      badgePosition === 'top-right' ? 'top-4 right-4' :
                      badgePosition === 'bottom-left' ? 'bottom-4 left-4' :
                      'bottom-4 right-4'
                    } w-20 h-20 flex items-center justify-center`}>
                      <div className="w-full h-full rounded-full border-2 border-current flex items-center justify-center overflow-hidden" style={{ backgroundColor: accentColor, color: 'white' }}>
                        <span className="text-xs font-bold">VERIFIED</span>
                      </div>
                    </div>
                  )}
            
            <div className="absolute bottom-4 right-4 text-xs opacity-70">
              ID: CERT-XXXX-XXXX-XXXX
            </div>
          </div>
        </div>
      </div>
      
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('basic')}
                >
                  Back to Settings
                </Button>
                
                {onSaveTemplate && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save as Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save Design Template</DialogTitle>
                        <DialogDescription>
                          Save this design as a reusable template for future certificates.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
            <div className="space-y-2">
                          <Label htmlFor="templateName">Template Name</Label>
              <Input 
                            id="templateName"
                            placeholder="Enter a name for this template"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button 
                          onClick={handleSaveTemplateClick}
                          disabled={isSaving || !templateName.trim()}
                          className="flex items-center gap-2"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Save Template
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              <Button 
                type="button" 
                onClick={handleCompleteDesign}
                className="flex items-center gap-2"
              >
                {t('continueToDetails')}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {savedTemplates.length > 0 && (
          <TabsContent value="saved">
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Saved Templates</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedTemplates.map(template => (
                  <Card key={template.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">{template.name}</div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => loadSavedTemplate(template.designData)}
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                  onClick={() => setActiveTab('basic')}
                  >
                  Back to Settings
                  </Button>
                </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 