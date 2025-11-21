import React from 'react';

interface TextAreaFieldProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  isFocused?: boolean;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  rows = 3,
  required = false,
  isFocused = false
}) => {
  const hasValue = value && value.length > 0;
  const charCount = value.length;
  const maxChars = 500;
  const isNearLimit = charCount > maxChars * 0.8;

  const getTextAreaClassName = (): string => {
    const baseClasses = 'w-full bg-brand-dark border rounded-lg px-4 py-3 text-brand-white placeholder-gray-500 focus:outline-none transition-all duration-200 resize-none';
    
    if (isFocused) {
      return `${baseClasses} border-brand-accent focus:border-brand-accent focus:ring-1 focus:ring-brand-accent`;
    }
    if (hasValue) {
      return `${baseClasses} border-brand-gray/50 hover:border-brand-gray`;
    }
    return `${baseClasses} border-brand-gray/50 hover:border-brand-gray`;
  };

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <label 
          className="text-xs font-medium text-gray-400 uppercase tracking-wider" 
          htmlFor={id}
        >
          {label} {required && <span className="text-brand-accent">*</span>}
        </label>
        {hasValue && (
          <span className={`text-xs font-medium transition-colors ${isNearLimit ? 'text-red-500' : 'text-gray-500'}`}>
            {charCount} / {maxChars}
          </span>
        )}
      </div>
      <div className="relative">
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          rows={rows}
          required={required}
          maxLength={maxChars}
          className={getTextAreaClassName()}
          placeholder={placeholder}
        />
        
        {/* Character Count Progress Bar */}
        {hasValue && (
          <div className="mt-2 h-0.5 bg-brand-gray/30 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                isNearLimit 
                  ? 'bg-red-500' 
                  : 'bg-brand-accent'
              }`}
              style={{ width: `${(charCount / maxChars) * 100}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextAreaField;
