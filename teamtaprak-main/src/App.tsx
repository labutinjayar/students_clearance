/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DbProvider } from './context/DbContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';
import { About } from './pages/public/About';
import { HowItWorks } from './pages/public/HowItWorks';
import { Support } from './pages/public/Support';

// Student Pages
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentBooklets } from './pages/student/Booklets';
import { Schedule } from './pages/student/Schedule';
import { StudentHistory } from './pages/student/History';
import { Notifications } from './pages/student/Notifications';
import { Profile } from './pages/student/Profile';

// Instructor Pages
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import { SignatureRequests } from './pages/instructor/SignatureRequests';
import { MyStudents } from './pages/instructor/MyStudents';
import { SignatureHistory } from './pages/instructor/SignatureHistory';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminInstructors } from './pages/admin/AdminInstructors';
import { AdminSubjects } from './pages/admin/AdminSubjects';
import { AdminSubjectAssignments } from './pages/admin/AdminSubjectAssignments';
import { AdminClearanceRecords } from './pages/admin/AdminClearanceRecords';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';

// Route Guards
function RequireAuth({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'student' | 'instructor' | 'admin' }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium text-sm">Loading clearance workspace...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAdminAccess = user.role === 'admin';
  const hasInstructorAccess = user.role === 'instructor' || Boolean(user.isInstructor);

  if (allowedRole) {
    if (allowedRole === 'admin' && !hasAdminAccess) {
      if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
      if (user.role === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
    } else if (allowedRole === 'instructor' && !hasInstructorAccess) {
      if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
      if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    } else if (allowedRole === 'student' && user.role !== 'student') {
      if (user.role === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
      if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

// Home Route - redirect based on auth status
function HomeRoute() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium text-sm">Loading clearance workspace...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to appropriate dashboard based on user role
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === 'instructor') {
    return <Navigate to="/instructor/dashboard" replace />;
  } else {
    return <Navigate to="/student/dashboard" replace />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <DbProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/support" element={<Support />} />
            </Route>

            {/* Student Routes */}
            <Route path="/student" element={
              <RequireAuth allowedRole="student">
                <DashboardLayout />
              </RequireAuth>
            }>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="subjects" element={<StudentBooklets />} />
              <Route path="add-subject" element={<StudentBooklets />} />
              <Route path="booklets" element={<StudentBooklets />} />
              <Route path="status" element={<Schedule />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="history" element={<StudentHistory />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Instructor Routes */}
            <Route path="/instructor" element={
              <RequireAuth allowedRole="instructor">
                <DashboardLayout />
              </RequireAuth>
            }>
              <Route path="dashboard" element={<InstructorDashboard />} />
              <Route path="requests" element={<SignatureRequests />} />
              <Route path="students" element={<MyStudents />} />
              <Route path="history" element={<SignatureHistory />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <RequireAuth allowedRole="admin">
                <DashboardLayout />
              </RequireAuth>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="instructors" element={<AdminInstructors />} />
              <Route path="subjects" element={<AdminSubjects />} />
              <Route path="assignments" element={<AdminSubjectAssignments />} />
              <Route path="records" element={<AdminClearanceRecords />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DbProvider>
    </AuthProvider>
  );
}
