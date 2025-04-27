/**
 * This module provides a patched version of html2canvas that can handle oklch colors
 */

import html2canvas from 'html2canvas';
import type { Options } from 'html2canvas';

/**
 * Convert any color to a web-safe format (rgb or hex)
 * @param color Color string in any format
 * @returns Safe color string in rgb or hex format
 */
export const toSafeColor = (color: string): string => {
  if (!color) return '#ffffff';
  
  // If it's already a hex color
  if (color.startsWith('#')) {
    return color;
  }
  
  // If it's an oklch color, return a safe default
  if (color.includes('oklch')) {
    return '#ffffff'; // White as a safe default
  }
  
  // Try to create a temporary element to compute the color
  try {
    const tempEl = document.createElement('div');
    tempEl.style.color = color;
    document.body.appendChild(tempEl);
    const computedColor = window.getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);
    return computedColor; // This will be rgb() format, which is supported
  } catch (e) {
    console.warn('Failed to parse color:', color);
    return '#000000'; // Black as fallback
  }
};

/**
 * Process an element to replace all oklch colors with safe colors
 * @param element HTML element to process
 */
export const processSafeColors = (element: HTMLElement): void => {
  if (!element) return;
  
  // Function to process a single element
  const processElement = (el: HTMLElement) => {
    // Get all computed styles
    const style = window.getComputedStyle(el);
    
    // Replace potential oklch colors with computed RGB values
    if (el.style.color?.includes('oklch')) {
      el.style.color = style.color;
    }
    
    if (el.style.backgroundColor?.includes('oklch')) {
      el.style.backgroundColor = style.backgroundColor;
    }
    
    if (el.style.borderColor?.includes('oklch')) {
      el.style.borderColor = style.borderColor;
    }
    
    // Process all child elements
    Array.from(el.children).forEach(child => {
      processElement(child as HTMLElement);
    });
  };
  
  // Start processing from the root element
  processElement(element);
};

/**
 * Safely export an element as an image by handling oklch colors
 * @param element Element to export
 * @param options html2canvas options
 * @returns Promise resolving to a canvas
 */
export const safeHtml2Canvas = async (
  element: HTMLElement,
  options: Partial<Options> = {}
): Promise<HTMLCanvasElement> => {
  // Create a clone to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '-9999px';
  document.body.appendChild(clone);
  
  try {
    // Process the clone to handle oklch colors
    processSafeColors(clone);
    
    // Get element dimensions
    const rect = element.getBoundingClientRect();
    
    // Default options that include all required properties
    const defaultOptions: Partial<Options> = {
      scale: 2,
      allowTaint: true,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      
      // Window options
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      
      // Render options
      x: 0,
      y: 0,
      width: rect.width,
      height: rect.height
    };
    
    // Merge with user options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Render the clone to canvas
    const canvas = await html2canvas(clone, mergedOptions);
    return canvas;
  } finally {
    // Always clean up the clone
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
  }
};

/**
 * Export an element to an image file
 * @param element Element to export
 * @param filename Name for the downloaded file
 * @param options html2canvas options
 * @returns Promise resolving to success status
 */
export const exportElementAsImage = async (
  element: HTMLElement,
  filename: string,
  options: Partial<Options> = {}
): Promise<boolean> => {
  try {
    const canvas = await safeHtml2Canvas(element, options);
    
    // Convert to image and download
    const imageUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = imageUrl;
    link.click();
    
    return true;
  } catch (error) {
    console.error('Error exporting image:', error);
    return false;
  }
} 