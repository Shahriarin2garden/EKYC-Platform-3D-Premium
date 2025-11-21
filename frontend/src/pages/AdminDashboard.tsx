import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PdfButton from '../components/common/PdfButton';

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
  }, [showNotification]);

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
  }, [kycApplications, showNotification, activeFilter, filterApplications, fetchData]);

  const viewDetails = useCallback((app: KycApplication) => {
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
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg border flex items-center space-x-3 ${
          notification.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
          notification.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
          'bg-blue-500/10 border-blue-500/20 text-blue-400'
        }`}>
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
        <div className="card-3d overflow-hidden">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewDetails(app)}
                            className="p-2 text-brand-white/70 hover:text-brand-white hover:bg-brand-white/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.206 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          <div className="h-4 w-px bg-brand-gray/30 mx-1"></div>

                          <PdfButton
                            kycId={app._id}
                            onSuccess={() => showNotification('success', 'PDF generated')}
                            onError={(error) => showNotification('error', error)}
                          />

                          <div className="h-4 w-px bg-brand-gray/30 mx-1"></div>

                          <button
                            onClick={() => updateStatus(app._id, 'approved')}
                            disabled={updatingStatus === app._id || app.status === 'approved'}
                            className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg disabled:opacity-30 transition-colors"
                            title="Approve"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => updateStatus(app._id, 'rejected')}
                            disabled={updatingStatus === app._id || app.status === 'rejected'}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg disabled:opacity-30 transition-colors"
                            title="Reject"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-brand-gray/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm px-6 py-4 border-b border-gray-200 dark:border-brand-gray/20 flex justify-between items-center z-10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-brand-white">Application Details</h3>
              <button onClick={closeModal} className="text-brand-white/50 hover:text-brand-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 inline-flex text-sm font-bold rounded-full border ${getStatusBadgeColor(selectedApplication.status)}`}>
                  {selectedApplication.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs font-mono text-brand-white/30">ID: {selectedApplication._id}</span>
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-white/50 mb-4 border-b border-brand-gray/20 pb-2">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Full Name', value: selectedApplication.name },
                    { label: 'Email Address', value: selectedApplication.email },
                    { label: 'National ID', value: selectedApplication.nid || 'N/A' },
                    { label: 'Occupation', value: selectedApplication.occupation || 'N/A' },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-brand-white/50 mb-1">{item.label}</p>
                      <p className="text-sm font-medium text-brand-white">{item.value}</p>
                    </div>
                  ))}
                  <div className="col-span-full">
                    <p className="text-xs text-brand-white/50 mb-1">Address</p>
                    <p className="text-sm font-medium text-brand-white">{selectedApplication.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              {selectedApplication.aiSummary && (
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-brand-gray/20 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-white/50">AI Analysis</h4>
                    <button
                      onClick={async () => {
                        if (!globalThis.confirm('Regenerate AI summary?')) return;
                        try {
                          const token = localStorage.getItem('token');
                          const response = await axios.post(
                            `http://localhost:5000/api/kyc/${selectedApplication._id}/regenerate-summary`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          if (response.data.success) {
                            showNotification('success', 'Summary regenerated');
                            closeModal();
                            await fetchData();
                          }
                        } catch (error: any) {
                          showNotification('error', 'Failed to regenerate');
                        }
                      }}
                      className="text-xs text-brand-accent hover:text-brand-white transition-colors"
                    >
                      Regenerate
                    </button>
                  </div>
                  <div className="bg-brand-white/5 rounded-lg p-4 border border-brand-white/10">
                    <p className="text-sm leading-relaxed text-brand-white/80">{selectedApplication.aiSummary}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-gray/20">
                <button
                  onClick={() => {
                    updateStatus(selectedApplication._id, 'approved');
                    closeModal();
                  }}
                  disabled={selectedApplication.status === 'approved'}
                  className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 disabled:opacity-30 transition-colors text-sm font-bold"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    updateStatus(selectedApplication._id, 'rejected');
                    closeModal();
                  }}
                  disabled={selectedApplication.status === 'rejected'}
                  className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 disabled:opacity-30 transition-colors text-sm font-bold"
                >
                  Reject
                </button>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-brand-white/5 text-brand-white border border-brand-white/10 rounded-lg hover:bg-brand-white/10 transition-colors text-sm font-bold"
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
