import React from 'react';
import { FormStatus as FormStatusType } from '../../types';

interface FormStatusProps {
  status?: FormStatusType;
  error?: string;
  success?: string;
}

const FormStatus: React.FC<FormStatusProps> = ({ status, error, success }) => {
  const message = status?.message || error || success;
  
  if (!message) {
    return null;
  }

  const isSuccess = status?.type === 'success' || !!success;
  const summary = status?.summary;

  return (
    <div className={`relative p-6 rounded-2xl overflow-hidden border ${
      isSuccess
        ? 'bg-green-500/10 border-green-500/20' 
        : 'bg-red-500/10 border-red-500/20'
    }`}>
      <div className="relative flex items-start space-x-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          {isSuccess ? (
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 pt-1">
          <h3 className={`text-sm font-bold mb-1 ${
            isSuccess ? 'text-green-400' : 'text-red-400'
          }`}>
            {message}
          </h3>
          
          {summary && (
            <div className="mt-4 p-4 bg-brand-black/50 rounded-xl border border-brand-gray/30">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-brand-accent/20 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-brand-white/90">AI-Generated Summary</p>
              </div>
              <p className="text-sm text-brand-white/70 leading-relaxed">{summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormStatus;
