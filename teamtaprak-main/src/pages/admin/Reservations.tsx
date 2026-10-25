import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { GradeSignatureModal } from '../../components/instructor/GradeSignatureModal';

export function AdminReservations() {
  const { user } = useAuth();
  const {
    signatureRequests,
    subjects,
    students,
    digitalSignatures,
    submitInstructorGradeSignature,
    rejectRequest,
    refreshData
  } = useDb();
  
  const [filter, setFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [selectedForSign, setSelectedForSign] = useState<(typeof signatureRequests)[number] | null>(null);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  const canReviewAll = user?.role === 'admin' || user?.isAdmin === true;
  const myRequests = signatureRequests.filter(r => canReviewAll || r.instructorId === user?.id);
  
  const pendingCount = myRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = myRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = myRequests.filter(r => r.status === 'Rejected').length;

  const filteredRequests = myRequests.filter(r => r.status === filter)
    .sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());

  const handleSubmitGrade = async (grade: number, signatureSvg: string, remarks: string) => {
    if (!selectedForSign || !user) return { success: false, message: 'Your instructor session has expired. Sign in again.' };
    setIsSubmittingGrade(true);
    const result = await submitInstructorGradeSignature({
      requestId: selectedForSign.id,
      instructorId: user.id,
      grade,
      signatureSvg,
      remarks
    });
    setIsSubmittingGrade(false);
    if (result.success) {
      setSelectedForSign(null);
      await refreshData();
    }
    return result;
  };

  const handleReject = async (requestId: string) => {
    const result = await rejectRequest(requestId, user?.id || '', 'Please see me.');
    if (result.success) await refreshData();
    else alert(result.message);
  };

  return (
    <div className="max-w-[1200px] w-full">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 mb-1 tracking-tight">Signature Requests</h1>
        <p className="text-gray-500 text-[15px]">Evaluate and digitally sign student clearance requests for your assigned subjects.</p>
      </div>

      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setFilter('Pending')}
          className={`flex items-center gap-2 px-5 py-2.5 text-[14px] font-bold rounded-full transition-colors ${
            filter === 'Pending' ? 'bg-[#1d4ed8] text-white shadow-[0_4px_14px_0_rgba(29,78,216,0.39)]' : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 shadow-sm'
          }`}
        >
          Pending
          <span className={`px-2 py-0.5 rounded-full text-[11px] ${filter === 'Pending' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{pendingCount}</span>
        </button>
        <button
          onClick={() => setFilter('Approved')}
          className={`flex items-center gap-2 px-5 py-2.5 text-[14px] font-bold rounded-full transition-colors ${
            filter === 'Approved' ? 'bg-[#1d4ed8] text-white shadow-[0_4px_14px_0_rgba(29,78,216,0.39)]' : 'bg-white text-[#1d4ed8] hover:bg-blue-50 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]'
          }`}
        >
          Approved
          <span className={`px-2 py-0.5 rounded-full text-[11px] ${filter === 'Approved' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>{approvedCount}</span>
        </button>
        <button
          onClick={() => setFilter('Rejected')}
          className={`flex items-center gap-2 px-5 py-2.5 text-[14px] font-bold rounded-full transition-colors ${
            filter === 'Rejected' ? 'bg-[#1d4ed8] text-white shadow-[0_4px_14px_0_rgba(29,78,216,0.39)]' : 'bg-white text-[#1d4ed8] hover:bg-blue-50 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]'
          }`}
        >
          Rejected
          <span className={`px-2 py-0.5 rounded-full text-[11px] ${filter === 'Rejected' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>{rejectedCount}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRequests.length === 0 ? (
          <div className="col-span-1 lg:col-span-2 p-8 text-center text-gray-500 bg-white rounded-[20px] border border-gray-100">
            No {filter.toLowerCase()} requests found.
          </div>
        ) : filteredRequests.map((res, i) => {
          const subject = subjects.find(s => s.id === res.subjectId);
          const signature = digitalSignatures.find(item => item.signatureRequestId === res.id);
          const student = students.find(item => item.userId === res.studentId);
          const canActOnRequest = res.instructorId === user?.id;
          
          return (
          <div key={res.id} className="bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 flex flex-col justify-between">
            
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-lg">
                    S
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[15px] text-gray-900">{student?.name || 'Student'} · {student?.studentId || res.studentId}</span>
                    <span className="text-[13px] text-blue-600 font-bold">{student ? `${student.course} · ${student.yearLevel} · ${student.section}` : 'Student profile unavailable'}</span>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-3 py-1.5 rounded-md ${
                  res.status === 'Pending' ? 'bg-[#fef7e0] text-[#b06000]' : 
                  res.status === 'Approved' ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-red-50 text-red-600'
                }`}>
                  {res.status}
                </span>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-[14px] text-gray-900 mb-1">{subject?.subjectCode} - {subject?.subjectName}</h4>
                <p className="text-[13px] text-gray-400">Request Date: {new Date(res.requestedAt || '').toLocaleString()}</p>
                {res.remarks && (
                  <p className="text-[13px] text-gray-600 mt-2 bg-gray-50 p-2 rounded-md">
                    Student Remarks: {res.remarks}
                  </p>
                )}
                {signature && (
                  <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
                    Grade: <strong>{signature.grade?.toFixed(2) || '—'}</strong> · Submitted by {signature.instructorName} on {new Date(signature.signedAt).toLocaleString()}
                    {signature.signatureSvg && <img className="mt-2 h-14 max-w-full bg-white object-contain" src={`data:image/svg+xml,${encodeURIComponent(signature.signatureSvg)}`} alt="Instructor signature" />}
                  </div>
                )}
              </div>
            </div>

            {res.status === 'Pending' && canActOnRequest && student && subject && (
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 mt-auto">
                <button 
                  onClick={() => void handleReject(res.id)}
                  className="px-5 h-10 text-[13px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  Reject
                </button>
                <button 
                  onClick={() => setSelectedForSign(res)}
                  className="px-5 h-10 text-[13px] font-bold text-white bg-[#137333] hover:bg-green-700 rounded-lg transition-colors shadow-sm"
                >
                  Sign & Submit Grade
                </button>
              </div>
            )}
            {res.status === 'Pending' && !canActOnRequest && (
              <p className="border-t border-gray-50 pt-4 text-right text-xs font-semibold text-gray-500">
                Awaiting the assigned instructor’s review.
              </p>
            )}
            {res.status === 'Pending' && canActOnRequest && (!student || !subject) && (
              <p className="border-t border-gray-50 pt-4 text-right text-xs font-semibold text-red-700">
                Student or subject information is unavailable; this request cannot be processed.
              </p>
            )}
          </div>
        )})}
      </div>
      {selectedForSign && user && (
        <GradeSignatureModal
          request={selectedForSign}
          instructor={user}
          student={students.find(student => student.userId === selectedForSign.studentId)}
          subject={subjects.find(subject => subject.id === selectedForSign.subjectId)}
          submitting={isSubmittingGrade}
          onCancel={() => setSelectedForSign(null)}
          onSubmit={handleSubmitGrade}
        />
      )}
    </div>
  );
}
