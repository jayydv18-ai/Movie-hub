import React, { useState } from 'react';
import { ShieldAlert, Lock, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminLayout, AdminTab } from '../components/admin/AdminLayout';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { MovieManager } from '../components/admin/MovieManager';
import { SeriesManager } from '../components/admin/SeriesManager';
import { CategoryManager } from '../components/admin/CategoryManager';
import { BannerManager } from '../components/admin/BannerManager';
import { UserManager } from '../components/admin/UserManager';

interface AdminPageProps {
  onExitToApp: () => void;
  onOpenAuth: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onExitToApp, onOpenAuth }) => {
  const { user, isAdmin, login } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [openAddMovie, setOpenAddMovie] = useState(false);
  const [openAddSeries, setOpenAddSeries] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  // If not logged in as admin, show secure access screen with 1-click admin login
  if (!user || !isAdmin) {
    const handleQuickAdminLogin = async () => {
      setQuickLoginLoading(true);
      try {
        await login('admin@moviehub.com', 'Admin@12345');
      } catch (err) {
        console.error('Quick admin login failed', err);
      } finally {
        setQuickLoginLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950 border border-indigo-700/60 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-950/80">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Admin Access Required
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Movie Hub management console is restricted to verified administrative users.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-2">
            <p className="text-xs font-semibold text-slate-300">Default Admin Credentials:</p>
            <div className="text-[11px] font-mono text-slate-400 space-y-1">
              <p>Email: <span className="text-cyan-400">admin@moviehub.com</span></p>
              <p>Password: <span className="text-cyan-400">Admin@12345</span></p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              id="admin-one-click-login-btn"
              onClick={handleQuickAdminLogin}
              disabled={quickLoginLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 transition duration-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>{quickLoginLoading ? 'Authenticating...' : '1-Click Master Admin Login'}</span>
            </button>

            <button
              onClick={onExitToApp}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Return to Movie Hub Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleOpenAddMovie = () => {
    setActiveTab('movies');
    setOpenAddMovie(true);
  };

  const handleOpenAddSeries = () => {
    setActiveTab('series');
    setOpenAddSeries(true);
  };

  return (
    <AdminLayout activeTab={activeTab} onSelectTab={setActiveTab} onExitToApp={onExitToApp}>
      {activeTab === 'dashboard' && (
        <AdminDashboard
          onNavigateTab={setActiveTab}
          onOpenAddMovie={handleOpenAddMovie}
          onOpenAddSeries={handleOpenAddSeries}
        />
      )}

      {activeTab === 'movies' && (
        <MovieManager
          initialOpenAdd={openAddMovie}
          onCloseAdd={() => setOpenAddMovie(false)}
        />
      )}

      {activeTab === 'series' && (
        <SeriesManager
          initialOpenAdd={openAddSeries}
          onCloseAdd={() => setOpenAddSeries(false)}
        />
      )}

      {activeTab === 'categories' && <CategoryManager />}

      {activeTab === 'banners' && <BannerManager />}

      {activeTab === 'users' && <UserManager />}
    </AdminLayout>
  );
};
