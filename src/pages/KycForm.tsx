import React, { useState } from 'react';
import { kycApi } from '../services/api';

function KycForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    nid: '',
    occupation: ''
  });
  const [status, setStatus] = useState({ type: '', message: '', summary: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.length < 2 ? 'Name must be at least 2 characters' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email address' : '';
      case 'nid':
        return value && value.length < 5 ? 'NID must be at least 5 characters' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Real-time validation
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '', summary: '' });

    // Final validation
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await kycApi.submit(formData);
      setStatus({ 
        type: 'success', 
        message: 'KYC submitted successfully! ✨', 
        summary: response.data.summary || 'AI summary generated.'
      });
      setFormData({ name: '', email: '', address: '', nid: '', occupation: '' });
      setErrors({});
      
      // Auto-hide success message after 10 seconds
      setTimeout(() => {
        setStatus({ type: '', message: '', summary: '' });
      }, 10000);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to submit KYC. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
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

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 transform transition-all duration-300 hover:shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="transform transition-all duration-200 hover:scale-[1.01]">
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="name">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField('')}
                  required
                  className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-200 outline-none ${
                    errors.name 
                      ? 'border-red-400 bg-red-50' 
                      : focusedField === 'name'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {formData.name && !errors.name && (
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 animate-shake">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="transform transition-all duration-200 hover:scale-[1.01]">
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  required
                  className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-200 outline-none ${
                    errors.email 
                      ? 'border-red-400 bg-red-50' 
                      : focusedField === 'email'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="john.doe@example.com"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {formData.email && !errors.email && (
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 animate-shake">{errors.email}</p>
              )}
            </div>

            {/* Address Field */}
            <div className="transform transition-all duration-200 hover:scale-[1.01]">
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="address">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onFocus={() => setFocusedField('address')}
                onBlur={() => setFocusedField('')}
                rows="3"
                className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-200 outline-none resize-none ${
                  focusedField === 'address'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="123 Main Street, City, Country"
              />
            </div>

            {/* Two Column Layout for NID and Occupation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NID Field */}
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="nid">
                  National ID
                </label>
                <input
                  type="text"
                  id="nid"
                  name="nid"
                  value={formData.nid}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('nid')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-200 outline-none ${
                    errors.nid 
                      ? 'border-red-400 bg-red-50' 
                      : focusedField === 'nid'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="NID-123456"
                />
                {errors.nid && (
                  <p className="mt-2 text-sm text-red-600 animate-shake">{errors.nid}</p>
                )}
              </div>

              {/* Occupation Field */}
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="occupation">
                  Occupation
                </label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('occupation')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-200 outline-none ${
                    focusedField === 'occupation'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            {/* Status Messages */}
            {status.message && (
              <div className={`p-6 rounded-2xl animate-slide-in ${
                status.type === 'success' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {status.type === 'success' ? (
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
                      status.type === 'success' ? 'text-green-800' : 'text-red-800'
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
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 px-8 rounded-xl font-bold text-lg text-white shadow-xl transform transition-all duration-200 ${
                loading
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
                <span className="flex items-center justify-center">
                  Submit KYC
                  <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Security Badge */}
          <div className="mt-8 flex items-center justify-center text-sm text-gray-500">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Secure & Encrypted | AI-Powered Verification
          </div>
        </div>
      </div>
    </div>
  );
}

export default KycForm;
