import React from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth';

export const DashboardPage: React.FC = () => {
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700 transition"
          >
            Logout
          </button>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6 shadow-xl backdrop-blur-sm">
            <h2 className="text-lg font-medium text-slate-300">To do</h2>
            <p className="mt-2 text-3xl font-semibold">0</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6 shadow-xl backdrop-blur-sm">
            <h2 className="text-lg font-medium text-slate-300">Spending</h2>
            <p className="mt-2 text-3xl font-semibold">$0.00</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6 shadow-xl backdrop-blur-sm">
            <h2 className="text-lg font-medium text-slate-300">Portfolio</h2>
            <p className="mt-2 text-3xl font-semibold">$0.00</p>
          </div>
        </div>
      </div>
    </div>
  );
};
