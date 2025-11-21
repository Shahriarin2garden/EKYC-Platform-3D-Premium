import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  message,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-brand-accent rounded-full animate-bounce"></div>
            <div className="w-2.5 h-2.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2.5 h-2.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        );

      case 'pulse':
        return (
          <div className="relative inline-flex items-center justify-center">
            <div className={`${sizeClasses[size]} bg-brand-accent rounded-full animate-ping absolute opacity-20`}></div>
            <div className={`${sizeClasses[size]} bg-brand-accent rounded-full opacity-80`}></div>
          </div>
        );

      default:
        return (
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-500 dark:bg-brand-accent blur-xl opacity-20 animate-pulse"></div>
             <svg className={`${sizeClasses[size]} animate-spin text-blue-600 dark:text-brand-accent relative z-10`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        );
    }
  };

  const content = (
    <div className="text-center animate-fade-in-up flex flex-col items-center justify-center">
      {renderSpinner()}
      {message && (
        <p className="mt-4 text-sm font-medium text-gray-700 dark:text-brand-white/70 uppercase tracking-wider">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/90 dark:bg-brand-black/90 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
