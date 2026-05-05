import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UploadData from './pages/UploadData';
import Predictions from './pages/Predictions';
import Recommendations from './pages/Recommendations';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-blue-50 opacity-50 pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<UploadData />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/recommendations" element={<Recommendations />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
