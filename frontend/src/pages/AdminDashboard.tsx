import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch KYC applications
      const kycResponse = await axios.get('http://localhost:5000/api/kyc', { headers });
      if (kycResponse.data.success) {
        const applications = kycResponse.data.data.kycs || [];
        setKycApplications(applications);
        setFilteredApplications(applications);
      }

      // Fetch statistics
      const statsResponse = await axios.get('http://localhost:5000/api/kyc/statistics', { headers });
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
      showNotification('error', error.response?.data?.message || 'Failed to fetch data');
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    navigate('/admin');
  };

  const filterApplications = (status: string) => {
    setActiveFilter(status);
    if (status === 'all') {
      setFilteredApplications(kycApplications);
    } else {
      setFilteredApplications(kycApplications.filter(app => app.status === status));
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const app = kycApplications.find(a => a._id === id);
    if (!app) return;

    const statusText = newStatus.replace('_', ' ').toUpperCase();
    const confirmMessage = `Are you sure you want to change "${app.name}"'s application status to ${statusText}?`;
    
    if (!globalThis.confirm(confirmMessage)) {
      return;
    }

    setUpdatingStatus(id);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5000/api/kyc/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
      showNotification('error', error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const viewDetails = (app: KycApplication) => {
    setSelectedApplication(app);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedApplication(null);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300';
      case 'rejected':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300';
      case 'under_review':
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
        <div className="text-center animate-fade-in-up">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-30 animate-pulse-slow"></div>
            <div className="relative w-20 h-20 border-4 border-transparent border-t-blue-600 border-r-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-bold gradient-text">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  const getNotificationClasses = () => {
    if (!notification) return '';
    if (notification.type === 'success') {
      return 'bg-green-50 border-green-500 text-green-800';
    }
    if (notification.type === 'error') {
      return 'bg-red-50 border-red-500 text-red-800';
    }
    return 'bg-blue-50 border-blue-500 text-blue-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl border-2 animate-fade-in-down ${getNotificationClasses()}`}>
          <div className="flex items-center space-x-3">
            {notification.type === 'success' && (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {notification.type === 'error' && (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <p className="font-semibold">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="ml-4 hover:opacity-70">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative glass border-b border-gray-200/50 shadow-soft animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold gradient-text mb-2">Admin Dashboard</h1>
              <p className="text-base text-gray-600 font-medium">Welcome back, <span className="text-blue-600">{adminName}</span>! 👋</p>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Applications */}
          <button
            onClick={() => filterApplications('all')}
            className={`glass rounded-2xl shadow-soft p-6 border transform transition-all duration-300 hover:scale-105 hover:shadow-lg card-hover animate-fade-in-up text-left ${
              activeFilter === 'all' ? 'ring-2 ring-blue-500 ring-offset-2' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Total</p>
                <p className="text-4xl font-extrabold gradient-text">{statistics.total}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 font-medium">Applications received</p>
          </button>

          {/* Pending */}
          <button
            onClick={() => filterApplications('pending')}
            className={`glass rounded-2xl shadow-soft p-6 border transform transition-all duration-300 hover:scale-105 hover:shadow-lg card-hover animate-fade-in-up text-left ${
              activeFilter === 'pending' ? 'ring-2 ring-yellow-500 ring-offset-2' : ''
            }`}
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Pending</p>
                <p className="text-4xl font-extrabold text-yellow-600">{statistics.pending}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 font-medium">Awaiting review</p>
          </button>

          {/* Approved */}
          <button
            onClick={() => filterApplications('approved')}
            className={`glass rounded-2xl shadow-soft p-6 border transform transition-all duration-300 hover:scale-105 hover:shadow-lg card-hover animate-fade-in-up text-left ${
              activeFilter === 'approved' ? 'ring-2 ring-green-500 ring-offset-2' : ''
            }`}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Approved</p>
                <p className="text-4xl font-extrabold text-green-600">{statistics.approved}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 font-medium">Successfully verified</p>
          </button>

          {/* Rejected */}
          <button
            onClick={() => filterApplications('rejected')}
            className={`glass rounded-2xl shadow-soft p-6 border transform transition-all duration-300 hover:scale-105 hover:shadow-lg card-hover animate-fade-in-up text-left ${
              activeFilter === 'rejected' ? 'ring-2 ring-red-500 ring-offset-2' : ''
            }`}
            style={{ animationDelay: '0.3s' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Rejected</p>
                <p className="text-4xl font-extrabold text-red-600">{statistics.rejected}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 font-medium">Failed verification</p>
          </button>
        </div>

        {/* KYC Applications Table */}
        <div className="glass rounded-2xl shadow-soft overflow-hidden border animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">KYC Applications</h2>
                  {activeFilter !== 'all' && (
                    <p className="text-sm text-gray-600 font-medium mt-0.5">
                      Showing: <span className="capitalize text-blue-600">{activeFilter.replace('_', ' ')}</span>
                    </p>
                  )}
                </div>
              </div>
              <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 text-sm font-bold text-gray-700 shadow-sm">
                {filteredApplications.length} {activeFilter === 'all' ? 'Total' : 'Filtered'}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-gray-600">
                  {activeFilter === 'all' ? 'No KYC applications yet' : `No ${activeFilter.replace('_', ' ')} applications`}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {activeFilter === 'all' ? 'Applications will appear here once submitted' : 'Try selecting a different filter'}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200/50">
                <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">NID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200/50">
                  {filteredApplications.map((app, index) => (
                    <tr key={app._id} className="hover:bg-blue-50/50 transition-colors duration-200 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md mr-3">
                            {app.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{app.name}</div>
                            {app.occupation && <div className="text-xs text-gray-500 font-medium">{app.occupation}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 font-medium">{app.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 font-medium">{app.nid || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-xl shadow-sm ${getStatusBadgeColor(app.status)}`}>
                          {app.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 font-medium">
                          {new Date(app.submittedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewDetails(app)}
                            className="w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg"
                            title="View Details"
                            disabled={updatingStatus === app._id}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => updateStatus(app._id, 'approved')}
                            className={`w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                              updatingStatus === app._id ? 'animate-pulse' : ''
                            }`}
                            title="Approve"
                            disabled={updatingStatus === app._id || app.status === 'approved'}
                          >
                            {updatingStatus === app._id ? (
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => updateStatus(app._id, 'rejected')}
                            className={`w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                              updatingStatus === app._id ? 'animate-pulse' : ''
                            }`}
                            title="Reject"
                            disabled={updatingStatus === app._id || app.status === 'rejected'}
                          >
                            {updatingStatus === app._id ? (
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => updateStatus(app._id, 'under_review')}
                            className={`w-9 h-9 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                              updatingStatus === app._id ? 'animate-pulse' : ''
                            }`}
                            title="Under Review"
                            disabled={updatingStatus === app._id || app.status === 'under_review'}
                          >
                            {updatingStatus === app._id ? (
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
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

        {/* Back to Home Link */}
        <div className="mt-10 text-center animate-fade-in">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 shadow-soft hover:shadow-md font-semibold text-gray-700 hover:text-blue-600 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to KYC Form</span>
          </Link>
        </div>
      </main>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200 animate-scale-in">
            <div className="sticky top-0 glass px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-md z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-extrabold gradient-text">Application Details</h3>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 inline-flex text-sm font-bold rounded-xl shadow-md ${getStatusBadgeColor(selectedApplication.status)}`}>
                  {selectedApplication.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  ID: {selectedApplication._id.substring(0, 8)}...
                </span>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 border-b pb-2">Personal Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-600">Name</p>
                    <p className="text-base font-bold text-gray-900">{selectedApplication.name}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-600">Email</p>
                    <p className="text-base font-medium text-gray-900">{selectedApplication.email}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-600">National ID</p>
                    <p className="text-base font-medium text-gray-900">{selectedApplication.nid || 'N/A'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-600">Occupation</p>
                    <p className="text-base font-medium text-gray-900">{selectedApplication.occupation || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-600">Address</p>
                  <p className="text-base font-medium text-gray-900">{selectedApplication.address || 'N/A'}</p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 border-b pb-2">Timeline</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Submitted</p>
                      <p className="text-base font-medium text-gray-900">
                        {new Date(selectedApplication.submittedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {selectedApplication.reviewedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600">Last Reviewed</p>
                        <p className="text-base font-medium text-gray-900">
                          {new Date(selectedApplication.reviewedAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Summary */}
              {selectedApplication.aiSummary && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-lg font-bold text-gray-900">AI Summary</h4>
                    <button
                      onClick={async () => {
                        if (!globalThis.confirm('Regenerate AI summary for this application?')) return;
                        try {
                          const token = localStorage.getItem('token');
                          const response = await axios.post(
                            `http://localhost:5000/api/kyc/${selectedApplication._id}/regenerate-summary`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          if (response.data.success) {
                            showNotification('success', 'AI summary regenerated successfully!');
                            closeModal();
                            await fetchData();
                          }
                        } catch (error: any) {
                          showNotification('error', error.response?.data?.message || 'Failed to regenerate summary');
                        }
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 font-semibold shadow-md"
                    >
                      🔄 Regenerate
                    </button>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedApplication.aiSummary}</p>
                  </div>
                </div>
              )}

              {/* Review Notes */}
              {selectedApplication.reviewNotes && (
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-gray-900 border-b pb-2">Review Notes</h4>
                  <div className="bg-yellow-50/50 rounded-xl p-4 border border-yellow-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedApplication.reviewNotes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    updateStatus(selectedApplication._id, 'approved');
                    closeModal();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-md font-semibold"
                  disabled={selectedApplication.status === 'approved'}
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    updateStatus(selectedApplication._id, 'rejected');
                    closeModal();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 transform hover:scale-105 shadow-md font-semibold"
                  disabled={selectedApplication.status === 'rejected'}
                >
                  Reject
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
