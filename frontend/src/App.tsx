import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KycForm from './pages/KycForm';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white shadow-2xl sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-center items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    E
                  </span>
                </div>
                <span className="text-2xl font-bold tracking-tight">EKYC Theme System</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<KycForm />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
