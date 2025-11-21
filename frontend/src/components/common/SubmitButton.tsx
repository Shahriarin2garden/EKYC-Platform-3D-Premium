import React from 'react';

interface SubmitButtonProps {
  loading: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  type?: 'submit' | 'button' | 'reset';
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ 
  loading, 
  disabled = false, 
  children,
  type = 'submit'
}) => {
  const isDisabled = loading || disabled;

  const getButtonClasses = () => {
    if (loading) return 'bg-gray-400 dark:bg-brand-gray text-gray-200 dark:text-brand-white/50 cursor-wait';
    if (isDisabled) return 'bg-gray-300 dark:bg-brand-gray text-gray-400 dark:text-brand-white/30 cursor-not-allowed';
    return 'bg-gray-900 dark:bg-brand-white text-white dark:text-brand-black hover:bg-blue-600 dark:hover:bg-brand-accent hover:text-white hover:shadow-glow';
  };

  return (
    <div className="relative group">
      <button
        type={type}
        disabled={isDisabled}
        className={`relative w-full py-4 px-8 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-300 ${getButtonClasses()}`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <div className="w-4 h-4 mr-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </span>
        ) : (
          children || (
            <span className="flex items-center justify-center">
              <span>Submit Application</span>
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          )
        )}
      </button>
    </div>
  );
};

export default SubmitButton;
