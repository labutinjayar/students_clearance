import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { useNavigate, Link } from 'react-router-dom';
import { GradeSignatureModal } from '../../components/instructor/GradeSignatureModal';
import { DashboardMetricPanel } from '../../components/ui/DashboardMetricPanel';
import { 
  FileSignature, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Clock, 
  BookOpen, 
  ArrowRight, 
  X, 
  Eye,
  ShieldCheck,
  Bell
} from 'lucide-react';

export function InstructorDashboard() {
  const { user } = useAuth();
  const { 
    signatureRequests, 
    subjectAssignments, 
    subjects, 
    students, 
    submitInstructorGradeSignature,
    rejectRequest,
    refreshData
  } = useDb();
  const navigate = useNavigate();

  const [selectedForReject, setSelectedForReject] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedForApprove, setSelectedForApprove] = useState<any | null>(null);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        setShowNotificationBanner(true);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      setShowNotificationBanner(false);
    }
  };

  // Filter requests strictly assigned to this instructor
  const myRequests = signatureRequests.filter(r => r.instructorId === user?.id);
  const pendingRequests = myRequests.filter(r => r.status === 'Pending');
  const approvedCount = myRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = myRequests.filter(r => r.status === 'Rejected').length;

  // Assigned subjects & students
  const myAssignments = subjectAssignments.filter(sa => sa.instructorId === user?.id);
  const uniqueSubjectIds = Array.from(new Set(myAssignments.map(sa => sa.subjectId)));
  const myAssignedSubjects = subjects.filter(s => uniqueSubjectIds.includes(s.id));
  const uniqueStudentIds = Array.from(new Set(myAssignments.map(sa => sa.studentId)));
  const instructorMetrics = [
    { label: 'Pending Requests', detail: 'Awaiting your review', value: pendingRequests.length, icon: Clock, color: 'text-yellow-700' },
    { label: 'Approved Signatures', detail: 'Clearances you completed', value: approvedCount, icon: CheckCircle, color: 'text-emerald-700' },
    { label: 'Rejected Requests', detail: 'Returned for student action', value: rejectedCount, icon: AlertCircle, color: 'text-red-700' },
    { label: 'Assigned Students', detail: 'Students in your classes', value: uniqueStudentIds.length, icon: Users, color: 'text-sky-800' },
  ];

  const handleSubmitGrade = async (grade: number, signatureSvg: string, remarks: string) => {
    if (!selectedForApprove || !user) return { success: false, message: 'Your instructor session has expired. Sign in again.' };
    setIsSubmittingGrade(true);
    const result = await submitInstructorGradeSignature({
      requestId: selectedForApprove.id,
      instructorId: user.id,
      grade,
      signatureSvg,
      remarks
    });
    setIsSubmittingGrade(false);
    if (result.success) {
      setSelectedForApprove(null);
      await refreshData();
    }
    return result;
  };

  const handleRejectConfirm = async () => {
    if (!selectedForReject || !user || !rejectReason.trim()) return;
    const result = await rejectRequest(selectedForReject.id, user.id, rejectReason);
    if (result.success) {
      setSelectedForReject(null);
      setRejectReason('');
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Permission Banner */}
      {showNotificationBanner && (
        <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 text-yellow-950 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-yellow-900 text-sm">Enable Instant Notifications</div>
              <div className="text-yellow-800 text-xs font-medium">Get notified immediately when students request your signature</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={requestNotificationPermission}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-xs font-black rounded-xl border border-yellow-500 transition-colors"
            >
              Enable Notifications
            </button>
            <button
              onClick={() => setShowNotificationBanner(false)}
              className="px-3 py-2 text-yellow-800 text-xs font-bold hover:text-yellow-950"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-sky-950 mb-1 tracking-tight">
            Welcome, <span className="text-yellow-600">{user?.name}</span>!
          </h2>
          <p className="text-sky-900/80 text-sm font-medium">
            Faculty Instructor • <span className="font-bold text-sky-950">{user?.department || 'College of Industrial Technology'}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigate('/instructor/requests')}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-xs font-black rounded-xl border border-yellow-500 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FileSignature className="w-3.5 h-3.5" />
            View All Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => navigate('/instructor/students')}
            className="px-4 py-2 bg-white/90 hover:bg-sky-100 text-sky-950 border-2 border-sky-200 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-yellow-600" />
            My Students ({uniqueStudentIds.length})
          </button>
          <button
            onClick={() => navigate('/instructor/history')}
            className="px-4 py-2 bg-white/90 hover:bg-sky-100 text-sky-950 border-2 border-sky-200 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-yellow-600" />
            Signature History
          </button>
        </div>
      </div>

      <DashboardMetricPanel
        title="Instructor Overview"
        description="Signature requests and students assigned to you"
        metrics={instructorMetrics}
      />

      {/* Main Grid: Pending Requests Table & Assigned Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Recent Pending Requests Table */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-xs rounded-3xl border-2 border-sky-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-sky-100">
              <div>
                <h3 className="font-black text-lg text-sky-950">Recent Signature Requests</h3>
                <p className="text-xs text-sky-800 font-medium">Students awaiting your digital clearance sign-off</p>
              </div>
              <Link 
                to="/instructor/requests"
                className="text-xs font-black text-yellow-800 hover:text-yellow-950 bg-yellow-400 hover:bg-yellow-500 px-3 py-1.5 rounded-xl border border-yellow-500 flex items-center gap-1 transition-colors shadow-2xs"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sky-100 text-sky-900 uppercase font-black text-[10px] rounded-xl">
                  <tr>
                    <th className="px-3 py-2.5 rounded-l-xl">Student</th>
                    <th className="px-3 py-2.5">Subject</th>
                    <th className="px-3 py-2.5">Requested</th>
                    <th className="px-3 py-2.5 text-right rounded-r-xl">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100">
                  {pendingRequests.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sky-800/60 font-medium">
                        <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                        All caught up! No pending clearance signature requests.
                      </td>
                    </tr>
                  ) : (
                    pendingRequests.slice(0, 5).map((req) => {
                      const student = students.find(s => s.userId === req.studentId);
                      const subject = subjects.find(s => s.id === req.subjectId);

                      return (
                        <tr key={req.id} className="hover:bg-sky-50/80 transition-colors">
                          <td className="px-3 py-3">
                            <div className="font-black text-sky-950">{student?.name || 'Profile unavailable'}</div>
                            <div className="text-sky-700 text-[10px] font-bold">{student?.studentId || 'ID not provided'} • {student?.section || 'Section unavailable'}</div>
                          </td>
                          <td className="px-3 py-3 font-bold text-yellow-700">
                            {subject?.subjectCode}
                          </td>
                          <td className="px-3 py-3 text-sky-800 font-medium">
                            {new Date(req.requestedAt || '').toLocaleDateString()}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedForApprove(req)}
                                className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black rounded-lg transition-colors flex items-center gap-1 border border-yellow-500 shadow-2xs"
                                title="Sign & Submit Grade"
                                disabled={!student || !subject}
                              >
                                <FileSignature className="w-3 h-3" />
                                Sign & Submit Grade
                              </button>
                              <button
                                onClick={() => setSelectedForReject(req)}
                                className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg transition-colors flex items-center gap-1 border border-red-200"
                                title="Reject Request"
                              >
                                <X className="w-3 h-3" />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-sky-100 flex justify-end">
            <Link
              to="/instructor/requests"
              className="text-xs font-black text-yellow-800 hover:text-yellow-950 flex items-center gap-1"
            >
              Open Full Requests Workspace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Assigned Subjects Card */}
        <div className="lg:col-span-1 bg-white/95 backdrop-blur-xs rounded-3xl border-2 border-sky-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-yellow-600" />
              <h3 className="font-black text-lg text-sky-950">Assigned Subjects</h3>
            </div>
            <p className="text-sky-800/80 text-xs mb-4 leading-relaxed font-medium">
              Officially assigned teaching workload under your clearance jurisdiction.
            </p>

            <div className="space-y-2.5">
              {myAssignedSubjects.map(sub => {
                const assignedStudentsCount = myAssignments.filter(sa => sa.subjectId === sub.id).length;
                return (
                  <div key={sub.id} className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="font-black text-sky-950 text-sm">{sub.subjectCode}</div>
                      <div className="text-xs text-sky-800 font-medium truncate max-w-[160px]">{sub.subjectName}</div>
                    </div>
                    <span className="text-[11px] font-black text-yellow-950 bg-yellow-300 border border-yellow-400 px-2.5 py-1 rounded-full shrink-0 shadow-2xs">
                      {assignedStudentsCount} Enrolled
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-sky-100">
            <div className="text-xs text-sky-900 flex items-center gap-2 bg-yellow-50 p-3 rounded-2xl border border-yellow-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-yellow-600 shrink-0" />
              <span>Submit each grade with your drawn signature and a recorded submission time.</span>
            </div>
          </div>
        </div>
      </div>

      {selectedForApprove && user && (
        <GradeSignatureModal
          request={selectedForApprove}
          instructor={user}
          student={students.find(student => student.userId === selectedForApprove.studentId)}
          subject={subjects.find(subject => subject.id === selectedForApprove.subjectId)}
          submitting={isSubmittingGrade}
          onCancel={() => setSelectedForApprove(null)}
          onSubmit={handleSubmitGrade}
        />
      )}

      {/* QUICK REJECT MODAL */}
      {selectedForReject && (
        <div className="fixed inset-0 bg-sky-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-red-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-base">Reject Clearance Request</h3>
              </div>
              <button onClick={() => setSelectedForReject(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <p className="text-sky-900 font-medium">
                Please provide a clear reason so the student knows what requirements to complete before requesting again.
              </p>
              <div>
                <label className="block text-xs font-black text-sky-900 mb-1">Reason for Rejection *</label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="E.g. Please complete your laboratory requirement before requesting clearance."
                  className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-red-400 outline-none text-sky-950 font-medium"
                />
              </div>
            </div>
            <div className="p-4 bg-sky-50 border-t border-sky-100 flex justify-end gap-2">
              <button onClick={() => setSelectedForReject(null)} className="px-4 py-2 bg-sky-100 text-sky-950 text-xs font-bold rounded-xl">
                Cancel
              </button>
              <button 
                disabled={!rejectReason.trim()}
                onClick={handleRejectConfirm} 
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
