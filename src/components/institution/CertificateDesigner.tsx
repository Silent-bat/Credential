'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Image as ImageIcon, 
  Download, 
  Save, 
  Upload, 
  Palette, 
  Type, 
  RotateCw, 
  RotateCcw, 
  Copy, 
  Trash2, 
  ChevronDown,
  Plus
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import html2canvas from 'html2canvas';
import { exportElementAsImage, toSafeColor } from '@/lib/html2canvas-patch';

type CertificateElement = {
  id: string;
  type: 'text' | 'image' | 'placeholder' | 'signature' | 'qrcode' | 'shape';
  content: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  color?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  alignText?: 'left' | 'center' | 'right';
  shapeType?: 'rectangle' | 'ellipse' | 'line';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  order?: number;
};

type CertificateTemplate = {
  id: string;
  name: string;
  background: string;
  backgroundImage?: string;
  width: number;
  height: number;
  borderWidth: number;
  borderColor: string;
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  elements: CertificateElement[];
};

const defaultTemplate: CertificateTemplate = {
  id: 'default',
  name: 'Default Certificate',
  background: '#ffffff',
  width: 800,
  height: 600,
  borderWidth: 0,
  borderColor: '#000000',
  borderStyle: 'solid',
  backgroundImage: '',
  elements: [
    {
      id: 'title',
      type: 'text',
      content: 'Certificate of Achievement',
      fontSize: 36,
      fontFamily: 'Georgia, serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      x: 400,
      y: 100,
      alignText: 'center',
    },
    {
      id: 'recipient-placeholder',
      type: 'placeholder',
      content: '{recipient_name}',
      fontSize: 28,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#1E293B',
      x: 400,
      y: 250,
      alignText: 'center',
    },
    {
      id: 'description',
      type: 'text',
      content: 'has successfully completed the requirements for',
      fontSize: 18,
      fontFamily: 'Arial, sans-serif',
      color: '#1E293B',
      x: 400,
      y: 300,
      alignText: 'center',
    },
    {
      id: 'course-placeholder',
      type: 'placeholder',
      content: '{course_name}',
      fontSize: 24,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#1E293B',
      x: 400,
      y: 350,
      alignText: 'center',
    },
    {
      id: 'date',
      type: 'text',
      content: 'Issued on',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      color: '#64748B',
      x: 400,
      y: 450,
      alignText: 'center',
    },
    {
      id: 'date-placeholder',
      type: 'placeholder',
      content: '{issue_date}',
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#1E293B',
      x: 400,
      y: 480,
      alignText: 'center',
    },
    {
      id: 'signature-placeholder',
      type: 'signature',
      content: '',
      x: 400,
      y: 520,
      width: 200,
      height: 50,
    },
    {
      id: 'issuer-name',
      type: 'placeholder',
      content: '{issuer_name}',
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#1E293B',
      x: 400,
      y: 550,
      alignText: 'center',
    },
  ],
};

