import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, ChevronDown, LogOut, Plus, UserCircle2 } from 'lucide-react';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TodoPage } from './pages/TodoPage';
import { SpendingPage } from './pages/SpendingPage';
import { InvestingPage } from './pages/InvestingPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { WeeklySummariesPage } from './pages/WeeklySummariesPage';
import { ImportsPage } from './pages/ImportsPage';
import { MasterConfigPage } from './pages/MasterConfigPage';
import { useAuthStore } from './store/authStore';
import { authService } from './services/auth';
import { onUnauthorized } from './services/api';
import { notificationsService } from './services/notifications';
import { VoiceAgentWidget } from './components/VoiceAgentWidget';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsService.unreadCount(),
    enabled: isAuthenticated && isAuthResolved,
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isAuthResolved) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-300">Checking session...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      clearSession();
      setIsLoggingOut(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-slate-900">
      <nav className="w-64 border-r border-slate-800 bg-slate-900/50 p-6">
        <h1 className="mb-8 text-2xl font-bold text-white tracking-tight">Lifestack</h1>
        <ul className="space-y-4 text-slate-400">
          <li>
            <Link to="/" data-testid="nav-dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </li>
          <li>
            <Link to="/todo" data-testid="nav-todo" className="hover:text-white transition-colors">Todos</Link>
          </li>
          <li>
            <Link to="/spending" data-testid="nav-spending" className="hover:text-white transition-colors">Spending</Link>
          </li>
          <li>
            <Link to="/investing" data-testid="nav-investing" className="hover:text-white transition-colors">Investing</Link>
          </li>
          <li>
            <Link to="/summaries" data-testid="nav-summaries" className="hover:text-white transition-colors">Weekly Summaries</Link>
          </li>
          <li>
            <Link to="/imports" data-testid="nav-imports" className="hover:text-white transition-colors">Bulk Imports</Link>
          </li>
          <li>
            <Link to="/settings" data-testid="nav-settings" className="hover:text-white transition-colors">Master Config</Link>
          </li>
        </ul>
      </nav>
      <main className="flex flex-1 flex-col text-slate-100">
        <header className="border-b border-slate-800/60 py-4">
          <div className="mx-auto w-full max-w-[var(--max-content-width)] px-[var(--page-padding-x)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">
                <span className="text-slate-400">Workspace</span>
                <span className="font-semibold text-slate-100">Personal</span>
              </div>
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  to="/todo"
                  data-testid="header-quick-todo"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Todo
                </Link>
                <Link
                  to="/spending"
                  data-testid="header-quick-spending"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Spending
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NavLink
                to="/notifications"
                aria-label="Notifications"
                data-testid="header-notifications"
                className={({ isActive }) =>
                  `relative inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                    isActive
                      ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {(unread?.count ?? 0) > 0 ? (
                  <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
                    {unread?.count}
                  </span>
                ) : null}
              </NavLink>
              <details className="relative hidden sm:block">
                <summary
                  data-testid="header-profile-menu"
                  className="list-none inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <UserCircle2 className="h-4 w-4 text-slate-400" />
                  <span className="max-w-[140px] truncate">{user?.username ?? user?.email ?? 'Profile'}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                </summary>
                <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/40">
                  <div className="mb-2 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Signed In</p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-100">{user?.username ?? 'Profile'}</p>
                    <p className="truncate text-xs text-slate-400">{user?.email ?? ''}</p>
                  </div>
                  <Link
                    to="/settings"
                    className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
                  >
                    Workspace Settings
                  </Link>
                  <Link
                    to="/notifications"
                    className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
                  >
                    Notifications
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200 disabled:opacity-60"
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </details>
              <button
                data-testid="header-logout"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1">
          {children}
        </div>
      </main>
      <VoiceAgentWidget />
    </div>
  );
};

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    let cancelled = false;

    const hydrateSession = async () => {
      try {
        const user = await authService.checkAuth();
        if (!cancelled) {
          setSession(user);
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      }
    };

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [clearSession, setSession]);

  // When the refresh interceptor gives up (refresh token expired / revoked),
  // it fires the onUnauthorized event. We clear the session here so the
  // router redirects to /login without any component needing to catch 401s.
  useEffect(() => {
    return onUnauthorized(() => {
      clearSession();
    });
  }, [clearSession]);

  if (!isAuthResolved) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-300">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} 
        />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/todo" 
          element={
            <ProtectedRoute>
              <TodoPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/spending" 
          element={
            <ProtectedRoute>
              <SpendingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/investing" 
          element={
            <ProtectedRoute>
              <InvestingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/summaries" 
          element={
            <ProtectedRoute>
              <WeeklySummariesPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/imports"
          element={
            <ProtectedRoute>
              <ImportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MasterConfigPage />
            </ProtectedRoute>
          }
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
