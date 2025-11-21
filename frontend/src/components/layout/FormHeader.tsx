import React from 'react';

const FormHeader: React.FC = () => {
  return (
    <div className="text-center mb-16">
      {/* Icon */}
      <div className="inline-flex items-center justify-center mb-8">
        <div className="w-20 h-20 bg-brand-white rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tighter text-brand-white">
        Know Your Customer
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-brand-white/60 max-w-2xl mx-auto leading-relaxed mb-8">
        Submit your details below. Our <span className="text-brand-white font-medium">AI-powered system</span> will generate an intelligent summary instantly.
      </p>

      {/* Feature Badges */}
      <div className="flex flex-wrap justify-center gap-4">
        <div className="flex items-center space-x-2 px-4 py-2 border border-brand-gray rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-brand-white/80">Secure & Encrypted</span>
        </div>
        
        <div className="flex items-center space-x-2 px-4 py-2 border border-brand-gray rounded-full">
          <div className="w-2 h-2 bg-brand-accent rounded-full"></div>
          <span className="text-sm font-medium text-brand-white/80">AI-Powered</span>
        </div>
        
        <div className="flex items-center space-x-2 px-4 py-2 border border-brand-gray rounded-full">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span className="text-sm font-medium text-brand-white/80">Instant Processing</span>
        </div>
      </div>
    </div>
  );
};

export default FormHeader;
