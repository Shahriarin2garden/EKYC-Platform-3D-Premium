import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PdfButton from '../components/common/PdfButton';

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface KycApplication {
  _id: string;
  name: string;
  email: string;
  address?: string;
  nid?: string;
  occupation?: string;
  status: string;
  submittedAt: string;
  updatedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  aiSummary?: string;
}

interface Statistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  under_review: number;
}

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [kycApplications, setKycApplications] = useState<KycApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<KycApplication[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    under_review: 0,
  });
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('Admin');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<KycApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        navigate('/admin');
        return;
      }

      console.log('Fetching KYC data...');

      // Fetch KYC applications using axios directly with proper endpoint
      const kycResponse = await axios.get(`${API_URL}/kyc`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('KYC Response:', kycResponse.data);
      
      if (kycResponse.data.success) {
        const applications = kycResponse.data.data.kycs || [];
        console.log('Applications loaded:', applications.length);
        setKycApplications(applications);
        setFilteredApplications(applications);
      }

      // Fetch statistics
      const statsResponse = await axios.get(`${API_URL}/kyc/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Stats Response:', statsResponse.data);
      
      if (statsResponse.data.success) {
        const statsData = statsResponse.data.data.statusBreakdown || {};
        setStatistics({
          total: statsResponse.data.data.total || 0,
          pending: statsData.pending || 0,
          approved: statsData.approved || 0,
          rejected: statsData.rejected || 0,
          under_review: statsData.under_review || 0,
        });
      }

      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        showNotification('error', 'Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/admin');
      } else {
        showNotification('error', error.response?.data?.message || 'Failed to fetch data');
      }
      setLoading(false);
    }
  }, [showNotification, navigate]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
      return;
    }

    // Get admin name
    const name = localStorage.getItem('adminName');
    if (name) {
      setAdminName(name);
    }

    // Fetch data
    fetchData();
  }, [navigate, fetchData]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    navigate('/admin');
  }, [navigate]);

  const filterApplications = useCallback((status: string) => {
    setActiveFilter(status);
    if (status === 'all') {
      setFilteredApplications(kycApplications);
    } else {
      setFilteredApplications(kycApplications.filter(app => app.status === status));
    }
  }, [kycApplications]);

  const updateStatus = useCallback(async (id: string, newStatus: string) => {
    const app = kycApplications.find(a => a._id === id);
    if (!app) {
      console.error('Application not found:', id);
      showNotification('error', 'Application not found');
      return;
    }

    const statusText = newStatus.replace('_', ' ').toUpperCase();
    const confirmMessage = `Are you sure you want to change "${app.name}"'s application status to ${statusText}?`;
    
    if (!globalThis.confirm(confirmMessage)) {
      return;
    }

    setUpdatingStatus(id);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('error', 'Please login again');
        navigate('/admin');
        return;
      }

      console.log('Updating status for:', id, 'to:', newStatus);
      
      const response = await axios.patch(
        `${API_URL}/kyc/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Status update response:', response.data);

      if (response.data.success) {
        showNotification('success', `Application ${statusText} successfully!`);
        // Refresh data
        await fetchData();
        // Re-apply current filter
        if (activeFilter !== 'all') {
          filterApplications(activeFilter);
        }
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      console.error('Error response:', error.response?.data);
      showNotification('error', error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  }, [kycApplications, showNotification, activeFilter, filterApplications, fetchData, navigate]);

  const viewDetails = useCallback((app: KycApplication) => {
    console.log('Viewing details for:', app._id, app.name);
    setSelectedApplication(app);
    setShowDetailsModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedApplication(null);
  }, []);

  const getStatusBadgeColor = useCallback((status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'under_review':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }, []);

  const getNotificationClass = useCallback((type: string) => {
    const baseClass = 'fixed top-4 right-4 z-50 px-6 py-4 rounded-lg border flex items-center space-x-3';
    switch (type) {
      case 'success':
        return `${baseClass} bg-green-500/10 border-green-500/20 text-green-400`;
      case 'error':
        return `${baseClass} bg-red-500/10 border-red-500/20 text-red-400`;
      default:
        return `${baseClass} bg-blue-500/10 border-blue-500/20 text-blue-400`;
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 dark:border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-brand-white/60 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-brand-white font-sans">
      {/* Notification Toast */}
      {notification && (
        <div className={getNotificationClass(notification.type)}>
          <p className="font-medium">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="hover:opacity-70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-brand-gray/20 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-brand-white/5 rounded-lg flex items-center justify-center border border-brand-white/10">
                <svg className="w-6 h-6 text-brand-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-brand-white">Admin Dashboard</h1>
                <p className="text-xs text-brand-white/50">Welcome back, {adminName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full border border-brand-gray/30 text-sm font-medium text-brand-white/70 hover:text-brand-white hover:border-brand-white/50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applications', value: statistics.total, filter: 'all', color: 'text-gray-900 dark:text-brand-white' },
            { label: 'Pending Review', value: statistics.pending, filter: 'pending', color: 'text-yellow-600 dark:text-yellow-400' },
            { label: 'Approved', value: statistics.approved, filter: 'approved', color: 'text-green-600 dark:text-green-400' },
            { label: 'Rejected', value: statistics.rejected, filter: 'rejected', color: 'text-red-600 dark:text-red-400' },
          ].map((stat) => (
            <button
              key={stat.filter}
              onClick={() => filterApplications(stat.filter)}
              className={`card-3d p-6 text-left transition-all duration-500 hover:border-blue-300 dark:hover:border-brand-white/30 ${
                activeFilter === stat.filter ? 'border-blue-500 dark:border-brand-accent ring-2 ring-blue-500/50 dark:ring-brand-accent/50 scale-105' : ''
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-brand-white/50 mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </button>
          ))}
        </div>

        {/* KYC Applications Table */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-brand-dark/95 dark:to-brand-darker/95 border border-gray-200 dark:border-brand-gray/20 rounded-3xl transition-all duration-700 hover:border-blue-300 dark:hover:border-brand-accent/40 dark:shadow-3d dark:hover:shadow-3d-hover hover:-translate-y-3 dark:hover:scale-[1.02] relative backdrop-blur-xl">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-brand-gray/20 flex justify-between items-center bg-gradient-to-r from-transparent via-transparent to-blue-500/5 dark:to-brand-accent/5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-brand-white">Applications</h2>
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-brand-white/5 border border-blue-200 dark:border-brand-white/10 text-xs font-medium text-blue-700 dark:text-brand-white/70 shadow-sm dark:shadow-inner-glow">
              {filteredApplications.length} {activeFilter === 'all' ? 'Total' : activeFilter}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-white/5 mb-4">
                  <svg className="h-8 w-8 text-brand-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-brand-white/50">No applications found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-brand-gray/20">
                <thead className="bg-gray-50 dark:bg-brand-white/5">
                  <tr>
                    {['Name', 'Email', 'NID', 'Status', 'Submitted', 'Actions'].map((header) => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-brand-white/50 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-brand-gray/20">
                  {filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50 dark:hover:bg-brand-white/5 transition-all duration-300 hover:shadow-sm dark:hover:shadow-inner-glow">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-xs mr-3">
                            {app.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-brand-white">{app.name}</div>
                            {app.occupation && <div className="text-xs text-brand-white/50">{app.occupation}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-white/70">{app.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-white/70">{app.nid || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeColor(app.status)}`}>
                          {app.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-white/70">
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center space-x-2 relative z-10">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('View Details button clicked for:', app._id);
                              viewDetails(app);
                            }}
                            className="p-2 text-brand-white/70 hover:text-brand-white hover:bg-brand-white/10 rounded-lg transition-colors cursor-pointer relative z-20"
                            title="View Details"
                            type="button"
                            style={{ pointerEvents: 'auto' }}
                          >
                            <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.206 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          <div className="h-4 w-px bg-brand-gray/30 mx-1 pointer-events-none"></div>

                          <div className="relative z-20" style={{ pointerEvents: 'auto' }}>
                            <PdfButton
                              kycId={app._id}
                              onSuccess={() => showNotification('success', 'PDF generated')}
                              onError={(error) => showNotification('error', error)}
                            />
                          </div>

                          <div className="h-4 w-px bg-brand-gray/30 mx-1 pointer-events-none"></div>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Approve button clicked for:', app._id);
                              updateStatus(app._id, 'approved');
                            }}
                            disabled={updatingStatus === app._id || app.status === 'approved'}
                            className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer relative z-20"
                            title="Approve"
                            type="button"
                            style={{ pointerEvents: 'auto' }}
                          >
                            <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Reject button clicked for:', app._id);
                              updateStatus(app._id, 'rejected');
                            }}
                            disabled={updatingStatus === app._id || app.status === 'rejected'}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer relative z-20"
                            title="Reject"
                            type="button"
                            style={{ pointerEvents: 'auto' }}
                          >
                            <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={closeModal}
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeModal();
            }}
            role="none"
          />
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeModal();
            }}
            role="none"
          >
            <dialog 
              open
              className="bg-gradient-to-b dark:from-brand-dark/98 dark:to-brand-darker/98 from-gray-50 to-white border border-gray-200 dark:border-brand-gray/20 rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl animate-scaleIn relative flex flex-col backdrop-blur-xl" 
              aria-labelledby="modal-title"
            >
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 via-transparent to-purple-500/5 dark:from-brand-accent/10 dark:to-purple-500/10 pointer-events-none rounded-3xl"></div>

            {/* Modal Header with enhanced styling */}
            <div className="sticky top-0 bg-gradient-to-r from-white/98 to-gray-50/95 dark:from-brand-dark/98 dark:via-brand-dark/95 dark:to-brand-darker/95 backdrop-blur-xl px-8 py-6 border-b border-gray-200 dark:border-brand-white/5 flex justify-between items-start z-20 relative">
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <h3 id="modal-title" className="text-3xl font-black text-gray-900 dark:text-brand-white tracking-tight">Application Details</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${selectedApplication.status === 'approved' ? 'bg-green-500' : selectedApplication.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                    <span className={`px-4 py-2 inline-flex text-sm font-bold rounded-full border ${getStatusBadgeColor(selectedApplication.status)} shadow-lg`}>
                      {selectedApplication.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-brand-white/50 font-mono flex items-center space-x-2">
                  <span className="text-gray-400 dark:text-brand-white/30">→</span>
                  <span>Reference ID: <span className="text-brand-white/70 font-semibold">{selectedApplication._id.slice(-8)}</span></span>
                </p>
              </div>
              <button 
                onClick={closeModal}
                className="p-2.5 rounded-full bg-gray-200 dark:bg-brand-white/10 text-gray-600 dark:text-brand-white/60 hover:bg-gray-300 dark:hover:bg-brand-white/20 hover:text-gray-900 dark:hover:text-brand-white transition-all duration-300 hover-scale"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
              {/* Left Column: Personal Info */}
              <div className="lg:col-span-2 space-y-8 animate-slideInLeft">
                {/* Profile Header - Enhanced */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-brand-accent/20 dark:to-purple-500/20 rounded-3xl blur-2xl transition-all duration-500 group-hover:opacity-100 opacity-0"></div>
                  <div className="relative flex items-center space-x-6 p-8 bg-gradient-to-br from-white to-gray-50/50 dark:from-brand-white/[0.08] dark:to-brand-white/[0.03] rounded-3xl border border-gray-200/50 dark:border-brand-white/10 backdrop-blur-xl hover-lift">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-75"></div>
                      <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                        {selectedApplication.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-black text-gray-900 dark:text-brand-white mb-2 tracking-tight">{selectedApplication.name}</h4>
                      <p className="text-lg text-gray-600 dark:text-brand-white/70 font-medium mb-3">{selectedApplication.occupation || 'No occupation listed'}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center text-gray-500 dark:text-brand-white/50">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(selectedApplication.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-brand-white/20"></div>
                        <div className="text-gray-500 dark:text-brand-white/50">
                          Submitted on {new Date(selectedApplication.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Info Grid - Enhanced */}
                <div className="space-y-4 animate-fadeInUp delay-100">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-1 h-6 bg-gradient-to-b from-brand-accent to-purple-500 rounded-full"></div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-gray-700 dark:text-brand-white/60">Personal Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Email Address', value: selectedApplication.email, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'from-blue-500 to-cyan-500' },
                      { label: 'National ID', value: selectedApplication.nid || 'N/A', icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .884-.5 2-2 2h4c-1.5 0-2-1.116-2-2z', color: 'from-purple-500 to-pink-500' },
                      { label: 'Address', value: selectedApplication.address || 'N/A', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', color: 'from-green-500 to-emerald-500' },
                      { label: 'Last Updated', value: selectedApplication.updatedAt ? new Date(selectedApplication.updatedAt).toLocaleDateString() : 'N/A', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-orange-500 to-red-500' },
                    ].map((item, index) => (
                      <div key={item.label} className={`group animate-stagger delay-${index * 75}`}>
                        <div className="relative h-full">
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                          <div className="relative h-full p-5 bg-gradient-to-br from-white/80 to-gray-50/50 dark:from-brand-white/[0.08] dark:to-brand-white/[0.02] rounded-2xl border border-gray-200/50 dark:border-brand-white/10 hover-lift backdrop-blur-sm">
                            <div className="flex items-start space-x-3">
                              <div className={`p-3 bg-gradient-to-br ${item.color} rounded-lg text-white shadow-lg flex-shrink-0`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-brand-white/50 mb-1.5">{item.label}</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-brand-white break-all line-clamp-2">{item.value}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: AI & Actions */}
              <div className="space-y-6 animate-slideInRight">
                {/* AI Analysis Card - Premium Design */}
                <div className="group relative h-fit">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 dark:from-brand-accent/30 dark:to-purple-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-br from-purple-50/80 to-blue-50/80 dark:from-purple-900/20 dark:to-blue-900/10 rounded-3xl p-7 border border-purple-200/50 dark:border-brand-white/10 backdrop-blur-xl overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-3xl opacity-10"></div>
                    
                    <div className="flex items-center justify-between mb-5 relative z-10">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 dark:text-brand-white text-lg tracking-tight">AI Analysis</h4>
                          <p className="text-xs text-gray-500 dark:text-brand-white/40">Intelligent Review Summary</p>
                        </div>
                      </div>
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!globalThis.confirm('Regenerate AI summary?')) return;
                          try {
                            const token = localStorage.getItem('token');
                            const response = await axios.post(
                              `${API_URL}/kyc/${selectedApplication._id}/regenerate-summary`,
                              {},
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            if (response.data.success) {
                              showNotification('success', 'Summary regenerated');
                              closeModal();
                              await fetchData();
                            }
                          } catch (error: any) {
                            showNotification('error', error.response?.data?.message || 'Failed to regenerate');
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-purple-600 dark:text-purple-300 bg-purple-100/50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-lg hover:bg-purple-200/50 dark:hover:bg-purple-500/20 transition-all duration-300"
                      >
                        ↻ Regenerate
                      </button>
                    </div>
                    
                    <div className="bg-white/60 dark:bg-brand-white/[0.08] rounded-2xl p-5 border border-white/50 dark:border-brand-white/10 backdrop-blur-sm relative z-10 max-h-60 overflow-y-auto">
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-brand-white/80 font-medium">
                        {selectedApplication.aiSummary || <span className="text-gray-400 dark:text-brand-white/40 italic">No AI summary available for this application.</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Enhanced */}
                <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-brand-white/[0.06] dark:to-brand-white/[0.02] rounded-3xl p-7 border border-gray-200/50 dark:border-brand-white/10 backdrop-blur-xl animate-fadeInUp delay-200">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-1 h-6 bg-gradient-to-b from-brand-accent to-purple-500 rounded-full"></div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-gray-700 dark:text-brand-white/60">Review Actions</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        updateStatus(selectedApplication._id, 'approved');
                        closeModal();
                      }}
                      disabled={selectedApplication.status === 'approved'}
                      className="w-full group relative py-4 px-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover-lift flex items-center justify-center space-x-2 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="relative z-10">Approve Application</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        updateStatus(selectedApplication._id, 'rejected');
                        closeModal();
                      }}
                      disabled={selectedApplication.status === 'rejected'}
                      className="w-full group relative py-4 px-5 bg-white dark:bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover-lift flex items-center justify-center space-x-2 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-red-500/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="relative z-10">Reject Application</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </dialog>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
