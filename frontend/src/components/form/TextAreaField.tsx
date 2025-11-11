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
  const getTextAreaClassName = (): string => {
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
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        rows={rows}
        required={required}
        className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-200 outline-none resize-none ${getTextAreaClassName()}`}
        placeholder={placeholder}
      />
    </div>
  );
};

export default TextAreaField;
