import React, { useState, useEffect, useRef } from 'react';
import { kycApi } from '../services/api';
import { KycFormData, ValidationErrors, FormStatus } from '../types';
import { 
  InputField, 
  TextAreaField, 
  FormStatus as FormStatusComponent,
  SubmitButton
} from '../components';

function KycForm(): JSX.Element {
  const [formData, setFormData] = useState<KycFormData>({
    name: '',
    email: '',
    address: '',
    nid: '',
    occupation: ''
  });
  const [status, setStatus] = useState<FormStatus>({ type: '', message: '', summary: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [focusedField, setFocusedField] = useState<string>('');

  // Autosave draft to localStorage to avoid data loss
  const draftKey = 'kyc-form-draft';
  const saveTimeout = useRef<number | null>(null);

  const validateField = (name: keyof KycFormData, value: string): string => {
    switch (name) {
      case 'name':
        return value.length < 2 ? 'Name must be at least 2 characters' : '';
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Invalid email address';
      }
      case 'nid':
        return value && value.length < 5 ? 'NID must be at least 5 characters' : '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement;
    const nameKey = name as keyof KycFormData;
    setFormData({ ...formData, [nameKey]: value } as KycFormData);
    
    // Real-time validation
    const error = validateField(nameKey, value);
    setErrors({ ...errors, [String(nameKey)]: error });
  };

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<KycFormData>;
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch (err) {
      console.warn('Failed to load draft from localStorage:', err);
    }
  }, []);

  // Save draft with debounce
  useEffect(() => {
    if (saveTimeout.current) {
      globalThis.clearTimeout(saveTimeout.current);
    }
    // Save after a short debounce
    saveTimeout.current = globalThis.setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(formData));
      } catch (err) {
        console.warn('Failed to save draft to localStorage:', err);
      }
    }, 700) as unknown as number;
    return () => {
      if (saveTimeout.current) globalThis.clearTimeout(saveTimeout.current);
    };
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '', summary: '' });

    // Final validation
    const newErrors: ValidationErrors = {};
    const formKeys = Object.keys(formData) as (keyof KycFormData)[];
    for (const key of formKeys) {
      const error = validateField(key, String(formData[key] ?? ''));
      if (error) {
        newErrors[String(key)] = error;
      }
    }

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
      // Clear saved draft on success
      try {
        localStorage.removeItem(draftKey);
      } catch (err) {
        console.warn('Failed to clear draft from localStorage:', err);
      }
      // Auto-hide success message after 10 seconds
      setTimeout(() => {
        setStatus({ type: '', message: '', summary: '' });
      }, 10000);
    } catch (err: any) {
      console.error('Submission error:', err);
      setStatus({ 
        type: 'error', 
        message: err?.response?.data?.message || 'Failed to submit KYC. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="mb-12 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-brand-accent dark:to-purple-500 rounded-3xl blur-2xl opacity-20 dark:opacity-40 animate-pulse"></div>
            <h1 className="relative text-5xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-brand-white bg-clip-text">
              KYC Verification
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-brand-white/60 font-medium max-w-2xl mx-auto">
            Complete your identity verification with enterprise-grade security
          </p>
        </div>

        {/* Form Card with Premium 3D Design */}
        <div className="card-3d p-10 md:p-14">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name Field */}
            <InputField
              label="Full Name"
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField('')}
              placeholder="John Doe"
              required
              error={errors.name}
              isFocused={focusedField === 'name'}
              showSuccessIcon
            />

            {/* Email Field */}
            <InputField
              label="Email Address"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              placeholder="john.doe@example.com"
              required
              error={errors.email}
              isFocused={focusedField === 'email'}
              showSuccessIcon
            />

            {/* Address Field */}
            <TextAreaField
              label="Address"
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              onFocus={() => setFocusedField('address')}
              onBlur={() => setFocusedField('')}
              placeholder="123 Main Street, City, Country"
              rows={3}
              isFocused={focusedField === 'address'}
            />

            {/* Two Column Layout for NID and Occupation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NID Field */}
              <InputField
                label="National ID"
                id="nid"
                name="nid"
                type="text"
                value={formData.nid || ''}
                onChange={handleChange}
                onFocus={() => setFocusedField('nid')}
                onBlur={() => setFocusedField('')}
                placeholder="NID-123456"
                error={errors.nid}
                isFocused={focusedField === 'nid'}
              />

              {/* Occupation Field */}
              <InputField
                label="Occupation"
                id="occupation"
                name="occupation"
                type="text"
                value={formData.occupation || ''}
                onChange={handleChange}
                onFocus={() => setFocusedField('occupation')}
                onBlur={() => setFocusedField('')}
                placeholder="Software Engineer"
                isFocused={focusedField === 'occupation'}
              />
            </div>

            {/* Status Messages */}
            <FormStatusComponent status={status} />

            {/* Submit Button */}
            <SubmitButton loading={loading} />
          </form>

          {/* Enhanced Security Badge */}
          <div className="mt-12 pt-10 border-t border-gray-200 dark:border-brand-white/10">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl blur-xl opacity-0 dark:opacity-30 group-hover:opacity-40 dark:group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative flex items-center justify-center gap-5 px-8 py-6 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-brand-white/5 dark:to-brand-white/10 backdrop-blur-xl border border-gray-200 dark:border-brand-white/10">
                <div className="relative group-hover:scale-110 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                  <svg className="relative w-8 h-8 text-gray-700 dark:text-brand-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-base text-gray-900 dark:text-brand-white tracking-tight">256-bit Military Encryption</span>
                  <span className="text-sm text-gray-600 dark:text-brand-white/60 font-medium">Enterprise-grade security protecting your data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KycForm;
