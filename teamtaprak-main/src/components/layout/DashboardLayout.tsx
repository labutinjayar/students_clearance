import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { 
  ChevronDown, 
  User as UserIcon, 
  LogOut, 
  Bell, 
  BookOpen,
  Award,
  Settings,
  Mail,
  Menu,
  X
} from 'lucide-react';
import { useDb } from '../../context/DbContext';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { getUserNotifications } = useDb();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('ssu_sidebar_collapsed') === 'true');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((collapsed) => {
      const nextState = !collapsed;
      localStorage.setItem('ssu_sidebar_collapsed', String(nextState));
      return nextState;
    });
  };

  const unreadCount = user ? getUserNotifications(user.id).filter(n => !n.isRead).length : 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditProfile = () => {
    setIsDropdownOpen(false);
    if (user?.role === 'student') {
      navigate('/student/profile');
    } else if (user?.role === 'instructor') {
      navigate('/instructor/profile');
    } else {
      navigate('/admin/profile');
    }
  };

  const handleNotifications = () => {
    if (user?.role === 'student') {
      navigate('/student/notifications');
    } else if (user?.role === 'instructor') {
      navigate('/instructor/notifications');
    }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    if (user?.role === 'admin') {
      return 'Office of Academic Affairs • Admin';
    }
    if (user?.role === 'instructor') {
      return `Instructor • ${user.department || 'CIT'}`;
    }
    return `Student • ${user?.course || 'BS Information Technology'} (${user?.yearLevel || '3rd Year'})`;
  };
  
  return (
    <div className="flex flex-col h-screen w-full bg-sky-50 font-sans text-sky-950 overflow-hidden academic-bg-pattern page-reveal">
      {/* Top Header - Note: overflow-hidden removed so user profile popup can render cleanly without clipping */}
      <header className="h-16 bg-sky-950/95 text-white border-b border-yellow-400/40 flex items-center justify-between gap-2 px-3 sm:px-6 shrink-0 z-40 shadow-[0_12px_30px_-18px_rgba(8,47,73,0.8)] relative backdrop-blur-xl">
        {/* Background watermark seal accent at logo - contained inside an absolute overflow-hidden wrapper */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-6 -top-6 w-32 h-32 opacity-15 rounded-full overflow-hidden">
            <img src="/ssu_official_logo.png" alt="" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 relative z-10 min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen((open) => !open)}
            aria-label={isMobileSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileSidebarOpen}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-sky-700 text-white transition-colors shrink-0"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white border-2 border-yellow-400 flex items-center justify-center overflow-hidden shrink-0 shadow-lg ring-2 ring-yellow-300/30 p-0.5 transition-transform duration-300 hover:scale-105 hover:rotate-2">
            <img 
              src="/ssu_official_logo.png" 
              alt="Samar State University Official Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="text-white font-black text-sm sm:text-lg leading-tight uppercase tracking-wider drop-shadow-2xs truncate">SSU Clearance</h1>
              <span className="hidden sm:inline bg-yellow-400 text-yellow-950 border border-yellow-500 text-[9px] font-black px-1.5 py-0.2 rounded uppercase shadow-2xs">
                Portal
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-sky-100 uppercase font-extrabold tracking-wider truncate">Samar State University</span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-1 sm:gap-3 md:gap-4 relative z-10">
            {/* Quick Notification Bell (Student & Instructor) */}
            {user.role !== 'admin' && (
              <button 
                type="button"
                onClick={handleNotifications}
                className="relative p-2 rounded-full hover:bg-sky-600 text-white transition-colors cursor-pointer"
                title="View Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-sky-500 animate-pulse"></span>
                )}
              </button>
            )}

            {/* User Profile JD Button & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                type="button"
                id="user-profile-menu-button"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className={`flex items-center gap-3 p-1.5 pr-3 rounded-full transition-all border text-left cursor-pointer focus:outline-none select-none ${
                  isDropdownOpen 
                    ? 'bg-sky-600 border-yellow-400 shadow-md ring-2 ring-yellow-400/40' 
                    : 'hover:bg-sky-600/70 border-transparent hover:border-sky-400/60'
                }`}
                title="Open user profile and account menu"
              >
                <div className="text-right hidden sm:block pl-2">
                  <div className="text-sm font-black text-white flex items-center justify-end gap-1.5">
                    {user.name}
                  </div>
                  <div className="text-xs text-sky-100 font-bold truncate max-w-[220px]">{getRoleBadge()}</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-400 text-yellow-950 flex items-center justify-center shrink-0 border border-yellow-500 font-black text-sm shadow-md ring-2 ring-yellow-400/30">
                  {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <ChevronDown className={`w-4 h-4 text-sky-100 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-yellow-300' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div 
                  id="user-profile-dropdown-menu"
                  className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-[0_16px_40px_-6px_rgba(14,165,233,0.3)] border-2 border-yellow-400 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  {/* User Profile Header Card */}
                  <div className="px-4 py-3.5 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-sky-100/60 to-yellow-50/60">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-yellow-400 text-yellow-950 flex items-center justify-center shrink-0 border-2 border-yellow-500 font-black text-base shadow-sm">
                        {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-black text-sky-950 truncate">{user.name}</div>
                        <div className="text-xs text-yellow-800 font-bold truncate">{getRoleBadge()}</div>
                        <div className="text-[11px] text-sky-700 truncate flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-sky-500" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>

                    {user.studentId && (
                      <div className="mt-2.5 pt-2 border-t border-sky-200/60 flex items-center justify-between text-xs">
                        <span className="text-sky-800 font-semibold">Student ID:</span>
                        <span className="font-mono font-black text-sky-950 bg-white px-2 py-0.5 rounded-md border border-sky-200">
                          {user.studentId}
                        </span>
                      </div>
                    )}

                  </div>

                  {/* Menu Options */}
                  <div className="p-2 space-y-1">
                    {/* Profile Link */}
                    <button 
                      type="button"
                      onClick={handleEditProfile}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-sky-950 hover:text-yellow-900 hover:bg-yellow-50 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-sky-600" />
                      <span>My Profile</span>
                    </button>

                    {/* Quick navigation for student */}
                    {user.role === 'student' && (
                      <>
                        <button 
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate('/student/subjects');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-sky-950 hover:text-yellow-900 hover:bg-yellow-50 rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4 text-sky-600" />
                          <span>My Subjects & Clearances</span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate('/student/schedule');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-sky-950 hover:text-yellow-900 hover:bg-yellow-50 rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span>Clearance Certificate</span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate('/student/notifications');
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-sky-950 hover:text-yellow-900 hover:bg-yellow-50 rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <Bell className="w-4 h-4 text-sky-600" />
                            <span>Notifications</span>
                          </div>
                          {unreadCount > 0 && (
                            <span className="bg-yellow-400 text-yellow-950 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-yellow-500 shadow-2xs">
                              {unreadCount}
                            </span>
                          )}
                        </button>
                      </>
                    )}

                    <div className="pt-1 mt-1 border-t border-sky-100">
                      <button 
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {isMobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-sky-950/55 md:hidden"
          />
        )}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-sky-100/70 via-sky-50 to-sky-100/80 p-3 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto min-w-0 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
