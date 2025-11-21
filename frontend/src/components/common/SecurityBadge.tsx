import React from 'react';

const SecurityBadge: React.FC = () => {
  return (
    <div className="mt-10 pt-8 border-t border-brand-gray/20">
      <div className="flex flex-col items-center space-y-4">
        {/* Main security badges */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center space-x-2 px-4 py-2 bg-brand-white/5 rounded-full border border-brand-white/10">
            <svg className="w-4 h-4 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs font-medium text-brand-white/70 uppercase tracking-wider">256-bit Encryption</span>
          </div>

          <div className="flex items-center space-x-2 px-4 py-2 bg-brand-white/5 rounded-full border border-brand-white/10">
            <svg className="w-4 h-4 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs font-medium text-brand-white/70 uppercase tracking-wider">GDPR Compliant</span>
          </div>

          <div className="flex items-center space-x-2 px-4 py-2 bg-brand-white/5 rounded-full border border-brand-white/10">
            <svg className="w-4 h-4 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-xs font-medium text-brand-white/70 uppercase tracking-wider">AI-Powered</span>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="text-center space-y-1">
          <p className="text-xs font-medium text-brand-white/50">
            Your data is protected with industry-leading security standards
          </p>
          <div className="flex items-center justify-center space-x-1 text-xs text-brand-white/30">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Trusted by 10,000+ users worldwide</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityBadge;
