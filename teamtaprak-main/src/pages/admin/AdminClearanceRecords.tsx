import React, { useState } from 'react';
import { useDb } from '../../context/DbContext';
import { 
  FolderCheck, 
  Search, 
  Download, 
  Printer, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  X, 
  FileText,
  Award
} from 'lucide-react';

export function AdminClearanceRecords() {
  const { 
    students, 
    subjects, 
    instructors,
    subjectAssignments, 
    signatureRequests, 
    digitalSignatures, 
    academicYear, 
    semester 
  } = useDb();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Completed' | 'In Progress'>('All');
  const [selectedStudentForBreakdown, setSelectedStudentForBreakdown] = useState<any | null>(null);

  // Compute student records
  const records = students.map(st => {
    const stAssignments = subjectAssignments.filter(sa => sa.studentId === st.userId);
    const totalAssigned = stAssignments.length;
    
    const subjectStatuses = stAssignments.map(sa => {
      const sub = subjects.find(s => s.id === sa.subjectId);
      const req = signatureRequests.find(r => r.studentId === st.userId && r.subjectId === sa.subjectId);
      const digiSig = digitalSignatures.find(s => s.studentId === st.userId && s.subjectId === sa.subjectId);
      return {
        assignment: sa,
        subject: sub,
        request: req,
        digitalSignature: digiSig
      };
    });

    const signedCount = subjectStatuses.filter(s => s.request?.status === 'Approved').length;
    const pendingCount = subjectStatuses.filter(s => s.request?.status === 'Pending').length;
    const rejectedCount = subjectStatuses.filter(s => s.request?.status === 'Rejected').length;
    const isCompleted = totalAssigned > 0 && signedCount === totalAssigned;
    const overallStatus = totalAssigned === 0 || subjectStatuses.every(s => !s.request)
      ? 'NOT STARTED'
      : rejectedCount > 0
        ? 'INCOMPLETE'
        : pendingCount > 0 || signedCount < totalAssigned
          ? 'INCOMPLETE / IN PROGRESS'
          : 'COMPLETED';

    return {
      student: st,
      totalAssigned,
      signedCount,
      pendingCount,
      rejectedCount,
      isCompleted,
      overallStatus,
      subjectStatuses
    };
  });

  const filteredRecords = records.filter(rec => {
    const matchesSearch = 
      rec.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.student.course && rec.student.course.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = filterDepartment === 'All' ? true : rec.student.department === filterDepartment;
    const matchesStatus = 
      filterStatus === 'All' ? true :
      filterStatus === 'Completed' ? rec.isCompleted :
      !rec.isCompleted;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Course', 'Year & Section', 'Department', 'Total Subjects', 'Signed', 'Pending', 'Clearance Status'];
    const rows = filteredRecords.map(r => [
      r.student.studentId,
      `"${r.student.name}"`,
      `"${r.student.course || 'BSIT'}"`,
      `"${r.student.yearLevel || '3rd Year'} - ${r.student.section || 'IT-3A'}"`,
      `"${r.student.department}"`,
      r.totalAssigned,
      r.signedCount,
      r.pendingCount,
      r.isCompleted ? 'COMPLETED' : 'IN PROGRESS'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SSU_Clearance_Master_Records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-sky-950 mb-1 tracking-tight">Clearance Records</h1>
          <p className="text-sky-900/80 text-[15px] font-medium">
            Master university-wide academic clearance ledger for Academic Year {academicYear} ({semester}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 hover:bg-white border-2 border-sky-200 text-sky-950 text-xs font-black rounded-2xl shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border border-yellow-500 text-xs font-black rounded-2xl shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Ledger
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/95 backdrop-blur-xs p-4 rounded-3xl border-2 border-sky-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
          <input
            type="text"
            placeholder="Search student name, ID, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white text-sky-950 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-sky-900 uppercase">College:</span>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 text-xs font-black bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sky-950"
            >
              <option value="All">All Colleges</option>
              <option value="College of Industrial Technology">CIT</option>
              <option value="College of Arts and Sciences">CAS</option>
              <option value="College of Education">COED</option>
              <option value="College of Engineering">COE</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-sky-900 uppercase">Status:</span>
            {(['All', 'Completed', 'In Progress'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all ${
                  filterStatus === status 
                    ? 'bg-yellow-400 text-yellow-950 border border-yellow-500 shadow-2xs' 
                    : 'bg-sky-100 text-sky-900 hover:bg-sky-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white/95 backdrop-blur-xs border-2 border-sky-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-100 text-sky-900 uppercase text-[11px] font-black tracking-wider border-b border-sky-200">
              <tr>
                <th className="px-5 py-4">Student Name</th>
                <th className="px-5 py-4">Student ID</th>
                <th className="px-5 py-4">Course & Year</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Signed / Total</th>
                <th className="px-5 py-4">Clearance Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sky-800/60 font-medium">
                    <FolderCheck className="w-8 h-8 text-sky-300 mx-auto mb-2" />
                    No clearance records match the specified filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  return (
                    <tr key={rec.student.id} className="hover:bg-sky-50/80 transition-colors">
                      <td className="px-5 py-4 font-black text-sky-950">
                        {rec.student.name}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-sky-800">
                        {rec.student.studentId}
                      </td>
                      <td className="px-5 py-4 text-sky-950 font-medium">
                        {rec.student.course} ({rec.student.yearLevel})
                      </td>
                      <td className="px-5 py-4 text-sky-800/80 font-medium">
                        {rec.student.department}
                      </td>
                      <td className="px-5 py-4 font-black">
                        <span className={rec.isCompleted ? 'text-emerald-700' : 'text-yellow-700'}>
                          {rec.signedCount} / {rec.totalAssigned} Subjects
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black ${
                          rec.isCompleted 
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-2xs' 
                            : 'bg-yellow-100 text-yellow-950 border border-yellow-300 shadow-2xs'
                        }`}>
                          {rec.isCompleted ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {rec.overallStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedStudentForBreakdown(rec)}
                          className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-950 font-black rounded-xl transition-colors inline-flex items-center gap-1 border border-sky-200 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Breakdown
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT CLEARANCE BREAKDOWN MODAL */}
      {selectedStudentForBreakdown && (
        <div className="fixed inset-0 bg-sky-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-yellow-400 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-yellow-400 text-yellow-950 border-b border-yellow-500 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">{selectedStudentForBreakdown.student.name}</h3>
                <p className="text-yellow-950/80 font-bold text-xs">{selectedStudentForBreakdown.student.studentId} • {selectedStudentForBreakdown.student.course}</p>
              </div>
              <button onClick={() => setSelectedStudentForBreakdown(null)} className="text-yellow-950 hover:bg-yellow-500/50 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between bg-sky-50 p-4 rounded-2xl border border-sky-200 text-xs">
                <div>
                  <span className="text-sky-800/80 font-black uppercase">Overall Status</span>
                  <div className="font-black text-sm text-sky-950 mt-0.5">
                    {selectedStudentForBreakdown.overallStatus}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sky-800/80 font-black uppercase">Progress</span>
                  <div className="font-black text-sm text-yellow-700 mt-0.5">
                    {selectedStudentForBreakdown.signedCount} / {selectedStudentForBreakdown.totalAssigned} Cleared
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-sky-900 uppercase tracking-wider mb-2">Subject Breakdown:</h4>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {selectedStudentForBreakdown.subjectStatuses.map((item: any) => (
                    <div key={item.assignment.id} className="p-3 bg-sky-50/60 rounded-2xl border border-sky-200/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-black text-sky-950">{item.subject?.subjectCode} - {item.subject?.subjectName}</div>
                        <div className="text-sky-800/80 text-[11px] mt-0.5 font-medium">
                          Assigned Faculty: <strong className="text-sky-950 font-bold">{instructors.find(i => i.userId === item.assignment.instructorId || i.id === item.assignment.instructorId)?.name || 'Designated Instructor'}</strong>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-0.5 rounded-xl text-[10px] font-black border ${
                          item.request?.status === 'Approved' ? 'bg-emerald-100 text-emerald-950 border-emerald-300' :
                          item.request?.status === 'Pending' ? 'bg-yellow-100 text-yellow-950 border-yellow-300' :
                          item.request?.status === 'Rejected' ? 'bg-red-100 text-red-950 border-red-300' :
                          'bg-sky-100 text-sky-900 border-sky-200'
                        }`}>
                          {item.request?.status || 'Not Requested'}
                        </span>
                        {item.digitalSignature?.signedAt && (
                          <div className="text-[10px] text-sky-800/80 mt-0.5 font-bold">
                            {new Date(item.digitalSignature.signedAt).toLocaleDateString()}
                          </div>
                        )}
                        {item.request?.reviewedAt && (
                          <div className="text-[10px] text-sky-800/80 mt-0.5 font-bold">
                            Reviewed: {new Date(item.request.reviewedAt).toLocaleDateString()}
                          </div>
                        )}
                        {item.request?.status === 'Rejected' && item.request.instructorRemarks && (
                          <div className="text-[10px] text-red-700 mt-0.5 font-bold max-w-48">
                            Reason: {item.request.instructorRemarks}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-sky-50 border-t border-sky-100 flex justify-end">
              <button
                onClick={() => setSelectedStudentForBreakdown(null)}
                className="px-5 py-2 bg-sky-100 hover:bg-sky-200 text-sky-950 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