// Predefined templates
const templates: CertificateTemplate[] = [
  defaultTemplate,
  {
    id: 'modern',
    name: 'Modern Certificate',
    background: '#F0F9FF',
    backgroundImage: '',
    width: 800,
    height: 600,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderStyle: 'solid' as 'solid',
    elements: [
      {
        id: 'title',
        type: 'text',
        content: 'Certificate of Excellence',
        fontSize: 40,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        color: '#2563EB',
        x: 400,
        y: 120,
        alignText: 'center',
      },
      {
        id: 'recipient-label',
        type: 'text',
        content: 'This certificate is presented to',
        fontSize: 16,
        fontFamily: 'Inter, sans-serif',
        color: '#64748B',
        x: 400,
        y: 200,
        alignText: 'center',
      },
      {
        id: 'recipient-placeholder',
        type: 'placeholder',
        content: '{recipient_name}',
        fontSize: 32,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        color: '#1E293B',
        x: 400,
        y: 240,
        alignText: 'center',
      },
      {
        id: 'description',
        type: 'text',
        content: 'for successfully completing',
        fontSize: 16,
        fontFamily: 'Inter, sans-serif',
        color: '#64748B',
        x: 400,
        y: 300,
        alignText: 'center',
      },
      {
        id: 'course-placeholder',
        type: 'placeholder',
        content: '{course_name}',
        fontSize: 24,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        color: '#1E293B',
        x: 400,
        y: 340,
        alignText: 'center',
      },
      {
        id: 'date-placeholder',
        type: 'placeholder',
        content: '{issue_date}',
        fontSize: 16,
        fontFamily: 'Inter, sans-serif',
        color: '#64748B',
        x: 300,
        y: 480,
        alignText: 'center',
      },
      {
        id: 'signature-placeholder',
        type: 'signature',
        content: '',
        x: 500,
        y: 480,
        width: 150,
        height: 50,
      },
      {
        id: 'issuer-name',
        type: 'placeholder',
        content: '{issuer_name}',
        fontSize: 16,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        color: '#1E293B',
        x: 500,
        y: 520,
        alignText: 'center',
      },
    ],
  },
  {
    id: 'academic',
    name: 'Academic Certificate',
    background: '#FFFBEB',
    backgroundImage: '',
    width: 800,
    height: 600,
    borderWidth: 8,
    borderColor: '#854D0E',
    borderStyle: 'double' as 'double',
    elements: [
      {
        id: 'title',
        type: 'text',
        content: 'ACADEMIC CERTIFICATE',
        fontSize: 36,
        fontFamily: 'Times New Roman, serif',
        fontWeight: 'bold',
        color: '#78350F',
        x: 400,
        y: 100,
        alignText: 'center',
      },
      {
        id: 'subtitle',
        type: 'text',
        content: 'This is to certify that',
        fontSize: 18,
        fontFamily: 'Times New Roman, serif',
        color: '#78350F',
        x: 400,
        y: 180,
        alignText: 'center',
      },
      {
        id: 'recipient-placeholder',
        type: 'placeholder',
        content: '{recipient_name}',
        fontSize: 30,
        fontFamily: 'Times New Roman, serif',
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: '#78350F',
        x: 400,
        y: 240,
        alignText: 'center',
      },
      {
        id: 'description1',
        type: 'text',
        content: 'has successfully completed all requirements',
        fontSize: 18,
        fontFamily: 'Times New Roman, serif',
        color: '#78350F',
        x: 400,
        y: 300,
        alignText: 'center',
      },
      {
        id: 'description2',
        type: 'text',
        content: 'for the degree of',
        fontSize: 18,
        fontFamily: 'Times New Roman, serif',
        color: '#78350F',
        x: 400,
        y: 330,
        alignText: 'center',
      },
      {
        id: 'course-placeholder',
        type: 'placeholder',
        content: '{course_name}',
        fontSize: 26,
        fontFamily: 'Times New Roman, serif',
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: '#78350F',
        x: 400,
        y: 380,
        alignText: 'center',
      },
      {
        id: 'date-label',
        type: 'text',
        content: 'Date:',
        fontSize: 14,
        fontFamily: 'Times New Roman, serif',
        color: '#78350F',
        x: 250,
        y: 480,
        alignText: 'right',
      },
      {
        id: 'date-placeholder',
        type: 'placeholder',
        content: '{issue_date}',
        fontSize: 14,
        fontFamily: 'Times New Roman, serif',
        color: '#78350F',
        x: 330,
        y: 480,
        alignText: 'center',
      },
      {
        id: 'signature-label',
        type: 'text',
        content: 'Signature:',
        fontSize: 14,
        fontFamily: 'Times New Roman, serif',
        color: '#78350F',
        x: 470,
        y: 480,
        alignText: 'right',
      },
      {
        id: 'signature-placeholder',
        type: 'signature',
        content: '',
        x: 570,
        y: 480,
        width: 150,
        height: 50,
      },
      {
        id: 'issuer-name',
        type: 'placeholder',
        content: '{issuer_name}',
        fontSize: 14,
        fontFamily: 'Times New Roman, serif',
        fontWeight: 'bold',
        color: '#78350F',
        x: 570,
        y: 520,
        alignText: 'center',
      },
    ],
  },
  {
    id: 'professional',
    name: 'Professional Certificate',
    background: '#F8FAFC',
    backgroundImage: '',
    width: 850,
    height: 600,
    borderWidth: 2,
    borderColor: '#475569',
    borderStyle: 'solid' as 'solid',
    elements: [
      {
        id: 'title',
        type: 'text',
        content: 'PROFESSIONAL CERTIFICATION',
        fontSize: 32,
        fontFamily: 'Helvetica, sans-serif',
        fontWeight: 'bold',
        color: '#334155',
        x: 425,
        y: 100,
        alignText: 'center',
      },
      {
        id: 'recipient-placeholder',
        type: 'placeholder',
        content: '{recipient_name}',
        fontSize: 28,
        fontFamily: 'Helvetica, sans-serif',
        fontWeight: 'bold',
        color: '#334155',
        x: 425,
        y: 200,
        alignText: 'center',
      },
      {
        id: 'description',
        type: 'text',
        content: 'has demonstrated the knowledge and skills required for',
        fontSize: 16,
        fontFamily: 'Helvetica, sans-serif',
        color: '#475569',
        x: 425,
        y: 250,
        alignText: 'center',
      },
      {
        id: 'course-placeholder',
        type: 'placeholder',
        content: '{course_name}',
        fontSize: 24,
        fontFamily: 'Helvetica, sans-serif',
        fontWeight: 'bold',
        color: '#334155',
        x: 425,
        y: 300,
        alignText: 'center',
      },
      {
        id: 'certification-label',
        type: 'text',
        content: 'and is hereby recognized as a certified professional',
        fontSize: 16,
        fontFamily: 'Helvetica, sans-serif',
        color: '#475569',
        x: 425,
        y: 340,
        alignText: 'center',
      },
      {
        id: 'date-label',
        type: 'text',
        content: 'Issue Date:',
        fontSize: 14,
        fontFamily: 'Helvetica, sans-serif',
        fontWeight: 'bold',
        color: '#475569',
        x: 250,
        y: 450,
        alignText: 'center',
      },
      {
        id: 'date-placeholder',
        type: 'placeholder',
        content: '{issue_date}',
        fontSize: 14,
        fontFamily: 'Helvetica, sans-serif',
        color: '#475569',
        x: 250,
        y: 480,
        alignText: 'center',
      },
      {
        id: 'signature-label',
        type: 'text',
        content: 'Authorized Signature',
        fontSize: 14,
        fontFamily: 'Helvetica, sans-serif',
        fontWeight: 'bold',
        color: '#475569',
        x: 600,
        y: 450,
        alignText: 'center',
      },
      {
        id: 'signature-placeholder',
        type: 'signature',
        content: '',
        x: 600,
        y: 500,
        width: 150,
        height: 50,
      },
      {
        id: 'issuer-name',
        type: 'placeholder',
        content: '{issuer_name}',
        fontSize: 14,
        fontFamily: 'Helvetica, sans-serif',
        color: '#475569',
        x: 600,
        y: 530,
        alignText: 'center',
      },
    ],
  },
];

