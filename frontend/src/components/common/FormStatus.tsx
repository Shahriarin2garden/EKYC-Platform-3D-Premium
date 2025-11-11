import React from 'react';
import { FormStatus as FormStatusType } from '../../types';

interface FormStatusProps {
  status: FormStatusType;
}

const FormStatus: React.FC<FormStatusProps> = ({ status }) => {
  if (!status.message) {
    return null;
  }

  const isSuccess = status.type === 'success';

  return (
    <div className={`p-6 rounded-2xl animate-slide-in ${
      isSuccess
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
        : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isSuccess ? (
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-semibold ${
            isSuccess ? 'text-green-800' : 'text-red-800'
          }`}>
            {status.message}
          </h3>
          {status.summary && (
            <div className="mt-3 p-4 bg-white rounded-xl border border-green-200">
              <p className="text-sm font-medium text-gray-700 mb-1">🤖 AI-Generated Summary:</p>
              <p className="text-sm text-gray-600 leading-relaxed">{status.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormStatus;
