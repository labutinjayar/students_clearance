import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, Bell, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { DashboardMetricPanel } from '../../components/ui/DashboardMetricPanel';

export function StudentDashboard() {
  const { user } = useAuth();
  const { getStudentSubjects, getUserNotifications } = useDb();
  const navigate = useNavigate();
  
  const studentItems = user ? getStudentSubjects(user.id) : [];
  
  const totalSubjects = studentItems.length;
  const signedCount = studentItems.filter(item => item.latestRequest?.status === 'Approved').length;
  const pendingCount = studentItems.filter(item => item.latestRequest?.status === 'Pending').length;
  const rejectedCount = studentItems.filter(item => item.latestRequest?.status === 'Rejected').length;
  const startedCount = signedCount + pendingCount + rejectedCount;

  const clearanceProgress = totalSubjects > 0 ? Math.round((signedCount / totalSubjects) * 100) : 0;
  const isCompleted = totalSubjects > 0 && signedCount === totalSubjects;
  const hasRejected = rejectedCount > 0;

  // Recent request
  const requestsWithDates = studentItems
    .map(i => ({ ...i.latestRequest, subject: i.subject, instructor: i.instructor }))
    .filter(r => r && r.id);
    
  const latestRequest = requestsWithDates.length > 0 
    ? [...requestsWithDates].sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime())[0] 
    : null;

  const unreadNotifs = user ? getUserNotifications(user.id).filter(n => !n.isRead) : [];
  const studentMetrics = [
    { label: 'Total Subjects', detail: 'Enrolled subjects', value: totalSubjects, icon: BookOpen, color: 'text-sky-800' },
    { label: 'Signed Subjects', detail: 'Approved by instructors', value: signedCount, icon: CheckCircle, color: 'text-emerald-700' },
    { label: 'Pending Signatures', detail: 'Awaiting instructor approval', value: pendingCount, icon: Clock, color: 'text-yellow-700' },
    { label: 'Rejected Requests', detail: 'Needs your attention', value: rejectedCount, icon: AlertCircle, color: 'text-red-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex min-w-0 flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-black text-sky-950 mb-1 leading-tight break-words">
            Welcome, <span className="text-yellow-600">{user?.name}</span>!
          </h2>
          <p className="text-sky-900/75 text-xs sm:text-sm font-medium break-words">
            Student ID: <span className="font-bold text-sky-950">{user?.studentId || '2026-0001'}</span> • {user?.course || 'BS Information Technology'} ({user?.yearLevel || '3rd Year'} - {user?.section || 'IT-3A'})
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap md:w-auto">
          <button
            onClick={() => navigate('/student/subjects')}
            className="flex min-h-9 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-yellow-500/80 bg-yellow-400 px-2 py-2 text-center text-[10px] font-black leading-tight text-yellow-950 shadow-xs transition-colors hover:bg-yellow-500 sm:px-4 sm:text-xs"
          >
            <BookOpen className="h-3.5 w-3.5 shrink-0 text-yellow-900" />
            View My Subjects
          </button>
          <button
            onClick={() => navigate('/student/status')}
            className="flex min-h-9 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-white/95 px-2 py-2 text-center text-[10px] font-bold leading-tight text-sky-950 shadow-xs transition-colors hover:bg-yellow-50 sm:px-4 sm:text-xs"
          >
            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            View Clearance Status
          </button>
          <button
            onClick={() => navigate('/student/history')}
            className="flex min-h-9 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-white/95 px-2 py-2 text-center text-[10px] font-bold leading-tight text-sky-950 shadow-xs transition-colors hover:bg-yellow-50 sm:px-4 sm:text-xs"
          >
            <Clock className="h-3.5 w-3.5 shrink-0 text-sky-600" />
            View History
          </button>
          <button
            onClick={() => navigate('/student/notifications')}
            className="relative flex min-h-9 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-white/95 px-2 py-2 text-center text-[10px] font-bold leading-tight text-sky-950 shadow-xs transition-colors hover:bg-yellow-50 sm:px-4 sm:text-xs"
          >
            <Bell className="h-3.5 w-3.5 shrink-0 text-yellow-600" />
            Notifications
            {unreadNotifs.length > 0 && (
              <span className="bg-yellow-400 text-yellow-950 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-yellow-500 shadow-2xs">
                {unreadNotifs.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Clearance Status Notification Banner */}
      {startedCount === 0 ? (
        <div className="bg-white/95 border-2 border-yellow-400 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex min-w-0 items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400 text-yellow-950 flex items-center justify-center shrink-0 shadow-xs font-black">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black text-yellow-700">CLEARANCE NOT STARTED</div>
              <div className="text-xs text-sky-950 font-medium">Your enrolled subjects are ready. Submit a request for each subject to begin clearance.</div>
            </div>
          </div>
          <Link to="/student/subjects" className="w-full sm:w-auto text-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border border-yellow-500 text-xs font-black rounded-xl shadow-xs transition-colors shrink-0">
            Start Clearance
          </Link>
        </div>
      ) : isCompleted ? (
        <div className="bg-emerald-50/95 border-2 border-emerald-300 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex min-w-0 items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black text-emerald-950">CLEARANCE COMPLETED ✓</div>
              <div className="text-xs text-emerald-800 font-medium">All required subjects have been digitally signed by your assigned instructors.</div>
            </div>
          </div>
          <Link
            to="/student/status"
            className="w-full sm:w-auto text-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
          >
            View Certificate
          </Link>
        </div>
      ) : hasRejected ? (
        <div className="bg-red-50/95 border-2 border-red-300 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex min-w-0 items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black text-red-950">ACTION REQUIRED</div>
              <div className="text-xs text-red-800 font-medium">You have rejected subject clearance requests. Please check instructor remarks and request again.</div>
            </div>
          </div>
          <Link
            to="/student/subjects"
            className="w-full sm:w-auto text-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border border-yellow-500 text-xs font-black rounded-xl shadow-xs transition-colors shrink-0"
          >
            Review & Fix
          </Link>
        </div>
      ) : (
        <div className="bg-white/95 border-2 border-yellow-400 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex min-w-0 items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400 text-yellow-950 flex items-center justify-center shrink-0 shadow-xs font-black">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black text-yellow-700">CLEARANCE IN PROGRESS</div>
              <div className="text-xs text-sky-950 font-medium">{signedCount} of {totalSubjects} subjects officially signed. Submit requests to remaining instructors.</div>
            </div>
          </div>
          <Link
            to="/student/subjects"
            className="w-full sm:w-auto text-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border border-yellow-500 text-xs font-black rounded-xl shadow-xs transition-colors shrink-0"
          >
            Request Signatures
          </Link>
        </div>
      )}

      <DashboardMetricPanel
        title="Clearance Overview"
        description="Your subject clearance status at a glance"
        metrics={studentMetrics}
      />

      {/* Main Grid: Recent Request & Clearance Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 min-w-0 bg-white/95 backdrop-blur-xs rounded-2xl border-2 border-sky-200/80 shadow-xs p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-5 pb-4 border-b border-sky-100">
              <h3 className="font-black text-base sm:text-lg text-sky-950">Recent Signature Request</h3>
              {latestRequest?.status === 'Pending' ? (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 text-xs font-black rounded-full">Pending Approval</span>
              ) : latestRequest?.status === 'Approved' ? (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black rounded-full">Signed ✓</span>
              ) : latestRequest?.status === 'Rejected' ? (
                <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 text-xs font-black rounded-full">Action Required</span>
              ) : (
                <span className="px-3 py-1 bg-sky-100 text-sky-800 text-xs font-bold rounded-full">No recent request</span>
              )}
            </div>
            
            {latestRequest ? (
              <div className="space-y-3">
                <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:flex sm:justify-between items-start gap-2 py-1">
                  <span className="text-xs sm:text-sm text-sky-800 font-medium">Subject</span>
                  <span className="min-w-0 text-right text-xs sm:text-sm font-black text-sky-950 break-words">{latestRequest.subject?.subjectCode} - {latestRequest.subject?.subjectName}</span>
                </div>
                <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:flex sm:justify-between items-start gap-2 py-1">
                  <span className="text-xs sm:text-sm text-sky-800 font-medium">Assigned Instructor</span>
                  <span className="min-w-0 text-right text-xs sm:text-sm font-black text-yellow-700 break-words">{latestRequest.instructor?.name || 'Assigned Instructor'}</span>
                </div>
                {latestRequest.instructorRemarks && (
                  <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:flex sm:justify-between items-start gap-2 py-1">
                    <span className="text-xs sm:text-sm text-sky-800 font-medium">Instructor Remarks</span>
                    <span className="min-w-0 text-xs sm:text-sm font-semibold text-red-700 text-right break-words bg-red-50 p-2 rounded-lg border border-red-200">{latestRequest.instructorRemarks}</span>
                  </div>
                )}
                <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:flex sm:justify-between items-start gap-2 py-1">
                  <span className="text-xs sm:text-sm text-sky-800 font-medium">Requested On</span>
                  <span className="min-w-0 text-right text-xs sm:text-sm font-semibold text-sky-950 break-words">{new Date(latestRequest.requestedAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-sky-800/70 text-sm font-medium">
                No signature requests submitted yet. Click "View My Subjects" to request signatures from your assigned instructors.
              </div>
            )}
          </div>

          <div className="pt-6 mt-4 border-t border-sky-100 flex justify-end">
            <Link
              to="/student/subjects"
              className="text-sm font-black text-yellow-700 hover:text-yellow-800 flex items-center gap-1 transition-colors"
            >
              Manage All Subjects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Progress Card */}
        <div className="lg:col-span-1 bg-white/95 backdrop-blur-xs rounded-2xl border-2 border-yellow-400/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-black text-lg text-sky-950 mb-1">Clearance Progress</h3>
            <p className="text-sky-800/80 text-sm font-medium mb-4 leading-relaxed">
              {signedCount} of {totalSubjects} Subjects Signed
            </p>
            
            <div className="w-full bg-sky-100 rounded-full h-3.5 mb-3 overflow-hidden border border-sky-200">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-yellow-400'}`} 
                style={{ width: `${clearanceProgress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-xs font-black text-sky-950 mb-6">
              <span className="text-yellow-700">{clearanceProgress}% Complete</span>
              <span>{totalSubjects - signedCount} Remaining</span>
            </div>

            <div className="space-y-2 bg-sky-50/80 p-3.5 rounded-xl border border-sky-200/80 mb-6">
              <div className="text-xs font-extrabold text-sky-900 uppercase tracking-wider mb-2">Subject Summary</div>
              {studentItems.slice(0, 3).map((item) => (
                <div key={item.assignment.id} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-sky-950 truncate max-w-[150px]">{item.subject.subjectCode}</span>
                  <span className={`font-black px-2 py-0.5 rounded text-[10px] ${
                    item.latestRequest?.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                    item.latestRequest?.status === 'Pending' ? 'bg-yellow-200 text-yellow-900' :
                    item.latestRequest?.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-sky-200 text-sky-800'
                  }`}>
                    {item.latestRequest?.status || 'Not Requested'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link 
            to="/student/status" 
            className={`w-full py-3 text-yellow-950 font-black text-sm rounded-xl text-center transition-all shadow-xs border ${
              isCompleted ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600' : 'bg-yellow-400 hover:bg-yellow-500 border-yellow-500'
            }`}
          >
            {isCompleted ? 'View Clearance Certificate' : 'View Clearance Status'}
          </Link>
        </div>
      </div>
    </div>
  );
}
