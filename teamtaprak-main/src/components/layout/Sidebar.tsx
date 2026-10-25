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
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={cn(
      "bg-gradient-to-b from-sky-950 via-sky-900 to-sky-950 border-r border-yellow-400/30 flex flex-col shrink-0 transition-[width] duration-300 ease-out",
      isCollapsed ? "w-[76px]" : "w-64"
    )}>
      <div className={cn("pt-5 pb-3 flex items-center", isCollapsed ? "justify-center px-3" : "justify-between px-5")}>
        {!isCollapsed && (
          <span className="text-[10px] font-extrabold text-sky-100/80 uppercase tracking-wider">
            {panelLabel}
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="rounded-lg p-2 text-sky-100 hover:bg-sky-700 hover:text-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className={cn("flex-1 py-2 space-y-1.5 overflow-y-auto mt-2", isCollapsed ? "px-3" : "px-4")}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            title={isCollapsed ? link.name : undefined}
          >
            {({ isActive }) => (
              <div className={cn(
                "flex items-center justify-between rounded-xl cursor-pointer transition-all relative",
                isCollapsed ? "px-3 py-3" : "px-4 py-2.5",
                isActive 
                  ? "bg-yellow-400 text-yellow-950 font-bold shadow-sm shadow-yellow-400/20" 
                  : "text-sky-100 hover:bg-sky-700/80 hover:text-white font-medium"
              )}>
                <div className="flex items-center space-x-3 min-w-0">
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-sky-950 rounded-r-full"></div>
                  )}
                  <link.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-yellow-950" : "text-yellow-300")} />
                  {!isCollapsed && <span className="text-[14px] truncate">{link.name}</span>}
                </div>
                {!isCollapsed && Boolean(link.badge && link.badge > 0) && (
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

      <div className={cn("border-t border-sky-700/70", isCollapsed ? "p-3" : "p-4")}>
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          aria-label="Logout"
          className={cn(
            "w-full flex items-center rounded-xl hover:bg-red-500/15 hover:text-red-300 font-medium transition-colors text-left",
            isCollapsed ? "justify-center px-3 py-3" : "space-x-3 px-4 py-2.5",
            "text-sky-100"
          )}
        >
          <LogOut className="h-[18px] w-[18px] text-yellow-300 shrink-0" />
          {!isCollapsed && <span className="text-[14px]">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
