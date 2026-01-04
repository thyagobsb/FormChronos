import React from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  error
}) => {
  return (
    <div className="space-y-1.5 flex-1">
      <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</Label>
      <div className="flex gap-2">
        <div 
          className="relative w-10 h-10 rounded-md border border-border overflow-hidden shrink-0 shadow-sm"
          style={{ backgroundColor: value }}
        >
          <input 
            type="color" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-x-0 inset-y-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0"
          />
        </div>
        <Input 
          type="text" 
          value={value.toUpperCase()}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className={cn(
            "h-10 font-mono text-sm uppercase",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          maxLength={7}
        />
      </div>
      {error && <p className="text-[10px] font-medium text-destructive">{error}</p>}
    </div>
  );
};
