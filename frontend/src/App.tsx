import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import KycForm from './pages/KycForm';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import ThemeToggle from './components/common/ThemeToggle';
import Background3D from './components/common/Background3D';

const Navigation: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/admin/dashboard';

  if (isDashboard) {
    return null; // Dashboard has its own header
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-brand-darker/80 backdrop-blur-2xl border-b border-gray-200/50 dark:border-brand-white/5 shadow-xl dark:shadow-glow/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo with 3D effect */}
          <Link to="/" className="flex items-center space-x-4 group perspective-container">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-accent to-purple-500 rounded-2xl blur-lg opacity-0 dark:opacity-60 group-hover:opacity-100 dark:group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-brand-white dark:to-gray-100 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl dark:shadow-glow transform-gpu">
                <svg className="w-8 h-8 text-white dark:text-brand-black transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-6deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-brand-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 dark:group-hover:from-brand-accent dark:group-hover:to-purple-500 transition-all duration-500">EKYC</span>
              <span className="text-xs font-medium text-gray-500 dark:text-brand-white/50 tracking-widest uppercase">Platform</span>
            </div>
          </Link>

          {/* Navigation Links with 3D button */}
          <div className="flex items-center space-x-6">
            {location.pathname !== '/admin' && location.pathname !== '/admin/register' && (
              <Link 
                to="/admin" 
                className="relative group px-6 py-3 font-bold text-sm text-gray-700 dark:text-brand-white/80 transition-all duration-500 overflow-hidden rounded-2xl hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-brand-white/10 dark:to-brand-white/5 transition-all duration-500 group-hover:scale-110"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 dark:from-brand-accent/0 dark:via-purple-500/0 dark:to-brand-accent/0 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-blue-500/20 dark:group-hover:from-brand-accent/20 dark:group-hover:via-purple-500/20 dark:group-hover:to-brand-accent/20 transition-all duration-500"></span>
                <span className="relative flex items-center space-x-2">
                  <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Admin Portal</span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-brand-black text-gray-900 dark:text-brand-white selection:bg-blue-500 dark:selection:bg-brand-accent selection:text-white relative">
        {/* 3D Background */}
        <Background3D />
        
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Navigation Header */}
        <Navigation />

        {/* Routes */}
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<KycForm />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
