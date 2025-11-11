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

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`w-full py-5 px-8 rounded-xl font-bold text-lg text-white shadow-xl transform transition-all duration-200 ${
        isDisabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]'
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing with AI...
        </span>
      ) : (
        children || (
          <span className="flex items-center justify-center">
            Submit KYC
            <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        )
      )}
    </button>
  );
};

export default SubmitButton;
