import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Clock, 
  CheckCircle,
  FileSignature,
  Bell,
  Users,
  GraduationCap,
  Layers,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  FolderCheck,
  PlusCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { getUserNotifications } = useDb();
  const navigate = useNavigate();
  const location = useLocation();

  const unreadNotifs = user ? getUserNotifications(user.id).filter(n => !n.isRead).length : 0;

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Subjects', path: '/student/subjects', icon: BookOpen },
    { name: 'Add Subject', path: '/student/add-subject', icon: PlusCircle },
    { name: 'Clearance Status', path: '/student/status', icon: CheckCircle },
    { name: 'Request History', path: '/student/history', icon: Clock },
    { name: 'Notifications', path: '/student/notifications', icon: Bell, badge: unreadNotifs },
  ];

  const instructorLinks = [
    { name: 'Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
    { name: 'Signature Requests', path: '/instructor/requests', icon: FileSignature },
    { name: 'My Students', path: '/instructor/students', icon: Users },
    { name: 'Signature History', path: '/instructor/history', icon: Clock },
    { name: 'Notifications', path: '/instructor/notifications', icon: Bell, badge: unreadNotifs },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: GraduationCap },
    { name: 'Instructors', path: '/admin/instructors', icon: Users },
    { name: 'Subjects', path: '/admin/subjects', icon: BookOpen },
    { name: 'Subject Assignments', path: '/admin/assignments', icon: Layers },
    { name: 'Clearance Records', path: '/admin/records', icon: FolderCheck },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  const isCurrentRouteAdmin = location.pathname.startsWith('/admin');
  const isCurrentRouteInstructor = location.pathname.startsWith('/instructor');

  let links = studentLinks;
  let panelLabel = 'Student Navigation';

  if (isCurrentRouteAdmin || (user?.role === 'admin' && !isCurrentRouteInstructor)) {
    links = adminLinks;
    panelLabel = 'Admin Workspace';
  } else if (isCurrentRouteInstructor || user?.role === 'instructor') {
    links = instructorLinks;
    panelLabel = 'Instructor Panel';
  }

  const showLabels = !isCollapsed || isMobileOpen;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={cn(
      "bg-gradient-to-b from-sky-950 via-sky-900 to-sky-950 border-r border-yellow-400/30 flex flex-col shrink-0 transition-[width,transform] duration-300 ease-out",
      isMobileOpen ? "fixed inset-y-0 left-0 z-50 h-full w-64 translate-x-0" : "fixed inset-y-0 left-0 z-50 h-full w-64 -translate-x-full",
      isCollapsed ? "md:w-[76px]" : "md:w-64",
      "md:static md:inset-auto md:z-auto md:h-auto md:translate-x-0"
    )}>
      <div className={cn("pt-5 pb-3 flex items-center", showLabels ? "justify-between px-5" : "justify-center px-3")}>
        {showLabels && (
          <span className="text-[10px] font-extrabold text-sky-100/80 uppercase tracking-wider">
            {panelLabel}
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden md:inline-flex rounded-lg p-2 text-sky-100 hover:bg-sky-700 hover:text-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className={cn("flex-1 py-2 space-y-1.5 overflow-y-auto mt-2", showLabels ? "px-4 md:px-4" : "px-3")}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={onMobileClose}
            title={isCollapsed && !isMobileOpen ? link.name : undefined}
          >
            {({ isActive }) => (
              <div className={cn(
                "flex items-center justify-between rounded-xl cursor-pointer transition-all relative",
                showLabels ? "px-4 py-2.5" : "px-3 py-3",
                isActive 
                  ? "bg-yellow-400 text-yellow-950 font-bold shadow-sm shadow-yellow-400/20" 
                  : "text-sky-100 hover:bg-sky-700/80 hover:text-white font-medium"
              )}>
                <div className="flex items-center space-x-3 min-w-0">
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-sky-950 rounded-r-full"></div>
                  )}
                  <link.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-yellow-950" : "text-yellow-300")} />
                  {showLabels && <span className="text-[14px] truncate">{link.name}</span>}
                </div>
                {showLabels && Boolean(link.badge && link.badge > 0) && (
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-sky-950 text-yellow-300" : "bg-yellow-400 text-yellow-950"
                  )}>
                    {link.badge}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={cn("border-t border-sky-700/70", showLabels ? "p-4" : "p-3")}>
        <button
          onClick={handleLogout}
          title={isCollapsed && !isMobileOpen ? 'Logout' : undefined}
          aria-label="Logout"
          className={cn(
            "w-full flex items-center rounded-xl hover:bg-red-500/15 hover:text-red-300 font-medium transition-colors text-left",
            showLabels ? "space-x-3 px-4 py-2.5" : "justify-center px-3 py-3",
            "text-sky-100"
          )}
        >
          <LogOut className="h-[18px] w-[18px] text-yellow-300 shrink-0" />
          {showLabels && <span className="text-[14px]">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
