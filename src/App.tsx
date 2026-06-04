import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, Building2, ChevronDown, LogOut, Menu, Plus, UserCircle2, X } from 'lucide-react';
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
import { platformService, type WorkspaceInfo } from './services/platform';
import { VoiceAgentWidget } from './components/VoiceAgentWidget';

// --------------------------------------------------------------------------
// Workspace context hook
// --------------------------------------------------------------------------

function useWorkspace(enabled: boolean) {
  return useQuery({
    queryKey: ['platform', 'workspaces'],
    queryFn: () => platformService.listWorkspaces(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 min
    select: (data) => data.items[0] as WorkspaceInfo | undefined,
  });
}

const ROLE_BADGE: Record<string, string> = {
  owner: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  admin: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  member: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  viewer: 'bg-slate-700 text-slate-400 border-slate-600',
};

// --------------------------------------------------------------------------
// Navigation link list (single source of truth for sidebar + mobile menu)
// --------------------------------------------------------------------------

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', testId: 'nav-dashboard' },
  { to: '/todo', label: 'Todos', testId: 'nav-todo' },
  { to: '/spending', label: 'Spending', testId: 'nav-spending' },
  { to: '/investing', label: 'Investing', testId: 'nav-investing' },
  { to: '/summaries', label: 'Weekly Summaries', testId: 'nav-summaries' },
  { to: '/imports', label: 'Bulk Imports', testId: 'nav-imports' },
  { to: '/settings', label: 'Master Config', testId: 'nav-settings' },
];

// --------------------------------------------------------------------------
// Sidebar navigation (desktop, always visible ≥1024px)
// --------------------------------------------------------------------------

function Sidebar() {
  return (
    <nav className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900/50 p-6 lg:flex lg:flex-col">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-white">Lifestack</h1>
      <ul className="space-y-1">
        {NAV_LINKS.map(({ to, label, testId }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              data-testid={testId}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// --------------------------------------------------------------------------
// Mobile nav drawer (slides in from left on mobile / tablet)
// --------------------------------------------------------------------------

function MobileNavDrawer({
  open,
  onClose,
  username,
  workspace,
}: {
  open: boolean;
  onClose: () => void;
  username: string;
  workspace?: WorkspaceInfo;
}) {
  // Trap scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const roleBadge = workspace?.role ? ROLE_BADGE[workspace.role] ?? ROLE_BADGE.viewer : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-700 bg-slate-900 p-6 shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
      >
        {/* Header row */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">Lifestack</h1>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace pill */}
        {workspace && (
          <div className="mb-4 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <p className="text-xs text-slate-400 uppercase tracking-widest">Workspace</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-slate-100">{workspace.name}</p>
              {roleBadge && (
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleBadge}`}>
                  {workspace.role}
                </span>
              )}
            </div>
          </div>
        )}

        {/* User pill */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5">
          <p className="text-xs text-slate-400 uppercase tracking-widest">Signed in as</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-100">{username}</p>
        </div>

        {/* Links */}
        <ul className="flex-1 space-y-1">
          {NAV_LINKS.map(({ to, label, testId }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                data-testid={`${testId}-mobile`}
                onClick={onClose}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// --------------------------------------------------------------------------
// Route-level loading skeleton
// --------------------------------------------------------------------------

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-5 p-6">
      <div className="h-8 w-48 rounded-xl bg-slate-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-800" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Protected route wrapper (includes layout chrome)
// --------------------------------------------------------------------------

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsService.unreadCount(),
    enabled: isAuthenticated && isAuthResolved,
    refetchInterval: 60_000,
  });
  const { data: workspace } = useWorkspace(isAuthenticated && isAuthResolved);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!isAuthResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <PageSkeleton />
      </div>
    );
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

  const roleBadge = workspace?.role ? ROLE_BADGE[workspace.role] ?? ROLE_BADGE.viewer : null;

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile nav drawer */}
      <MobileNavDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        username={user?.username ?? user?.email ?? 'You'}
        workspace={workspace}
      />

      <main className="flex flex-1 flex-col text-slate-100 min-w-0">
        {/* Top header */}
        <header className="border-b border-slate-800/60 py-3">
          <div className="mx-auto w-full max-w-[var(--max-content-width)] px-[var(--page-padding-x)] flex items-center justify-between gap-3">
            {/* Left: hamburger (mobile) + workspace badge */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile hamburger */}
              <button
                data-testid="nav-mobile-open"
                onClick={() => setMobileNavOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </button>

              {/* Workspace badge — real name + role */}
              {workspace ? (
                <div className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm">
                  <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-100 truncate max-w-[140px]">{workspace.name}</span>
                  {roleBadge && (
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleBadge}`}>
                      {workspace.role}
                    </span>
                  )}
                </div>
              ) : (
                <div className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900 px-3 py-2 text-sm">
                  <div className="h-3.5 w-20 animate-pulse rounded bg-slate-800" />
                </div>
              )}

              {/* Quick-add shortcuts (≥lg only) */}
              <div className="hidden items-center gap-2 xl:flex">
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

            {/* Right: notifications + profile */}
            <div className="flex items-center gap-2 shrink-0">
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
                  <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-rose-500 px-1 text-center text-[10px] font-semibold text-white leading-[18px]">
                    {unread?.count}
                  </span>
                ) : null}
              </NavLink>

              {/* Profile dropdown (hidden on very small screens) */}
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
                    {workspace && (
                      <div className="mt-2 flex items-center gap-1.5 border-t border-slate-800 pt-2">
                        <Building2 className="h-3 w-3 text-slate-500 shrink-0" />
                        <span className="text-xs text-slate-400 truncate">{workspace.name}</span>
                        {roleBadge && (
                          <span className={`ml-auto shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${roleBadge}`}>
                            {workspace.role}
                          </span>
                        )}
                      </div>
                    )}
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
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 min-w-0">{children}</div>
      </main>
      <VoiceAgentWidget />
    </div>
  );
};

// --------------------------------------------------------------------------
// Root App
// --------------------------------------------------------------------------

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

  useEffect(() => {
    return onUnauthorized(() => {
      clearSession();
    });
  }, [clearSession]);

  if (!isAuthResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-300">
        Loading...
      </div>
    );
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
