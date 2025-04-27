'use client';

import { useState, ChangeEvent, InputHTMLAttributes, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ id, className, placeholder, value, onChange, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
  
  return (
      <div className="relative">
        <Input
          ref={ref}
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={`pr-10 ${className || ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3"
          onClick={togglePasswordVisibility}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOffIcon className="h-4 w-4 text-gray-500" />
          ) : (
            <EyeIcon className="h-4 w-4 text-gray-500" />
          )}
          <span className="sr-only">
            {showPassword ? 'Hide password' : 'Show password'}
          </span>
        </Button>
    </div>
  );
} 
);

PasswordField.displayName = 'PasswordField';

export default PasswordField;