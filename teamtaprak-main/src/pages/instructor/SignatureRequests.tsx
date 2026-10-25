import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { GradeSignatureModal } from '../../components/instructor/GradeSignatureModal';
import { 
  FileSignature, 
  X, 
  MessageSquare, 
  User as UserIcon, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle
} from 'lucide-react';

export function SignatureRequests() {
  const { user } = useAuth();
  const { 
    signatureRequests, 
    subjects, 
    students, 
    submitInstructorGradeSignature,
    rejectRequest, 
    addInstructorRemarks,
    refreshData 
  } = useDb();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  
  const [selectedForApprove, setSelectedForApprove] = useState<any | null>(null);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  
  const [selectedForReject, setSelectedForReject] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const [selectedForRemark, setSelectedForRemark] = useState<any | null>(null);
  const [remarkText, setRemarkText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ success: boolean; text: string } | null>(null);

  const [selectedStudentForView, setSelectedStudentForView] = useState<any | null>(null);

  // Strictly filter requests assigned to this instructor only!
  const myRequests = signatureRequests.filter(r => r.instructorId === user?.id && r.status === 'Pending');

  // Filter options
  const mySubjectIds = Array.from(new Set(myRequests.map(r => r.subjectId)));
  const mySubjects = subjects.filter(s => mySubjectIds.includes(s.id));

  const filteredRequests = myRequests.filter(req => {
    const student = students.find(s => s.userId === req.studentId);
    const subject = subjects.find(s => s.id === req.subjectId);

    const matchesSearch = 
      (student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (student?.studentId.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (subject?.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (subject?.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) || '');

    const matchesSubject = selectedSubjectFilter === 'All' ? true : req.subjectId === selectedSubjectFilter;

    return matchesSearch && matchesSubject;
  });

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
      setFeedbackMsg({ success: true, text: result.message });
      await refreshData();
    }
    return result;
  };

  const handleRejectConfirm = async () => {
    if (!selectedForReject || !user || !rejectReason.trim()) return;
    setIsSubmittingReject(true);
    const result = await rejectRequest(selectedForReject.id, user.id, rejectReason);
    setIsSubmittingReject(false);
    setFeedbackMsg({ success: result.success, text: result.message });
    if (result.success) {
      setSelectedForReject(null);
      setRejectReason('');
    }
  };

  const handleSaveRemark = () => {
    if (!selectedForRemark || !remarkText.trim()) return;
    addInstructorRemarks(selectedForRemark.id, remarkText);
    setSelectedForRemark(null);
    setRemarkText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-sky-950 mb-1 tracking-tight">Signature Requests</h1>
          <p className="text-sky-900/80 text-[15px] font-medium">
            Review, sign, or reject pending student clearance requests strictly assigned to your subjects.
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div role="status" className={`rounded-xl border p-3 text-sm font-semibold ${feedbackMsg.success ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'}`}>
          {feedbackMsg.text}
        </div>
      )}

      {/* Search & Subject Filter Bar */}
      <div className="bg-white/95 backdrop-blur-xs p-4 rounded-3xl border-2 border-sky-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
          <input
            type="text"
            placeholder="Search by student name, ID, or subject..."
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
            <option value="All">All Assigned Subjects</option>
            {mySubjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.subjectCode} - {sub.subjectName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white/95 backdrop-blur-xs border-2 border-sky-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-100 text-sky-900 uppercase text-[11px] font-black tracking-wider border-b border-sky-200">
              <tr>
                <th className="px-5 py-4">Student Name</th>
                <th className="px-5 py-4">Student ID</th>
                <th className="px-5 py-4">Subject Code</th>
                <th className="px-5 py-4">Subject Name</th>
                <th className="px-5 py-4">Section</th>
                <th className="px-5 py-4">Date Requested</th>
                <th className="px-5 py-4">Student Remarks</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sky-800/60 font-medium">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    No pending signature requests for your assigned subjects.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const student = students.find(s => s.userId === req.studentId);
                  const subject = subjects.find(s => s.id === req.subjectId);

                  return (
                    <tr key={req.id} className="hover:bg-sky-50/80 transition-colors">
                      <td className="px-5 py-4">
                        {student ? (
                          <button
                            onClick={() => setSelectedStudentForView(student)}
                            className="font-black text-sky-950 hover:text-yellow-700 text-left transition-colors flex items-center gap-1.5"
                          >
                            {student.name}
                            <UserIcon className="w-3 h-3 text-sky-400" />
                          </button>
                        ) : <span className="font-bold text-red-700">Profile unavailable</span>}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-sky-800">
                        {student?.studentId || 'Not provided'}
                      </td>
                      <td className="px-5 py-4 font-bold text-yellow-700">
                        {subject?.subjectCode}
                      </td>
                      <td className="px-5 py-4 text-sky-950 font-medium">
                        {subject?.subjectName}
                      </td>
                      <td className="px-5 py-4 text-sky-800 font-medium">
                        {student?.section || 'Not provided'}
                      </td>
                      <td className="px-5 py-4 text-sky-700 whitespace-nowrap font-medium">
                        {new Date(req.requestedAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-sky-900 max-w-[200px]">
                        {req.remarks ? (
                          <span className="truncate block bg-sky-50 border border-sky-200 p-1.5 rounded-lg text-[11px] font-medium" title={req.remarks}>
                            {req.remarks}
                          </span>
                        ) : (
                          <span className="text-sky-400 italic">No message</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedForApprove(req)}
                            className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black rounded-xl border border-yellow-500 transition-colors flex items-center gap-1 shadow-2xs"
                            title="Sign & Submit Grade"
                            disabled={!student || !subject}
                          >
                            <FileSignature className="w-3.5 h-3.5" />
                            Sign & Submit Grade
                          </button>
                          
                          <button
                            onClick={() => setSelectedForReject(req)}
                            className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl transition-colors flex items-center gap-1 border border-red-200"
                            title="Reject"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>

                          <button
                            onClick={() => {
                              setSelectedForRemark(req);
                              setRemarkText(req.instructorRemarks || '');
                            }}
                            className="px-2.5 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-950 font-bold rounded-xl transition-colors flex items-center gap-1 border border-sky-200"
                            title="Add Remarks"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-sky-700" />
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

      {/* REJECT MODAL */}
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
              <p className="text-sky-950 text-xs leading-relaxed font-medium">
                Provide the student with specific requirements or deficiencies they must resolve before requesting clearance again.
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
              <button onClick={() => setSelectedForReject(null)} disabled={isSubmittingReject} className="px-4 py-2 bg-sky-100 text-sky-950 text-xs font-bold rounded-xl">
                Cancel
              </button>
              <button 
                disabled={!rejectReason.trim() || isSubmittingReject}
                onClick={handleRejectConfirm} 
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                {isSubmittingReject ? 'Submitting...' : 'Submit Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT REMARK MODAL */}
      {selectedForRemark && (
        <div className="fixed inset-0 bg-sky-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-yellow-400 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-yellow-400 text-yellow-950 flex items-center justify-between border-b border-yellow-500">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-yellow-950" />
                <h3 className="font-black text-yellow-950 text-base">Add Instructor Remark</h3>
              </div>
              <button onClick={() => setSelectedForRemark(null)} className="text-yellow-950 hover:bg-yellow-500/50 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-black text-sky-900 mb-1">Remarks for Student</label>
                <textarea
                  rows={3}
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  placeholder="Enter notes or updates..."
                  className="w-full p-2.5 text-xs bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sky-950 font-medium"
                />
              </div>
            </div>
            <div className="p-4 bg-sky-50 border-t border-sky-100 flex justify-end gap-2">
              <button onClick={() => setSelectedForRemark(null)} className="px-4 py-2 bg-sky-100 text-sky-950 text-xs font-bold rounded-xl">
                Cancel
              </button>
              <button onClick={handleSaveRemark} className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-xs font-black rounded-xl border border-yellow-500 shadow-xs">
                Save Remarks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW STUDENT DETAILS MODAL */}
      {selectedStudentForView && (
        <div className="fixed inset-0 bg-sky-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-yellow-400 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-yellow-400 text-yellow-950 flex items-center justify-between border-b border-yellow-500">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-yellow-950" />
                <h3 className="font-black text-base">Student Academic Profile</h3>
              </div>
              <button onClick={() => setSelectedStudentForView(null)} className="text-yellow-950 hover:bg-yellow-500/50 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-sky-100">
                <span className="text-sky-700 font-medium">Full Name</span>
                <span className="font-black text-sky-950">{selectedStudentForView.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sky-100">
                <span className="text-sky-700 font-medium">Student ID</span>
                <span className="font-bold text-sky-950">{selectedStudentForView.studentId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sky-100">
                <span className="text-sky-700 font-medium">Degree Course</span>
                <span className="font-bold text-sky-950">{selectedStudentForView.course || 'BS Information Technology'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sky-100">
                <span className="text-sky-700 font-medium">Year & Section</span>
                <span className="font-bold text-sky-950">{selectedStudentForView.yearLevel || '3rd Year'} - {selectedStudentForView.section || 'IT-3A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sky-100">
                <span className="text-sky-700 font-medium">Department</span>
                <span className="font-bold text-sky-950">{selectedStudentForView.department || 'College of Industrial Technology'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-sky-700 font-medium">Institutional Email</span>
                <span className="font-bold text-yellow-700">{selectedStudentForView.email || `${selectedStudentForView.name.toLowerCase().replace(' ', '.')}@ssu.edu.ph`}</span>
              </div>
            </div>
            <div className="p-4 bg-sky-50 border-t border-sky-100 flex justify-end">
              <button onClick={() => setSelectedStudentForView(null)} className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-xs font-black rounded-xl border border-yellow-500">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
