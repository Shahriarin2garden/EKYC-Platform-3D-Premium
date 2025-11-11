import React from 'react';

interface InputFieldProps {
  label: string;
  id: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number';
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
  const getInputClassName = (): string => {
    if (error) {
      return 'border-red-400 bg-red-50';
    }
    if (isFocused) {
      return 'border-blue-500 bg-blue-50 shadow-lg';
    }
    return 'border-gray-200 hover:border-gray-300';
  };

  return (
    <div className="transform transition-all duration-200 hover:scale-[1.01]">
      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor={id}>
        {label} {required && '*'}
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
          className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-200 outline-none ${getInputClassName()}`}
          placeholder={placeholder}
        />
        {showSuccessIcon && value && !error && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 animate-shake">{error}</p>
      )}
    </div>
  );
};

export default InputField;
