import {
  LayoutDashboard,
  CheckSquare,
  CreditCard,
  TrendingUp,
  PieChart,
  FileText,
  Upload,
  Download,
  Settings,
} from 'lucide-react';

export const ROLE_BADGE: Record<string, string> = {
  owner: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  admin: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  member: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  viewer: 'bg-slate-700 text-slate-400 border-slate-600',
};

export const NAV_LINKS = [
  { to: '/', label: 'Dashboard', testId: 'nav-dashboard', icon: LayoutDashboard },
  { to: '/todo', label: 'Todos', testId: 'nav-todo', icon: CheckSquare },
  { to: '/spending', label: 'Spending', testId: 'nav-spending', icon: CreditCard },
  { to: '/investing', label: 'Investing', testId: 'nav-investing', icon: TrendingUp },
  { to: '/net-worth', label: 'Net Worth', testId: 'nav-net-worth', icon: PieChart },
  { to: '/summaries', label: 'Weekly Summaries', testId: 'nav-summaries', icon: FileText },
  { to: '/imports', label: 'Bulk Imports', testId: 'nav-imports', icon: Upload },
  { to: '/exports', label: 'Data Exports', testId: 'nav-exports', icon: Download },
  { to: '/settings', label: 'Master Config', testId: 'nav-settings', icon: Settings },
];
