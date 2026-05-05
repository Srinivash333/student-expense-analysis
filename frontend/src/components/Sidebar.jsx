import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, TrendingUp, Lightbulb, Wallet } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Upload Data', icon: <UploadCloud size={20} />, path: '/upload' },
    { name: 'Predictions', icon: <TrendingUp size={20} />, path: '/predictions' },
    { name: 'Recommendations', icon: <Lightbulb size={20} />, path: '/recommendations' },
  ];

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100 flex flex-col shadow-sm">
      <div className="h-20 flex items-center px-8 border-b border-gray-100">
        <div className="flex items-center gap-3 text-brand-600">
          <Wallet size={28} className="text-brand-500" />
          <span className="text-xl font-bold tracking-tight">FinSight</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive 
                  ? 'bg-brand-50 text-brand-600 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-brand-50 to-blue-50 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-gray-800">Student Plan</p>
          <p className="text-xs text-gray-500 mt-1">Free Tier</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
