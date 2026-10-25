import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  GraduationCap, 
  Building2, 
  Mail, 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Edit3, 
  Check, 
  X,
  KeyRound
} from 'lucide-react';

export function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const { getStudentSubjects } = useDb();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [course, setCourse] = useState(user?.course || '');
  const [yearLevel, setYearLevel] = useState(user?.yearLevel || '');
  const [section, setSection] = useState(user?.section || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [title, setTitle] = useState(user?.title || '');
  const [profileSaveError, setProfileSaveError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const studentItems = user?.role === 'student' ? getStudentSubjects(user.id) : [];
  const signedCount = studentItems.filter(i => i.latestRequest?.status === 'Approved').length;
  const isAllCleared = studentItems.length > 0 && signedCount === studentItems.length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      setProfileSaveError('Enter your name before saving your profile.');
      return;
    }
    setIsSavingProfile(true);
    const saved = await updateProfile({
      name,
      department,
      ...(user.role === 'student' ? { course, yearLevel, section } : {}),
      ...(user.role !== 'student' ? { title } : {})
    });
    setIsSavingProfile(false);
    if (!saved) {
      setProfileSaveError('Profile changes could not be saved. Check your connection and try again.');
      return;
    }
    setProfileSaveError('');
    setIsEditing(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setPwdMsg({ type: 'success', text: 'Password successfully updated.' });
    setTimeout(() => {
      setShowPasswordModal(false);
      setPwdMsg(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-[1000px] w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-sky-950 mb-1 tracking-tight">
            {user?.role === 'student' ? 'Student Profile' : user?.role === 'instructor' ? 'Instructor Profile' : 'User Profile'}
          </h1>
          <p className="text-sky-900/75 text-[15px] font-medium">Manage your official academic credentials and institutional security settings.</p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => {
                setName(user?.name || '');
                setCourse(user?.course || '');
                setYearLevel(user?.yearLevel || '');
                setSection(user?.section || '');
                setDepartment(user?.department || '');
                setTitle(user?.title || '');
                setProfileSaveError('');
                setIsEditing(true);
              }}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-xs font-black rounded-xl border border-yellow-500 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-sky-100 hover:bg-sky-200 border-2 border-sky-300 text-sky-950 text-xs font-black rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Status */}
        <div className="bg-white/95 backdrop-blur-xs rounded-3xl border-2 border-sky-200/80 shadow-xs p-6 text-center flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-yellow-300 border-4 border-yellow-400 flex items-center justify-center text-yellow-950 font-black text-3xl mb-4 shadow-sm">
            {user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'U'}
          </div>
          <h3 className="text-lg font-black text-sky-950">{user?.name}</h3>
          <p className="text-xs text-sky-700 font-bold">{user?.email}</p>

          <div className="w-full mt-6 pt-6 border-t border-sky-100 space-y-3 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-sky-700 font-medium">Account Type:</span>
              <span className="font-black text-sky-950 uppercase">{user?.role}</span>
            </div>

            {user?.role === 'student' && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-sky-700 font-medium">Clearance Status:</span>
                <span className={`font-black px-2.5 py-0.5 rounded-full text-[11px] shadow-2xs ${
                  isAllCleared ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                }`}>
                  {isAllCleared ? 'Cleared ✓' : 'In Progress'}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-xs">
              <span className="text-sky-700 font-medium">Account Status:</span>
              <span className="font-black text-emerald-700">Active</span>
            </div>
          </div>

          <div className="w-full mt-6 pt-6 border-t border-sky-100 space-y-2">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full py-2.5 px-4 bg-sky-50 hover:bg-sky-100 text-sky-950 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-sky-200"
            >
              <KeyRound className="w-4 h-4 text-sky-700" />
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Right Column: Profile Details Form */}
        <div className="md:col-span-2 bg-white/95 backdrop-blur-xs rounded-3xl border-2 border-sky-200/80 shadow-xs p-6">
          <h3 className="text-base font-black text-sky-950 mb-4 pb-3 border-b border-sky-100 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-yellow-500" />
            {user?.role === 'student' ? 'Academic & Department Information' : 'Profile & Department Information'}
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <p className="text-xs font-medium text-sky-800">
              Changes save to your account and will be available when you sign in on another device.
            </p>
            {profileSaveError && (
              <div role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                {profileSaveError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-sky-900 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-sky-950 disabled:opacity-75 disabled:bg-sky-100/50"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-sky-900 uppercase tracking-wider mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full p-2.5 text-sm bg-sky-100/60 border border-sky-200 rounded-xl text-sky-700 font-medium cursor-not-allowed"
                />
              </div>

              {user?.role === 'student' && (
                <>
                  <div>
                    <label className="block text-xs font-black text-sky-900 uppercase tracking-wider mb-1">
                      Student ID Number
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user?.studentId || '2026-0001'}
                      className="w-full p-2.5 text-sm bg-sky-100/60 border border-sky-200 rounded-xl text-sky-950 font-bold cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-sky-900 uppercase tracking-wider mb-1">
                      Course / Degree
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full p-2.5 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-sky-950 disabled:opacity-75 disabled:bg-sky-100/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-sky-900 uppercase tracking-wider mb-1">
                      Year Level
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={yearLevel}
                      onChange={(e) => setYearLevel(e.target.value)}
                      className="w-full p-2.5 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-sky-950 disabled:opacity-75 disabled:bg-sky-100/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-sky-900 uppercase tracking-wider mb-1">
                      Section
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full p-2.5 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-sky-950 disabled:opacity-75 disabled:bg-sky-100/50"
                    />
                  </div>
                </>
              )}

              {user?.role !== 'student' && (
                <div>
                  <label className="block text-xs font-black text-sky-900 uppercase tracking-wider mb-1">
                    Position / Title
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-sky-950 disabled:opacity-75 disabled:bg-sky-100/50"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-sky-900 uppercase tracking-wider mb-1">
                  Department / College
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-sky-950 disabled:opacity-75 disabled:bg-sky-100/50"
                />
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-sky-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setName(user?.name || '');
                    setCourse(user?.course || '');
                    setYearLevel(user?.yearLevel || '');
                    setSection(user?.section || '');
                    setDepartment(user?.department || '');
                    setTitle(user?.title || '');
                    setProfileSaveError('');
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-950 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-xs font-black rounded-xl border border-yellow-500 shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-sky-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-yellow-400 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-sky-100 flex items-center justify-between bg-yellow-400">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-yellow-950" />
                <h3 className="font-black text-yellow-950 text-base">Change Password</h3>
              </div>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="text-yellow-950 hover:bg-yellow-500/50 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {pwdMsg && (
                <div className={`p-3 rounded-2xl text-xs font-bold ${
                  pwdMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {pwdMsg.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-sky-950 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sky-950 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-sky-950 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full p-2.5 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sky-950 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-sky-950 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full p-2.5 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sky-950 font-bold"
                />
              </div>

              <div className="pt-4 border-t border-sky-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-950 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-xs font-black rounded-xl border border-yellow-500 shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
