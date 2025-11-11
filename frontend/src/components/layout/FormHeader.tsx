import React from 'react';

const FormHeader: React.FC = () => {
  return (
    <div className="text-center mb-12 animate-fade-in">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
        Know Your Customer
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Submit your details below and let our AI-powered system generate an intelligent summary instantly ⚡
      </p>
    </div>
  );
};

export default FormHeader;
