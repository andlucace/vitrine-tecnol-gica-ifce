import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Users, BarChart2, 
  Settings, LogOut, FlaskConical, ChevronRight, X
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: FileText, label: 'Patentes', path: '/admin/patents' },
  { icon: Users, label: 'Leads / Empresas', path: '/admin/leads' },
  { icon: BarChart2, label: 'Relatórios', path: '/admin/reports' },
  { icon: Settings, label: 'Administradores', path: '/admin/users' },
];

export default function AdminSidebar({ onClose }) {
  const location = useLocation();

  const handleLogout = () => {
    base44.auth.logout('/login');
  };

  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-sm">
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-medium opacity-70 leading-none">IFCE</p>
            <p className="text-sm font-bold leading-tight">Vitrine Tecnológica</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-sidebar-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest opacity-50 px-3 pt-2 pb-1">Menu</p>
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                active
                  ? 'bg-sidebar-primary text-white shadow-sm'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}