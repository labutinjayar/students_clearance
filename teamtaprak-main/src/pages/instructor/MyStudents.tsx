import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { 
  Users, 
  RefreshCw, 
  Search, 
  BookOpen, 
  Mail, 
  GraduationCap,
  CheckCircle,
  AlertCircle,
  User as UserIcon
} from 'lucide-react';

export function MyStudents() {
  const { user } = useAuth();
  const { 
    students, 
    subjects, 
    subjectAssignments,
    signatureRequests,
    syncInstructorStudents,
    getInstructorStudents
  } = useDb();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Get students assigned to this instructor
  const myStudents = getInstructorStudents(user?.id || '');

  // Get instructor's subjects
  const mySubjects = subjects.filter(s => s.instructorId === user?.id);

  // Filter students
  const filteredStudents = myStudents.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = selectedSubjectFilter === 'All' ? true : 
      subjectAssignments.some(sa => 
        sa.studentId === student.userId && 
        sa.subjectId === selectedSubjectFilter
      );

    return matchesSearch && matchesSubject;
  });

  const handleSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    setSyncMessage('');
    
    try {
      const result = syncInstructorStudents(user.id);
      setSyncMessage(result.message);
      
      // Clear message after 3 seconds
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      setSyncMessage('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const getStudentSubjects = (studentUserId: string) => {
    const assignments = subjectAssignments.filter(sa => sa.studentId === studentUserId);
    return assignments.map(sa => {
      const subject = subjects.find(s => s.id === sa.subjectId);
      const request = signatureRequests.find(r => 
        r.studentId === studentUserId && 
        r.subjectId === sa.subjectId
      );
      return {
        subject,
        request
      };
    }).filter(item => item.subject && mySubjects.some(s => s.id === item.subject?.id));
  };

  const getClearanceStatus = (studentUserId: string) => {
    const studentSubjects = getStudentSubjects(studentUserId);
    const total = studentSubjects.length;
    const approved = studentSubjects.filter(s => s.request?.status === 'Approved').length;
    const pending = studentSubjects.filter(s => s.request?.status === 'Pending').length;
    const rejected = studentSubjects.filter(s => s.request?.status === 'Rejected').length;
    const notRequested = studentSubjects.filter(s => !s.request).length;

    return { total, approved, pending, rejected, notRequested };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-sky-950 mb-1 tracking-tight">My Students</h1>
          <p className="text-sky-900/80 text-[15px] font-medium">
            View and manage students assigned to your subjects for signature notifications.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black rounded-xl border border-yellow-500 shadow-xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Students'}
        </button>
      </div>

      {syncMessage && (
        <div className={`p-3 rounded-xl text-sm font-bold ${
          syncMessage.includes('failed') 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
        }`}>
          {syncMessage}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/95 backdrop-blur-xs p-4 rounded-2xl border-2 border-sky-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-100 text-sky-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-sky-950">{myStudents.length}</div>
              <div className="text-xs font-bold text-sky-600 uppercase">Total Students</div>
            </div>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-xs p-4 rounded-2xl border-2 border-sky-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-700">
                {myStudents.reduce((sum, s) => sum + getClearanceStatus(s.userId).approved, 0)}
              </div>
              <div className="text-xs font-bold text-emerald-600 uppercase">Approved</div>
            </div>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-xs p-4 rounded-2xl border-2 border-sky-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-100 text-yellow-700 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-yellow-700">
                {myStudents.reduce((sum, s) => sum + getClearanceStatus(s.userId).pending, 0)}
              </div>
              <div className="text-xs font-bold text-yellow-600 uppercase">Pending</div>
            </div>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-xs p-4 rounded-2xl border-2 border-sky-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 text-red-700 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-sky-950">{mySubjects.length}</div>
              <div className="text-xs font-bold text-sky-600 uppercase">My Subjects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white/95 backdrop-blur-xs p-4 rounded-3xl border-2 border-sky-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
          <input
            type="text"
            placeholder="Search by student name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white text-sky-950 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-sky-900 uppercase">Subject:</span>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-sky-50 border border-sky-200 text-sky-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="All">All My Subjects</option>
            {mySubjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.subjectCode} - {sub.subjectName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white/95 backdrop-blur-xs border-2 border-sky-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-100 text-sky-900 uppercase text-[11px] font-black tracking-wider border-b border-sky-200">
              <tr>
                <th className="px-5 py-4">Student Name</th>
                <th className="px-5 py-4">Student ID</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Course & Year</th>
                <th className="px-5 py-4">Clearance Status</th>
                <th className="px-5 py-4">Assigned Subjects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sky-800/60 font-medium">
                    <Users className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                    No students found assigned to your subjects.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const status = getClearanceStatus(student.userId);
                  const studentSubjects = getStudentSubjects(student.userId);
                  
                  return (
                    <tr key={student.id} className="hover:bg-sky-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
                            <UserIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-black text-sky-950">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-sky-800">
                        {student.studentId}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sky-700">
                          <Mail className="w-3 h-3" />
                          <span className="font-medium">{student.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="font-bold text-sky-950">{student.course}</div>
                          <div className="text-sky-600">{student.yearLevel}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {status.approved > 0 && (
                              <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
                                {status.approved}
                              </div>
                            )}
                            {status.pending > 0 && (
                              <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
                                {status.pending}
                              </div>
                            )}
                            {status.notRequested > 0 && (
                              <div className="w-6 h-6 bg-sky-400 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
                                {status.notRequested}
                              </div>
                            )}
                          </div>
                          <span className="text-sky-700 font-medium">
                            {status.approved}/{status.total} Complete
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {studentSubjects.slice(0, 3).map((item, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-sky-50 border border-sky-200 rounded-lg text-[10px] font-bold text-sky-800"
                            >
                              {item.subject?.subjectCode}
                            </span>
                          ))}
                          {studentSubjects.length > 3 && (
                            <span className="px-2 py-1 bg-sky-100 border border-sky-300 rounded-lg text-[10px] font-bold text-sky-700">
                              +{studentSubjects.length - 3}
                            </span>
                          )}
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
    </div>
  );
}