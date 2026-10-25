import React from 'react';
import { useDb } from '../../context/DbContext';
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Building2, 
  BookOpen, 
  Download, 
  Printer 
} from 'lucide-react';

export function AdminReports() {
  const { 
    students, 
    instructors, 
    subjects, 
    subjectAssignments, 
    signatureRequests,
    academicYear, 
    semester 
  } = useDb();

  const totalStudents = students.length;
  const totalInstructors = instructors.length;
  const totalSubjects = subjects.length;
  const totalRequests = signatureRequests.length;

  const approvedRequests = signatureRequests.filter(r => r.status === 'Approved').length;
  const pendingRequests = signatureRequests.filter(r => r.status === 'Pending').length;
  const rejectedRequests = signatureRequests.filter(r => r.status === 'Rejected').length;

  const completionRate = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0;

  // Department statistics
  const departments = ['College of Industrial Technology', 'College of Arts and Sciences', 'College of Education', 'College of Engineering'];
  const departmentStats = departments.map(dept => {
    const deptStudents = students.filter(s => s.department === dept);
    const deptStudentIds = deptStudents.map(s => s.userId);
    const deptRequests = signatureRequests.filter(r => deptStudentIds.includes(r.studentId));
    const deptApproved = deptRequests.filter(r => r.status === 'Approved').length;
    const rate = deptRequests.length > 0 ? Math.round((deptApproved / deptRequests.length) * 100) : 0;
    return {
      name: dept,
      studentCount: deptStudents.length,
      requestCount: deptRequests.length,
      approvedCount: deptApproved,
      rate
    };
  });

  // Subject statistics
  const subjectStats = subjects.map(sub => {
    const subRequests = signatureRequests.filter(r => r.subjectId === sub.id);
    const subApproved = subRequests.filter(r => r.status === 'Approved').length;
    const rate = subRequests.length > 0 ? Math.round((subApproved / subRequests.length) * 100) : 0;
    return {
      code: sub.subjectCode,
      name: sub.subjectName,
      totalRequests: subRequests.length,
      approved: subApproved,
      rate
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-sky-950 mb-1 tracking-tight">Analytics & Reports</h1>
          <p className="text-sky-900/80 text-[15px] font-medium">
            Statistical analysis of clearance compliance, department throughput, and faculty response rates.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border border-yellow-500 text-xs font-black rounded-2xl shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Official Report
        </button>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/95 backdrop-blur-xs p-5 rounded-3xl border-2 border-sky-200/80 shadow-xs">
          <div className="text-xs font-black text-sky-900 uppercase tracking-wider mb-2">Overall Compliance Rate</div>
          <div className="text-3xl font-black text-emerald-700">{completionRate}%</div>
          <div className="w-full bg-sky-100 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xs p-5 rounded-3xl border-2 border-sky-200/80 shadow-xs">
          <div className="text-xs font-black text-sky-900 uppercase tracking-wider mb-2">Signed Clearances</div>
          <div className="text-3xl font-black text-yellow-700">{approvedRequests}</div>
          <div className="text-xs text-sky-900/80 font-medium mt-2">Digitally authorized</div>
        </div>

        <div className="bg-white/95 backdrop-blur-xs p-5 rounded-3xl border-2 border-sky-200/80 shadow-xs">
          <div className="text-xs font-black text-sky-900 uppercase tracking-wider mb-2">Pending Faculty Review</div>
          <div className="text-3xl font-black text-amber-600">{pendingRequests}</div>
          <div className="text-xs text-sky-900/80 font-medium mt-2">Awaiting digital sign-off</div>
        </div>

        <div className="bg-white/95 backdrop-blur-xs p-5 rounded-3xl border-2 border-sky-200/80 shadow-xs">
          <div className="text-xs font-black text-sky-900 uppercase tracking-wider mb-2">Rejection Rate</div>
          <div className="text-3xl font-black text-red-600">
            {totalRequests > 0 ? Math.round((rejectedRequests / totalRequests) * 100) : 0}%
          </div>
          <div className="text-xs text-sky-900/80 font-medium mt-2">{rejectedRequests} returned requests</div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border-2 border-sky-200/80 shadow-xs p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-sky-200">
          <Building2 className="w-5 h-5 text-yellow-800" />
          <h3 className="font-black text-base text-sky-950">Clearance Performance by College / Department</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departmentStats.map((dept, idx) => (
            <div key={idx} className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black text-sky-950">{dept.name}</span>
                <span className="font-black text-yellow-700">{dept.rate}% Cleared</span>
              </div>
              <div className="w-full bg-sky-200/80 rounded-full h-2.5 overflow-hidden">
                <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${dept.rate}%` }}></div>
              </div>
              <div className="flex justify-between text-[11px] text-sky-900/80 font-medium pt-1">
                <span>{dept.studentCount} Students Enrolled</span>
                <span>{dept.approvedCount} of {dept.requestCount} Requests Signed</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Compliance Breakdown */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border-2 border-sky-200/80 shadow-xs p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-sky-200">
          <BookOpen className="w-5 h-5 text-yellow-800" />
          <h3 className="font-black text-base text-sky-950">Subject Sign-Off Compliance Registry</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sky-100 text-sky-900 uppercase font-black border-b border-sky-200">
              <tr>
                <th className="px-4 py-3">Subject Code</th>
                <th className="px-4 py-3">Subject Title</th>
                <th className="px-4 py-3">Total Requests</th>
                <th className="px-4 py-3">Signed</th>
                <th className="px-4 py-3">Compliance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {subjectStats.map(sub => (
                <tr key={sub.code} className="hover:bg-sky-50/80 transition-colors">
                  <td className="px-4 py-3 font-black text-yellow-700 font-mono">{sub.code}</td>
                  <td className="px-4 py-3 text-sky-950 font-bold">{sub.name}</td>
                  <td className="px-4 py-3 font-bold text-sky-900">{sub.totalRequests}</td>
                  <td className="px-4 py-3 font-black text-emerald-700">{sub.approved}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-sky-200/80 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${sub.rate}%` }}></div>
                      </div>
                      <span className="font-black text-sky-950">{sub.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
