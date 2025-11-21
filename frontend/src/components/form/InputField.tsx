import React from 'react';

interface InputFieldProps {
  label: string;
  id: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'password';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  isFocused?: boolean;
  showSuccessIcon?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  required = false,
  error,
  isFocused = false,
  showSuccessIcon = false
}) => {
  const hasValue = value && value.length > 0;
  const isValid = hasValue && !error;

  const getInputClassName = (): string => {
    const baseClasses = 'w-full bg-gray-50 dark:bg-brand-dark border rounded-lg px-4 py-3 text-gray-900 dark:text-brand-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all duration-200';
    
    if (error) {
      return `${baseClasses} border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500`;
    }
    if (isFocused) {
      return `${baseClasses} border-blue-500 dark:border-brand-accent focus:border-blue-500 dark:focus:border-brand-accent focus:ring-1 focus:ring-blue-500 dark:focus:ring-brand-accent`;
    }
    if (isValid && showSuccessIcon) {
      return `${baseClasses} border-green-500/50 focus:border-green-500`;
    }
    return `${baseClasses} border-gray-300 dark:border-brand-gray/50 hover:border-gray-400 dark:hover:border-brand-gray`;
  };

  return (
    <div className="group">
      <label 
        className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider" 
        htmlFor={id}
      >
        {label} {required && <span className="text-blue-500 dark:text-brand-accent">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required={required}
          className={getInputClassName()}
          placeholder={placeholder}
        />
        
        {/* Success Icon */}
        {showSuccessIcon && isValid && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* Error Icon */}
        {error && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-start space-x-1">
          <p className="text-xs text-red-500 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

export default InputField;