interface CertificateDesignerProps {
  onSave: (template: CertificateTemplate) => void;
  initialTemplate?: CertificateTemplate;
  translations?: any; // Make translations optional since we'll add fallbacks
}

export default function CertificateDesigner({ 
  onSave, 
  initialTemplate = defaultTemplate,
  translations = {} // Default to empty object if not provided
}: CertificateDesignerProps) {
  // Access translations with fallbacks
  const t = {
    save: translations.save || 'Save',
    cancel: translations.cancel || 'Cancel',
    export: translations.export || 'Export',
    template: translations.template || 'Template',
    addText: translations.addText || 'Add Text',
    addImage: translations.addImage || 'Add Image',
    preview: translations.preview || 'Preview',
    previewCertificate: translations.previewCertificate || 'Preview Certificate',
    addPlaceholder: translations.addPlaceholder || 'Add Placeholder',
    addSignature: translations.addSignature || 'Add Signature',
    addQRCode: translations.addQRCode || 'Add QR Code',
    addShape: translations.addShape || 'Add Shape',
    bringToFront: translations.bringToFront || 'Bring to Front',
    sendToBack: translations.sendToBack || 'Send to Back',
    deleteElement: translations.deleteElement || 'Delete Element',
    alignLeft: translations.alignLeft || 'Align Left',
    center: translations.center || 'Center',
    alignRight: translations.alignRight || 'Align Right',
    bold: translations.bold || 'Bold',
    italic: translations.italic || 'Italic',
    underline: translations.underline || 'Underline'
    // Add more fallbacks as needed
  };

  const [activeTemplate, setActiveTemplate] = useState<CertificateTemplate>(initialTemplate);
  const [selectedElement, setSelectedElement] = useState<CertificateElement | null>(null);
  const [activeTab, setActiveTab] = useState("design");
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [clipboardElement, setClipboardElement] = useState<CertificateElement | null>(null);

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      // Cast to ensure the type is correct
      const typedTemplate: CertificateTemplate = {
        ...selectedTemplate,
        borderStyle: selectedTemplate.borderStyle as 'none' | 'solid' | 'dashed' | 'dotted' | 'double'
      };
      setActiveTemplate(typedTemplate);
    }
  };

  // Handle element selection
  const handleElementSelect = (element: CertificateElement) => {
    setSelectedElement(element);
  };

  // Handle element update
  const handleElementUpdate = (updatedElement: Partial<CertificateElement>) => {
    if (!selectedElement) return;

    const updatedElements = activeTemplate.elements.map(el => 
      el.id === selectedElement.id ? { ...el, ...updatedElement } : el
    );

    setActiveTemplate({
      ...activeTemplate,
      elements: updatedElements
    });

    // Update selected element
    setSelectedElement(prev => prev ? { ...prev, ...updatedElement } : null);
  };

  // Handle element position change (drag)
  const handleDragStart = (e: React.MouseEvent, element: CertificateElement) => {
    if (!canvasRef.current) return;
    
    setIsDragging(true);
    setSelectedElement(element);
    
    // Calculate relative position
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setDragStartPos({
      x: e.clientX - (element.x - canvasRect.left),
      y: e.clientY - (element.y - canvasRect.top)
    });
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - dragStartPos.x + canvasRect.left;
    const newY = e.clientY - dragStartPos.y + canvasRect.top;
    
    handleElementUpdate({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Handle save
  const handleSave = () => {
    try {
      // Create a clone of the template to avoid reference issues
      const templateToSave = JSON.parse(JSON.stringify(activeTemplate));
      
      // Process colors to ensure they're in a standard format
      // This helps avoid oklch color issues when loading saved templates
      templateToSave.background = toSafeColor(templateToSave.background);
      templateToSave.borderColor = toSafeColor(templateToSave.borderColor);
      
      // Process all elements to ensure color values are in standard formats
      templateToSave.elements = templateToSave.elements.map((element: CertificateElement) => {
        const newElement = { ...element };
        
        // Convert color properties to standard formats if they exist
        if (newElement.color) newElement.color = toSafeColor(newElement.color);
        if (newElement.fillColor) newElement.fillColor = toSafeColor(newElement.fillColor);
        if (newElement.strokeColor) newElement.strokeColor = toSafeColor(newElement.strokeColor);
        
        return newElement;
      });
      
      // Save to localStorage with the processed template
      const saveResult = saveTemplateToLocalStorage(templateToSave);
      
      if (saveResult) {
        // Then save via callback
        onSave(templateToSave);
        console.log('Template saved successfully');
      } else {
        throw new Error('Failed to save template locally');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('There was an error saving the template. Please try again.');
    }
  };

  // Handle export as image
  const handleExport = async () => {
    if (!canvasRef.current) return;
    
    try {
      // Now that we've fixed the color parsing issue, we can use html2canvas directly
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow cross-origin images
        allowTaint: true,
        backgroundColor: '#ffffff', // Safe white background
        logging: false, // Set to true for debugging
      });
      
      // Convert canvas to a data URL
      const imageUrl = canvas.toDataURL('image/png');
      
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.download = `${activeTemplate.name.replace(/\s+/g, '-')}-certificate-${Date.now()}.png`;
      link.href = imageUrl;
      link.click();
      
      console.log('Certificate exported as image');
    } catch (error) {
      console.error('Error exporting certificate:', error);
      alert('There was an error exporting the certificate. Please try again or use a different browser.');
    }
  };

  // Fix oklch colors by applying computed RGB values
  const fixOklchColors = () => {
    if (!canvasRef.current) return;
    
    // Apply RGB colors to all elements that might be using oklch
    const applyComputedColors = (element: HTMLElement) => {
      // Get computed style (browser converts oklch to RGB automatically)
      const style = window.getComputedStyle(element);
      
      // Check if any style property contains 'oklch'
      const hasOklch = 
        element.style.backgroundColor?.includes('oklch') ||
        element.style.color?.includes('oklch') ||
        element.style.borderColor?.includes('oklch');
      
      if (hasOklch) {
        // Apply computed RGB values
        element.style.setProperty('--original-bg', element.style.backgroundColor);
        element.style.setProperty('--original-color', element.style.color);
        element.style.setProperty('--original-border', element.style.borderColor);
        
        // Replace with computed RGB 
        element.style.backgroundColor = style.backgroundColor;
        element.style.color = style.color;
        element.style.borderColor = style.borderColor;
      }
      
      // Process children
      Array.from(element.children).forEach(child => {
        applyComputedColors(child as HTMLElement);
      });
    };
    
    // Start with the canvas container
    applyComputedColors(canvasRef.current);
  };

  // Add a new text element
  const handleAddText = () => {
    const newElement: CertificateElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'New Text',
      fontSize: 18,
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      x: 400,
      y: 300,
      alignText: 'center',
    };

    setActiveTemplate({
      ...activeTemplate,
      elements: [...activeTemplate.elements, newElement]
    });

    setSelectedElement(newElement);
  };

  // Add a new placeholder element
  const handleAddPlaceholder = () => {
    const newElement: CertificateElement = {
      id: `placeholder-${Date.now()}`,
      type: 'placeholder',
      content: '{placeholder}',
      fontSize: 18,
      fontFamily: 'Arial, sans-serif',
      color: '#3B82F6',
      x: 400,
      y: 350,
      alignText: 'center',
    };

    setActiveTemplate({
      ...activeTemplate,
      elements: [...activeTemplate.elements, newElement]
    });

    setSelectedElement(newElement);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload the image to a server and get a URL
    // For this demo, we'll use a fake URL
    const fakeUrl = URL.createObjectURL(file);
    
    const newElement: CertificateElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      content: fakeUrl,
      x: 400,
      y: 300,
      width: 200,
      height: 100,
    };

    setActiveTemplate({
      ...activeTemplate,
      elements: [...activeTemplate.elements, newElement]
    });

    setSelectedElement(newElement);
  };

  // Handle background color change
  const handleBackgroundChange = (color: string) => {
    setActiveTemplate({
      ...activeTemplate,
      background: color
    });
  };

  // Handle element deletion
  const handleDeleteElement = () => {
    if (!selectedElement) return;

    setActiveTemplate({
      ...activeTemplate,
      elements: activeTemplate.elements.filter(el => el.id !== selectedElement.id)
    });

    setSelectedElement(null);
  };

  // Handle template property updates
  const handleTemplateUpdate = (updates: Partial<CertificateTemplate>) => {
    setActiveTemplate({
      ...activeTemplate,
      ...updates
    });
  };

  // Add a signature field
  const handleAddSignature = () => {
    const newElement: CertificateElement = {
      id: `signature-${Date.now()}`,
      type: 'signature',
      content: '',
      x: 400,
      y: 400,
      width: 200,
      height: 50,
      color: '#000000',
    };

    setActiveTemplate({
      ...activeTemplate,
      elements: [...activeTemplate.elements, newElement]
    });

    setSelectedElement(newElement);
  };

  // Add a QR code element
  const handleAddQRCode = () => {
    const newElement: CertificateElement = {
      id: `qrcode-${Date.now()}`,
      type: 'qrcode',
      content: '{verification_url}',
      x: 400,
      y: 400,
      width: 120,
      height: 120,
    };

    setActiveTemplate({
      ...activeTemplate,
      elements: [...activeTemplate.elements, newElement]
    });

    setSelectedElement(newElement);
  };

  // Add a shape element
  const handleAddShape = () => {
    const newElement: CertificateElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      content: '',
      shapeType: 'rectangle',
      x: 400,
      y: 300,
      width: 200,
      height: 100,
      fillColor: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 1,
    };

    setActiveTemplate({
      ...activeTemplate,
      elements: [...activeTemplate.elements, newElement]
    });

    setSelectedElement(newElement);
  };

  // Handle bring to front
  const handleBringToFront = (element: CertificateElement) => {
    // Find the highest order
    const maxOrder = Math.max(...activeTemplate.elements.map(el => el.order || 0), 0);
    
    // Update the element
    handleElementUpdate({ order: maxOrder + 1 });
  };

  // Handle send to back
  const handleSendToBack = (element: CertificateElement) => {
    // Find the lowest order
    const minOrder = Math.min(...activeTemplate.elements.map(el => el.order || 0), 0);
    
    // Update the element
    handleElementUpdate({ order: minOrder - 1 });
  };

  // Copy element to clipboard
  const handleCopyElement = () => {
    if (selectedElement) {
      setClipboardElement({...selectedElement});
    }
  };

  // Paste element from clipboard
  const handlePasteElement = () => {
    if (clipboardElement) {
      const newElement = {
        ...clipboardElement,
        id: `${clipboardElement.type}-${Date.now()}`,
        x: clipboardElement.x + 20,
        y: clipboardElement.y + 20,
      };
      
      setActiveTemplate({
        ...activeTemplate,
        elements: [...activeTemplate.elements, newElement]
      });
      
      setSelectedElement(newElement);
    }
  };

  // Duplicate selected element
  const handleDuplicateElement = () => {
    if (selectedElement) {
      const newElement = {
        ...selectedElement,
        id: `${selectedElement.type}-${Date.now()}`,
        x: selectedElement.x + 20,
        y: selectedElement.y + 20,
      };
      
      setActiveTemplate({
        ...activeTemplate,
        elements: [...activeTemplate.elements, newElement]
      });
      
      setSelectedElement(newElement);
    }
  };

  // Attach mouse events for drag operation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleDragMove(e as unknown as React.MouseEvent);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Add keyboard shortcuts for copy/paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if focus is not in an input or textarea
      const activeElement = document.activeElement;
      const isInputActive = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
      
      if (!isInputActive) {
        // Copy (Ctrl+C / Cmd+C)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
          if (selectedElement) {
            handleCopyElement();
            e.preventDefault();
          }
        }
        
        // Paste (Ctrl+V / Cmd+V)
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
          handlePasteElement();
          e.preventDefault();
        }
        
        // Duplicate (Ctrl+D / Cmd+D)
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
          if (selectedElement) {
            handleDuplicateElement();
            e.preventDefault();
          }
        }
        
        // Delete (Delete key or Backspace)
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selectedElement) {
            handleDeleteElement();
            e.preventDefault();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, clipboardElement]);

  // Template storage functions
  const saveTemplateToLocalStorage = (template: CertificateTemplate) => {
    try {
      // Validate the template has required fields
      if (!template.id || !template.name) {
        console.error('Invalid template - missing required fields');
        return false;
      }
      
      // Get existing templates from localStorage
      const savedTemplates = localStorage.getItem('certificate_templates');
      let templates = savedTemplates ? JSON.parse(savedTemplates) : [];
      
      // Check if template with this ID already exists
      const existingIndex = templates.findIndex((t: CertificateTemplate) => t.id === template.id);
      
      if (existingIndex >= 0) {
        // Update existing template
        templates[existingIndex] = template;
      } else {
        // Add new template
        templates.push(template);
      }
      
      // Save back to localStorage
      localStorage.setItem('certificate_templates', JSON.stringify(templates));
      return true;
    } catch (error) {
      console.error('Error saving template:', error);
      return false;
    }
  };

  const getTemplatesFromLocalStorage = (): CertificateTemplate[] => {
    try {
      const savedTemplates = localStorage.getItem('certificate_templates');
      return savedTemplates ? JSON.parse(savedTemplates) : [];
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  };

  // Add a function to load saved templates
  const [savedTemplates, setSavedTemplates] = useState<CertificateTemplate[]>([]);

  // Load saved templates on mount
  useEffect(() => {
    const templates = getTemplatesFromLocalStorage();
    setSavedTemplates(templates);
  }, []);

  // Add a helper function to directly handle the oklch color issue
  const fixHtml2CanvasColorIssue = () => {
    // Monkey patch the color parsing in html2canvas
    try {
      // Find the html2canvas in the window object
      const html2canvasModule = (window as any).html2canvas || html2canvas;
      
      // Store the original parse function
      const originalParse = html2canvasModule.parse;
      
      // Replace with our safe version
      html2canvasModule.parse = function(value: string, ...args: any[]) {
        // Check if the color is oklch and replace with a safe value
        if (value && typeof value === 'string' && value.includes('oklch')) {
          return originalParse.call(this, '#ffffff', ...args);
        }
        
        // Use the original function for other colors
        return originalParse.call(this, value, ...args);
      };
      
      console.log('Successfully patched html2canvas color parsing');
      return true;
    } catch (error) {
      console.error('Failed to patch html2canvas:', error);
      return false;
    }
  };

  // Apply the patch when the component mounts
  useEffect(() => {
    fixHtml2CanvasColorIssue();
  }, []);

  // At the end of the component, replace the broken return statement with the properly structured JSX
  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
        {/* Left sidebar with tools */}
        <Card className="lg:col-span-1 h-full overflow-auto">
          <CardHeader>
            <CardTitle>{translations.designOptions || 'Design Options'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="elements">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="elements">{translations.elements || 'Elements'}</TabsTrigger>
                <TabsTrigger value="settings">{translations.settings || 'Settings'}</TabsTrigger>
              </TabsList>
              
              {/* Elements tab content */}
              <TabsContent value="elements" className="space-y-4">
                <div className="space-y-2">
                  <Label>Predefined Templates</Label>
                  <Select 
                    value={activeTemplate.id === 'custom' ? 'default' : activeTemplate.id}
                    onValueChange={(value) => {
                      const selected = templates.find(t => t.id === value);
                      if (selected) {
                        setActiveTemplate(selected);
                        setSelectedElement(null);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Saved templates */}
                {savedTemplates.length > 0 && (
                  <div className="space-y-2">
                    <Label>Saved Templates</Label>
                    <Select 
                      onValueChange={(value) => {
                        const selected = savedTemplates.find(t => t.id === value);
                        if (selected) {
                          setActiveTemplate(selected);
                          setSelectedElement(null);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Load saved template" />
                      </SelectTrigger>
                      <SelectContent>
                        {savedTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={activeTemplate.name}
                    onChange={(e) => handleTemplateUpdate({ name: e.target.value })}
                    placeholder="Enter template name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="color" 
                      value={activeTemplate.background}
                      onChange={(e) => handleBackgroundChange(e.target.value)}
                      className="w-12 h-8 p-0 cursor-pointer"
                    />
                    <Input 
                      type="text" 
                      value={activeTemplate.background}
                      onChange={(e) => handleBackgroundChange(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Background Image URL</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={activeTemplate.backgroundImage || ''}
                      onChange={(e) => handleTemplateUpdate({ backgroundImage: e.target.value })}
                      placeholder="https://example.com/background.jpg"
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTemplateUpdate({ backgroundImage: '' })}
                    >
                      Clear
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Enter a URL or upload an image using the elements tab</p>
                </div>
                
                <div className="space-y-2 border-t pt-4 mt-4">
                  <Label>Border Settings</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Border Width</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          value={[activeTemplate.borderWidth]}
                          min={0}
                          max={16}
                          step={1}
                          onValueChange={(value) => handleTemplateUpdate({ borderWidth: value[0] })}
                          className="flex-1"
                        />
                        <span className="w-8 text-center">{activeTemplate.borderWidth}px</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Border Style</Label>
                      <Select 
                        value={activeTemplate.borderStyle}
                        onValueChange={(value) => handleTemplateUpdate({ 
                          borderStyle: value as 'none' | 'solid' | 'dashed' | 'dotted' | 'double'
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Border style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="dashed">Dashed</SelectItem>
                          <SelectItem value="dotted">Dotted</SelectItem>
                          <SelectItem value="double">Double</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Border Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="color" 
                          value={activeTemplate.borderColor}
                          onChange={(e) => handleTemplateUpdate({ borderColor: e.target.value })}
                          className="w-8 h-8 p-0 cursor-pointer"
                        />
                        <Input 
                          type="text" 
                          value={activeTemplate.borderColor}
                          onChange={(e) => handleTemplateUpdate({ borderColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 border-t pt-4 mt-4">
                  <Label>Certificate Dimensions</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Width</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={activeTemplate.width}
                          onChange={(e) => handleTemplateUpdate({ width: Number(e.target.value) })}
                          min={600}
                          max={1200}
                          className="flex-1"
                        />
                        <span className="text-xs">px</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Height</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={activeTemplate.height}
                          onChange={(e) => handleTemplateUpdate({ height: Number(e.target.value) })}
                          min={400}
                          max={1000}
                          className="flex-1"
                        />
                        <span className="text-xs">px</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleExport} 
                    className="w-full mb-2"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t.export} as Image
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    className="w-full"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {t.save} Template
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-2">
                  <Label>Add Elements</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={handleAddText} variant="outline" className="flex flex-col items-center justify-center h-20 w-full p-2 hover:bg-slate-100">
                      <Type className="h-6 w-6 mb-1" />
                      <span>{t.addText}</span>
                    </Button>
                    <Button onClick={handleAddPlaceholder} variant="outline" className="flex flex-col items-center justify-center h-20 w-full p-2 hover:bg-slate-100">
                      <Copy className="h-6 w-6 mb-1" />
                      <span>{t.addPlaceholder}</span>
                    </Button>
                    <Button variant="outline" className="relative flex flex-col items-center justify-center h-20 w-full p-2 hover:bg-slate-100">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <ImageIcon className="h-6 w-6 mb-1" />
                      <span>{t.addImage}</span>
                    </Button>
                    <Button onClick={handleAddSignature} variant="outline" className="flex flex-col items-center justify-center h-20 w-full p-2 hover:bg-slate-100">
                      <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 20L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M4 12C4 12 7 4 12 4C17 4 16 12 16 12C16 12 18 12 19 14C20 16 20 20 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>{t.addSignature}</span>
                    </Button>
                    <Button onClick={handleAddQRCode} variant="outline" className="flex flex-col items-center justify-center h-20 w-full p-2 hover:bg-slate-100">
                      <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <rect x="13" y="4" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <rect x="4" y="13" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M17 13H16V14H17V13Z" fill="currentColor"/>
                        <path d="M17 17H16V20H20V19H17V17Z" fill="currentColor"/>
                        <path d="M13 17H14V20H13V17Z" fill="currentColor"/>
                        <path d="M13 13H14V16H13V13Z" fill="currentColor"/>
                        <path d="M17 15H20V16H17V15Z" fill="currentColor"/>
                      </svg>
                      <span>{t.addQRCode}</span>
                    </Button>
                    <Button onClick={handleAddShape} variant="outline" className="flex flex-col items-center justify-center h-20 w-full p-2 hover:bg-slate-100">
                      <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>{t.addShape}</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Right panel - certificate preview */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Preview</CardTitle>
              <CardDescription>
                Click on elements to edit them. Drag to reposition.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="relative bg-gray-100 rounded-lg overflow-hidden shadow-inner"
                style={{ 
                  width: '100%', 
                  height: 'calc(100vh - 12rem)',
                  overflow: 'auto'
                }}
              >
                <div 
                  ref={canvasRef}
                  id="certificate-canvas" 
                  className="absolute transform-gpu"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `${activeTemplate.width}px`,
                    height: `${activeTemplate.height}px`,
                    background: activeTemplate.background,
                    backgroundImage: activeTemplate.backgroundImage ? `url(${activeTemplate.backgroundImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    border: activeTemplate.borderWidth ? 
                      `${activeTemplate.borderWidth}px ${activeTemplate.borderStyle} ${activeTemplate.borderColor}` : 'none',
                    position: 'relative'
                  }}
                  onClick={() => setSelectedElement(null)}
                >
                  {activeTemplate.elements
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((element) => (
                    <div
                      key={element.id}
                      className={`absolute ${
                        selectedElement?.id === element.id 
                          ? 'outline outline-2 outline-blue-500 z-50' 
                          : 'hover:outline hover:outline-1 hover:outline-blue-300'
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        transform: `translate(-50%, -50%) ${
                          element.rotation ? `rotate(${element.rotation}deg)` : ''
                        }`,
                        zIndex: element.order || 0,
                        cursor: isDragging ? 'grabbing' : 'grab',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleElementSelect(element);
                      }}
                      onMouseDown={(e) => handleDragStart(e, element)}
                    >
                      {element.type === 'text' || element.type === 'placeholder' ? (
                        <div
                          style={{
                            fontSize: `${element.fontSize}px`,
                            fontFamily: element.fontFamily,
                            fontWeight: element.fontWeight,
                            fontStyle: element.fontStyle,
                            textDecoration: element.textDecoration,
                            color: element.color,
                            textAlign: element.alignText,
                            minWidth: '100px',
                            padding: '5px',
                          }}
                        >
                          {element.content}
                        </div>
                      ) : element.type === 'image' ? (
                        <img
                          src={element.content}
                          alt="Certificate element"
                          style={{
                            width: `${element.width}px`,
                            height: `${element.height}px`,
                          }}
                          draggable={false}
                        />
                      ) : element.type === 'signature' ? (
                        <div
                          style={{
                            width: `${element.width}px`,
                            height: `${element.height}px`,
                            borderBottom: `2px solid ${element.color || '#000000'}`,
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                          }}
                        >
                          <span style={{ fontSize: '14px', color: '#64748B' }}>Signature</span>
                        </div>
                      ) : element.type === 'qrcode' ? (
                        <div
                          style={{
                            width: `${element.width}px`,
                            height: `${element.height}px`,
                            backgroundColor: '#F9FAFB',
                            border: '1px solid #E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                          }}
                        >
                          <svg 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                              width: '60%',
                              height: '60%',
                            }}
                          >
                            <rect x="4" y="4" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <rect x="13" y="4" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <rect x="4" y="13" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M17 13H16V14H17V13Z" fill="currentColor"/>
                            <path d="M17 17H16V20H20V19H17V17Z" fill="currentColor"/>
                            <path d="M13 17H14V20H13V17Z" fill="currentColor"/>
                            <path d="M13 13H14V16H13V13Z" fill="currentColor"/>
                            <path d="M17 15H20V16H17V15Z" fill="currentColor"/>
                          </svg>
                          <span className="text-xs mt-1">{element.content}</span>
                        </div>
                      ) : element.type === 'shape' ? (
                        element.shapeType === 'rectangle' ? (
                          <div
                            style={{
                              width: `${element.width}px`,
                              height: `${element.height}px`,
                              backgroundColor: element.fillColor || 'transparent',
                              border: `${element.strokeWidth || 1}px ${element.strokeColor || '#000'} solid`,
                            }}
                          ></div>
                        ) : element.shapeType === 'ellipse' ? (
                          <div
                            style={{
                              width: `${element.width}px`,
                              height: `${element.height}px`,
                              backgroundColor: element.fillColor || 'transparent',
                              border: `${element.strokeWidth || 1}px ${element.strokeColor || '#000'} solid`,
                              borderRadius: '50%',
                            }}
                          ></div>
                        ) : element.shapeType === 'line' ? (
                          <div
                            style={{
                              width: `${element.width}px`,
                              height: `${element.strokeWidth || 1}px`,
                              backgroundColor: element.strokeColor || '#000',
                              transform: 'translateY(-50%)',
                            }}
                          ></div>
                        ) : null
                      ) : null}
                      
                      {selectedElement?.id === element.id && (
                        <>
                          {/* Resize handle - bottom right */}
                          {(element.type === 'image' || element.type === 'shape' || element.type === 'qrcode' || element.type === 'signature') && (
                            <div 
                              className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize"
                              style={{ 
                                transform: 'translate(50%, 50%)',
                                zIndex: 5,
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                const handleResize = (moveEvent: MouseEvent) => {
                                  const deltaX = moveEvent.clientX - e.clientX;
                                  const deltaY = moveEvent.clientY - e.clientY;
                                  
                                  const newWidth = Math.max(20, (element.width || 100) + deltaX);
                                  const newHeight = Math.max(20, (element.height || 100) + deltaY);
                                  
                                  handleElementUpdate({
                                    width: newWidth,
                                    height: newHeight
                                  });
                                };
                                
                                const handleMouseUp = () => {
                                  document.removeEventListener('mousemove', handleResize);
                                  document.removeEventListener('mouseup', handleMouseUp);
                                };
                                
                                document.addEventListener('mousemove', handleResize);
                                document.addEventListener('mouseup', handleMouseUp);
                              }}
                            />
                          )}
                          
                          {/* Rotation handle - top */}
                          <div 
                            className="absolute top-0 left-1/2 w-4 h-4 bg-yellow-500 rounded-full cursor-move"
                            style={{ 
                              transform: 'translate(-50%, -150%)',
                              zIndex: 5,
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              const elementCenter = { x: element.x, y: element.y };
                              
                              const handleRotate = (moveEvent: MouseEvent) => {
                                const canvasRect = canvasRef.current?.getBoundingClientRect();
                                if (!canvasRect) return;
                                
                                const centerX = elementCenter.x;
                                const centerY = elementCenter.y;
                                const mouseX = moveEvent.clientX - canvasRect.left;
                                const mouseY = moveEvent.clientY - canvasRect.top;
                                
                                // Calculate angle between center and mouse position
                                const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
                                // Adjust angle to make it more natural for rotation
                                const rotation = (angle + 90) % 360;
                                
                                handleElementUpdate({ rotation });
                              };
                              
                              const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleRotate);
                                document.removeEventListener('mouseup', handleMouseUp);
                              };
                              
                              document.addEventListener('mousemove', handleRotate);
                              document.addEventListener('mouseup', handleMouseUp);
                            }}
                          />
                          
                          {/* Element toolbar */}
                          <div className="absolute top-0 right-0 transform translate-x-[calc(100%+5px)] flex flex-col gap-1 bg-white rounded border shadow-sm p-1">
                            <Button 
                              variant="ghost" 
                              className="h-7 w-7" 
                              onClick={() => handleDuplicateElement()}
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="4" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                                <path d="M8 8V6C8 4.89543 8.89543 4 10 4H18C19.1046 4 20 4.89543 20 6V14C20 15.1046 19.1046 16 18 16H16" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="h-7 w-7"
                              onClick={() => handleBringToFront(element)}
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 19H22M2 5H22M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="h-7 w-7 text-red-500"
                              onClick={() => handleDeleteElement()}
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 7V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V7M6 7H5M6 7H8M18 7H19M18 7H16M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7M8 7H16M10 11V16M14 11V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 