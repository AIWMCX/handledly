import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Phone, 
  Calendar, 
  Settings,
  X,
  Truck,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/leads', icon: Users, label: 'Leads' },
  { to: '/admin/conversations', icon: MessageSquare, label: 'Conversations' },
  { to: '/admin/calls', icon: Phone, label: 'Call Logs' },
  { to: '/admin/ai-quality', icon: ShieldCheck, label: 'AI Quality' },
  { to: '/admin/cost-monitoring', icon: DollarSign, label: 'Cost Monitoring' },
  { to: '/admin/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border/50 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Admin Panel</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
