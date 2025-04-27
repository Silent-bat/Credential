"use client";

import { useState, useEffect, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ColorPickerProps = {
  color: string;
  onChange: (color: string) => void;
};

const PRESET_COLORS = [
  "#000000", "#ffffff", "#f44336", "#e91e63", "#9c27b0", 
  "#673ab7", "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", 
  "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", 
  "#ffc107", "#ff9800", "#ff5722", "#795548", "#607d8b"
];

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handlePresetClick = (presetColor: string) => {
    onChange(presetColor);
    if (inputRef.current) {
      inputRef.current.value = presetColor;
    }
    setOpen(false);
  };

  // Helper to determine if a color is light (for text contrast)
  const isLightColor = (color: string): boolean => {
    // For hex colors
    if (color.startsWith('#')) {
      const hex = color.substring(1);
      const rgb = parseInt(hex, 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128;
    }
    return false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full h-9 rounded-md border flex items-center justify-between px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          style={{ 
            backgroundColor: color,
            color: isLightColor(color) ? '#000000' : '#ffffff',
            borderColor: 'rgba(0,0,0,0.1)'
          }}
        >
          {color}
          <span className="sr-only">Pick a color</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-3">
          <div>
            <input
              ref={inputRef}
              type="color"
              value={color}
              onChange={handleInputChange}
              className="w-full h-10 cursor-pointer"
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                aria-label={`Select color ${presetColor}`}
                className="w-8 h-8 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                style={{ backgroundColor: presetColor }}
                onClick={() => handlePresetClick(presetColor)}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 