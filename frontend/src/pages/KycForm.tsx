import React, { useState, useEffect, useRef } from 'react';
import { kycApi } from '../services/api';
import { KycFormData, ValidationErrors, FormStatus } from '../types';
import { 
  InputField, 
  TextAreaField, 
  FormHeader, 
  FormStatus as FormStatusComponent,
  SubmitButton,
  SecurityBadge 
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <FormHeader />

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 transform transition-all duration-300 hover:shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Security Badge */}
          <SecurityBadge />
        </div>
      </div>
    </div>
  );
}

export default KycForm;
