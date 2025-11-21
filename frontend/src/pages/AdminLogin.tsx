import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../services/api';
import { AdminCredentials } from '../types';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AdminCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await adminApi.login(formData);

      if (response.data.success) {
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('adminEmail', formData.email);
          localStorage.setItem('adminName', response.data.data.admin?.name || 'Admin');
        }

        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="h-16 w-16 bg-brand-white rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-brand-white mb-2">Admin Portal</h2>
          <p className="text-sm text-brand-white/60">Sign in to access your dashboard</p>
        </div>

        {/* Form Card */}
        <div className="card-glass p-8 hover:scale-102 transition-transform duration-500">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="group">
                <label htmlFor="email" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                  Email Address <span className="text-blue-500 dark:text-brand-accent">*</span>
                </label>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full bg-gray-50 dark:bg-brand-black border border-gray-300 dark:border-brand-gray/50 rounded-lg px-4 py-3 text-gray-900 dark:text-brand-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-brand-accent focus:ring-1 focus:ring-blue-500 dark:focus:ring-brand-accent transition-all duration-200" 
                  placeholder="admin@example.com" 
                />
              </div>

              <div className="group">
                <label htmlFor="password" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                  Password <span className="text-blue-500 dark:text-brand-accent">*</span>
                </label>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="w-full bg-gray-50 dark:bg-brand-black border border-gray-300 dark:border-brand-gray/50 rounded-lg px-4 py-3 text-gray-900 dark:text-brand-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-brand-accent focus:ring-1 focus:ring-blue-500 dark:focus:ring-brand-accent transition-all duration-200" 
                  placeholder="Enter your password" 
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-green-400">{success}</p>
                </div>
              </div>
            )}

            <div className="relative group">
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-sm font-bold uppercase tracking-wider rounded-full text-brand-black bg-brand-white hover:bg-brand-accent hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            <div className="text-center space-y-3 pt-4">
              <p className="text-sm text-brand-white/60">
                Don't have an account? <Link to="/admin/register" className="font-bold text-brand-white hover:text-brand-accent transition-colors">Register here</Link>
              </p>
              <p className="text-sm">
                <Link to="/" className="text-brand-white/40 hover:text-brand-white transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to KYC Form
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
