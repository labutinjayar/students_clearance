import React from 'react';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardMetricPanel } from '../../components/ui/DashboardMetricPanel';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Layers, 
  FileSignature,
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Activity,
  FolderCheck
} from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();
  const { 
    students, 
    instructors, 
    subjects, 
    subjectAssignments, 
    signatureRequests, 
    notifications,
    academicYear, 
    semester 
  } = useDb();
  const navigate = useNavigate();

  const totalStudents = students.length;
  const totalInstructors = instructors.length;
  const totalRequests = signatureRequests.length;
  
  // Calculate students completed clearance
  let completedClearanceCount = 0;
  let pendingClearanceCount = 0;

  students.forEach(st => {
    const stAssignments = subjectAssignments.filter(sa => sa.studentId === st.userId);
    if (stAssignments.length > 0) {
      const allApproved = stAssignments.every(sa => {
        const req = signatureRequests.find(r => r.studentId === st.userId && r.subjectId === sa.subjectId);
        return req?.status === 'Approved';
      });
      if (allApproved) completedClearanceCount++;
      else pendingClearanceCount++;
    }
  });

  const clearanceMetrics = [
    { label: 'Enrolled Students', detail: 'Students registered', value: totalStudents, icon: GraduationCap, color: 'text-yellow-700' },
    { label: 'Faculty Instructors', detail: 'Active faculty accounts', value: totalInstructors, icon: Users, color: 'text-sky-800' },
    { label: 'Clearance Requests', detail: 'Signature requests submitted', value: totalRequests, icon: FileSignature, color: 'text-sky-950' },
    { label: 'Completed Clearances', detail: 'Students fully cleared', value: completedClearanceCount, icon: CheckCircle, color: 'text-emerald-700' },
    { label: 'Pending In-Progress', detail: 'Students awaiting approval', value: pendingClearanceCount, icon: Clock, color: 'text-yellow-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-sky-950 mb-1 tracking-tight">Clearance Administration</h1>
          <p className="text-sky-900/80 text-[15px] font-medium">
            Academic Year {academicYear} • {semester} | Samar State University Master Console
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigate('/admin/assignments')}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border border-yellow-500 text-xs font-black rounded-2xl shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            Subject Assignments
          </button>
          <button
            onClick={() => navigate('/admin/records')}
            className="px-4 py-2 bg-white/95 hover:bg-sky-50 text-sky-950 border-2 border-sky-200/80 text-xs font-bold rounded-2xl shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <FolderCheck className="w-3.5 h-3.5 text-yellow-600" />
            Clearance Records
          </button>
          <button
            onClick={() => navigate('/admin/reports')}
            className="px-4 py-2 bg-white/95 hover:bg-sky-50 text-sky-950 border-2 border-sky-200/80 text-xs font-bold rounded-2xl shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-sky-700" />
            Analytics & Reports
          </button>
        </div>
      </div>

      <DashboardMetricPanel
        title="Clearance Overview"
        description="Current enrollment and clearance totals"
        metrics={clearanceMetrics}
        columns={5}
      />

      {/* Main Grid: Live Clearance Activity & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Signature Requests Activity */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-xs rounded-3xl border-2 border-sky-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-yellow-600" />
                <h3 className="font-black text-lg text-sky-950">Live Clearance Activity Log</h3>
              </div>
              <Link to="/admin/records" className="text-xs font-black text-yellow-700 hover:text-yellow-800 flex items-center gap-1">
                View Records <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {signatureRequests.length === 0 ? (
                <div className="py-8 text-center text-sky-800/60 font-medium text-xs">No activity logged yet.</div>
              ) : (
                signatureRequests.slice(0, 5).map((req) => {
                  const student = students.find(s => s.userId === req.studentId);
                  const subject = subjects.find(s => s.id === req.subjectId);
                  const instructor = instructors.find(i => i.userId === req.instructorId || i.id === req.instructorId);

                  return (
                    <div key={req.id} className="p-3.5 bg-sky-50/80 rounded-2xl border border-sky-200 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                          req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-900'
                        }`}>
                          {req.status === 'Approved' ? <CheckCircle className="w-4 h-4" /> :
                           req.status === 'Rejected' ? <AlertCircle className="w-4 h-4" /> :
                           <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-xs font-black text-sky-950">
                            {student?.name || 'Student'} <span className="text-sky-800/70 font-medium">requested signature for</span> {subject?.subjectCode}
                          </div>
                          <div className="text-[11px] text-sky-800 font-medium">
                            Assigned to: <strong className="text-sky-950 font-bold">{instructor?.name || 'Faculty'}</strong>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 shadow-2xs ${
                        req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        req.status === 'Rejected' ? 'bg-red-100 text-red-800 border border-red-300' :
                        'bg-yellow-100 text-yellow-900 border border-yellow-300'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-sky-100 flex justify-end">
            <Link to="/admin/records" className="text-xs font-black text-yellow-700 hover:text-yellow-800 flex items-center gap-1">
              Complete Records Log <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="lg:col-span-1 bg-white/95 backdrop-blur-xs rounded-3xl border-2 border-sky-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-black text-lg text-sky-950 mb-1">System Management</h3>
            <p className="text-xs text-sky-900/70 font-medium mb-4">Quick shortcuts to academic administration panels</p>

            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2.5">
              <Link
                to="/admin/students"
                className="relative flex min-h-24 min-w-0 flex-col justify-between rounded-xl border border-sky-200 bg-sky-50/70 p-3 pr-8 transition-colors hover:bg-yellow-50/50 group"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <GraduationCap className="w-4 h-4 shrink-0 text-yellow-600" />
                  <div className="min-w-0">
                    <div className="font-black text-sky-950 text-xs leading-tight group-hover:text-yellow-800">Student Directory</div>
                    <div className="text-[10px] text-sky-800/80 font-medium">{students.length} Registered</div>
                  </div>
                </div>
                <ArrowRight className="absolute right-2.5 top-3 w-3.5 h-3.5 text-sky-400 group-hover:text-yellow-600" />
              </Link>

              <Link
                to="/admin/instructors"
                className="relative flex min-h-24 min-w-0 flex-col justify-between rounded-xl border border-sky-200 bg-sky-50/70 p-3 pr-8 transition-colors hover:bg-yellow-50/50 group"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <Users className="w-4 h-4 shrink-0 text-sky-700" />
                  <div className="min-w-0">
                    <div className="font-black text-sky-950 text-xs leading-tight group-hover:text-yellow-800">Faculty Instructors</div>
                    <div className="text-[10px] text-sky-800/80 font-medium">{instructors.length} Instructors</div>
                  </div>
                </div>
                <ArrowRight className="absolute right-2.5 top-3 w-3.5 h-3.5 text-sky-400 group-hover:text-yellow-600" />
              </Link>

              <Link
                to="/admin/subjects"
                className="relative flex min-h-24 min-w-0 flex-col justify-between rounded-xl border border-sky-200 bg-sky-50/70 p-3 pr-8 transition-colors hover:bg-yellow-50/50 group"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <BookOpen className="w-4 h-4 shrink-0 text-yellow-600" />
                  <div className="min-w-0">
                    <div className="font-black text-sky-950 text-xs leading-tight group-hover:text-yellow-800">Curricular Subjects</div>
                    <div className="text-[10px] text-sky-800/80 font-medium">{subjects.length} Courses</div>
                  </div>
                </div>
                <ArrowRight className="absolute right-2.5 top-3 w-3.5 h-3.5 text-sky-400 group-hover:text-yellow-600" />
              </Link>

              <Link
                to="/admin/assignments"
                className="relative flex min-h-24 min-w-0 flex-col justify-between rounded-xl border border-sky-200 bg-sky-50/70 p-3 pr-8 transition-colors hover:bg-yellow-50/50 group"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <Layers className="w-4 h-4 shrink-0 text-sky-700" />
                  <div className="min-w-0">
                    <div className="font-black text-sky-950 text-xs leading-tight group-hover:text-yellow-800">Subject Assignments</div>
                    <div className="text-[10px] text-sky-800/80 font-medium">Instructor Mapping</div>
                  </div>
                </div>
                <ArrowRight className="absolute right-2.5 top-3 w-3.5 h-3.5 text-sky-400 group-hover:text-yellow-600" />
              </Link>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-sky-100">
            <Link
              to="/admin/settings"
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border border-yellow-500 text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              Academic Term Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
