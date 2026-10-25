import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  RotateCcw, 
  RefreshCw, 
  Eye, 
  Printer, 
  Download, 
  X, 
  ShieldCheck,
  Award
} from 'lucide-react';

export function Schedule() {
  const { user } = useAuth();
  const { getStudentSubjects, refreshData, academicYear, semester } = useDb();
  const navigate = useNavigate();

  const [selectedItemForRemarks, setSelectedItemForRemarks] = useState<any | null>(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<any | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const studentItems = user ? getStudentSubjects(user.id) : [];

  const totalSubjects = studentItems.length;
  const signedCount = studentItems.filter(item => item.latestRequest?.status === 'Approved').length;
  const clearanceProgress = totalSubjects > 0 ? Math.round((signedCount / totalSubjects) * 100) : 0;
  const isCompleted = totalSubjects > 0 && signedCount === totalSubjects;
  const hasRejected = studentItems.some(item => item.latestRequest?.status === 'Rejected');

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleDownloadCertificate = () => {
    const certContent = `SAMAR STATE UNIVERSITY
OFFICIAL CERTIFICATE OF ACADEMIC CLEARANCE
Academic Year: ${academicYear} | ${semester}

STUDENT INFORMATION:
Name: ${user?.name}
Student ID: ${user?.studentId}
Course: ${user?.course || 'BS Information Technology'}
Year Level: ${user?.yearLevel || '3rd Year'} - ${user?.section || 'BS Info Tech 3D'}
Status: CLEARANCE COMPLETED (All ${totalSubjects} Subjects Digitally Signed)

CLEARED SUBJECTS:
${studentItems.map(item => `- ${item.subject.subjectCode} (${item.subject.subjectName}): Grade ${item.digitalSignature?.grade?.toFixed(2) || 'Not recorded'}; signed by ${item.digitalSignature?.instructorName || item.instructor?.name || 'Assigned Instructor'} on ${item.digitalSignature?.signedAt ? new Date(item.digitalSignature.signedAt).toLocaleDateString() : 'Not signed'}`).join('\n')}

Verification Hash: SSU-CLEARANCE-${user?.studentId}-${Date.now().toString(36).toUpperCase()}
Issued by Office of Academic Affairs, Samar State University.`;

    const blob = new Blob([certContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SSU_Clearance_Certificate_${user?.studentId || 'student'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1200px] w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-black text-sky-950 mb-1 tracking-tight">
            Clearance <span className="text-yellow-600">Status</span>
          </h2>
          <p className="text-sky-900/75 text-[15px] font-medium">Monitor your real-time academic clearance verification progress and digital signatures.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500 text-yellow-950 text-xs font-black rounded-xl shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-yellow-900' : 'text-yellow-900'}`} />
            Refresh Status
          </button>
        </div>
      </div>

      {/* Progress Hero Card */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border-2 border-sky-200/80 shadow-xs p-8 text-center">
        {isCompleted ? (
          <div className="space-y-4">
            <div className="w-20 h-20 bg-yellow-300 text-yellow-950 rounded-full flex items-center justify-center mx-auto shadow-xs border-2 border-yellow-400">
              <ShieldCheck className="w-10 h-10 text-yellow-950" />
            </div>
            <div>
              <div className="inline-block px-3.5 py-1 bg-yellow-400 text-yellow-950 text-xs font-black rounded-full uppercase tracking-wider mb-2 border border-yellow-500">
                Official Clearance Verified
              </div>
              <h3 className="text-2xl font-black text-sky-950">CLEARANCE COMPLETED ✓</h3>
              <p className="text-sky-900/75 text-sm font-medium mt-1">All {totalSubjects} required subjects have been digitally signed by your assigned instructors.</p>
            </div>
            
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setShowCertificateModal(true)}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black text-sm rounded-2xl shadow-xs border border-yellow-500 transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-yellow-950" />
                View Clearance Certificate
              </button>
              <button
                onClick={handlePrintCertificate}
                className="px-5 py-3 bg-white hover:bg-sky-50 border-2 border-sky-200 text-sky-950 font-bold text-sm rounded-2xl shadow-xs transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-sky-700" />
                Print Certificate
              </button>
            </div>
          </div>
        ) : hasRejected ? (
          <div className="space-y-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto shadow-xs border border-red-200">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <div className="inline-block px-3 py-1 bg-red-100 text-red-900 text-xs font-black rounded-full uppercase tracking-wider mb-2 border border-red-300">
                Action Required
              </div>
              <h3 className="text-2xl font-black text-sky-950">CLEARANCE IN PROGRESS</h3>
              <p className="text-sky-900/75 text-sm font-medium mt-1">{signedCount} of {totalSubjects} Subjects Signed. Some subject requests were returned with instructor remarks.</p>
            </div>

            <div className="w-full max-w-md mx-auto bg-sky-100 rounded-full h-4 overflow-hidden border border-sky-200">
              <div className="bg-yellow-500 h-4 rounded-full transition-all duration-500" style={{ width: `${clearanceProgress}%` }}></div>
            </div>
            <p className="text-xs font-black text-yellow-700">{clearanceProgress}% Completed</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-20 h-20 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center mx-auto shadow-xs border border-yellow-300">
              <Clock className="w-10 h-10 text-yellow-700" />
            </div>
            <div>
              <div className="inline-block px-3 py-1 bg-yellow-200 text-yellow-950 text-xs font-black rounded-full uppercase tracking-wider mb-2 border border-yellow-300">
                Clearance in Progress
              </div>
              <h3 className="text-2xl font-black text-sky-950">CLEARANCE IN PROGRESS</h3>
              <p className="text-sky-900/75 text-sm font-medium mt-1">{signedCount} of {totalSubjects} Subjects Signed</p>
            </div>

            <div className="w-full max-w-md mx-auto bg-sky-100 rounded-full h-4 overflow-hidden border border-sky-200">
              <div className="bg-yellow-400 h-4 rounded-full transition-all duration-500" style={{ width: `${clearanceProgress}%` }}></div>
            </div>
            <p className="text-xs font-black text-yellow-700">{clearanceProgress}% Complete</p>
          </div>
        )}
      </div>

      {/* Progress Checklist Tracker */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-black text-sky-950 tracking-tight">Subject Progress Tracker</h3>
          <span className="text-xs font-black text-yellow-800 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-300">{signedCount} / {totalSubjects} Completed</span>
        </div>
        
        <div className="flex flex-col gap-3">
          {studentItems.length === 0 ? (
            <div className="bg-white/90 p-8 text-center text-sky-800/60 rounded-2xl border-2 border-sky-200 text-sm font-medium">
              No subjects assigned for clearance evaluation.
            </div>
          ) : studentItems.map((item) => {
            const req = item.latestRequest;
            const status = req?.status || 'Not Requested';
            const isSigned = status === 'Approved';
            const isPending = status === 'Pending';
            const isRejected = status === 'Rejected';

            return (
              <div 
                key={item.assignment.id} 
                className="bg-white/95 backdrop-blur-xs rounded-2xl border-2 border-sky-200/80 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-yellow-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isSigned ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    isPending ? 'bg-yellow-100 text-yellow-900 border border-yellow-300' :
                    isRejected ? 'bg-red-100 text-red-800 border border-red-300' :
                    'bg-sky-100 text-sky-700 border border-sky-200'
                  }`}>
                    {isSigned ? <CheckCircle className="w-6 h-6" /> :
                     isPending ? <Clock className="w-6 h-6" /> :
                     isRejected ? <AlertCircle className="w-6 h-6" /> :
                     <FileText className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sky-950 text-sm">{item.subject.subjectCode}</h4>
                      <span className="text-xs text-sky-400">•</span>
                      <span className="text-xs text-sky-900 font-bold">{item.subject.subjectName}</span>
                    </div>
                    <p className="text-xs text-sky-800/80 mt-0.5 font-medium">
                      Assigned Instructor: <span className="font-bold text-sky-950">{item.instructor?.name || 'Assigned Faculty'}</span>
                    </p>
                  </div>
                </div>
                
                {/* Actions and Status */}
                <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto">
                  <span className={`text-[11px] font-black px-3 py-1.5 rounded-full shadow-2xs ${
                    isSigned ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 
                    isPending ? 'bg-yellow-100 text-yellow-900 border border-yellow-300' :
                    isRejected ? 'bg-red-100 text-red-800 border border-red-300' :
                    'bg-sky-100 text-sky-800 border border-sky-200'
                  }`}>
                    {isSigned ? 'Signed ✓' : status}
                  </span>

                  <button
                    onClick={() => setSelectedItemForDetails(item)}
                    className="px-3 py-1.5 text-xs font-bold text-sky-950 bg-sky-100 hover:bg-sky-200 border border-sky-200 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-700" />
                    View
                  </button>

                  {req?.instructorRemarks && (
                    <button
                      onClick={() => setSelectedItemForRemarks(item)}
                      className="px-3 py-1.5 text-xs font-bold text-yellow-950 bg-yellow-300 hover:bg-yellow-400 border border-yellow-400 rounded-xl transition-colors"
                    >
                      View Remarks
                    </button>
                  )}

                  {isRejected && (
                    <button
                      onClick={() => navigate('/student/subjects')}
                      className="px-3 py-1.5 text-xs font-black text-yellow-950 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500 rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Request Again
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* VIEW REMARKS MODAL */}
      {selectedItemForRemarks && (
        <div className="fixed inset-0 bg-sky-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-yellow-400 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-sky-100 flex items-center justify-between bg-yellow-400">
              <h3 className="font-black text-yellow-950 text-base">Instructor Remarks</h3>
              <button 
                onClick={() => setSelectedItemForRemarks(null)}
                className="text-yellow-950 hover:bg-yellow-500/50 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="text-xs text-sky-800 font-medium">
                Subject: <span className="font-black text-sky-950">{selectedItemForRemarks.subject.subjectCode} - {selectedItemForRemarks.subject.subjectName}</span>
              </div>
              <div className="text-xs text-sky-800 font-medium">
                Instructor: <span className="font-black text-sky-950">{selectedItemForRemarks.instructor?.name || 'Assigned Faculty'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 text-sky-950 font-bold text-sm leading-relaxed">
                "{selectedItemForRemarks.latestRequest?.instructorRemarks}"
              </div>
            </div>
            <div className="p-4 bg-sky-50 border-t border-sky-100 flex justify-end">
              <button
                onClick={() => setSelectedItemForRemarks(null)}
                className="px-4 py-2 bg-yellow-400 text-yellow-950 text-xs font-black rounded-xl hover:bg-yellow-500 border border-yellow-500 transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedItemForDetails && (
        <div className="fixed inset-0 bg-sky-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-yellow-400 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-sky-100 flex items-center justify-between bg-sky-50">
              <div>
                <h3 className="font-black text-sky-950 text-base">Subject Signature Details</h3>
                <p className="text-xs text-yellow-700 font-bold">{selectedItemForDetails.subject.subjectCode} • {selectedItemForDetails.subject.subjectName}</p>
              </div>
              <button onClick={() => setSelectedItemForDetails(null)} className="text-sky-700 hover:text-sky-900 p-1.5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-sky-100">
                <span className="text-sky-800 font-medium">Status</span>
                <span className="font-black text-sky-950">{selectedItemForDetails.latestRequest?.status || 'Not Requested'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-sky-100">
                <span className="text-sky-800 font-medium">Assigned Instructor</span>
                <span className="font-black text-sky-950">{selectedItemForDetails.instructor?.name || 'Assigned Faculty'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-sky-100">
                <span className="text-sky-800 font-medium">Request Date</span>
                <span className="text-sky-900 font-bold">{selectedItemForDetails.latestRequest?.requestedAt ? new Date(selectedItemForDetails.latestRequest.requestedAt).toLocaleString() : 'N/A'}</span>
              </div>
              {selectedItemForDetails.digitalSignature && (
                <div className="flex justify-between py-2 border-b border-sky-100">
                  <span className="text-sky-800 font-medium">Signed Date</span>
                  <span className="font-black text-emerald-700">{new Date(selectedItemForDetails.digitalSignature.signedAt).toLocaleString()}</span>
                </div>
              )}
              {selectedItemForDetails.digitalSignature?.grade !== undefined && (
                <div className="flex justify-between py-2 border-b border-sky-100">
                  <span className="text-sky-800 font-medium">Submitted Grade</span>
                  <span className="font-black text-emerald-700">{selectedItemForDetails.digitalSignature.grade.toFixed(2)}</span>
                </div>
              )}
              {selectedItemForDetails.digitalSignature?.signatureSvg && (
                <div className="rounded-xl border border-sky-200 bg-white p-3">
                  <span className="mb-1 block text-xs font-black uppercase text-sky-900">Instructor Signature</span>
                  <img
                    className="h-20 w-full object-contain"
                    src={`data:image/svg+xml,${encodeURIComponent(selectedItemForDetails.digitalSignature.signatureSvg)}`}
                    alt={`Signature from ${selectedItemForDetails.digitalSignature.instructorName}`}
                  />
                </div>
              )}
              {selectedItemForDetails.digitalSignature?.signatureHash && (
                <div className="flex justify-between py-2 border-b border-sky-100">
                  <span className="text-sky-800 font-medium">Signature Record Reference</span>
                  <span className="font-mono text-xs text-yellow-950 font-black bg-yellow-200 border border-yellow-400 px-2 py-0.5 rounded-md">{selectedItemForDetails.digitalSignature.signatureHash}</span>
                </div>
              )}
            </div>
            <div className="p-4 bg-sky-50 border-t border-sky-100 flex justify-end">
              <button onClick={() => setSelectedItemForDetails(null)} className="px-4 py-2 bg-sky-200 text-sky-950 text-xs font-bold rounded-xl hover:bg-sky-300">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEARANCE CERTIFICATE MODAL */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-sky-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white max-w-5xl w-full shadow-2xl border border-slate-300 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header Actions */}
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between print:hidden border-b border-slate-600">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold">Academic Clearance Certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintCertificate}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  onClick={handleDownloadCertificate}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Body (Printable) */}
            <div className="p-5 sm:p-8 bg-white text-center relative overflow-hidden">
              {/* Certificate Header */}
              <div className="flex items-center justify-center gap-4 mb-7 pb-5 border-b border-slate-300">
                <div className="w-14 h-14 border border-slate-300 overflow-hidden bg-white p-1">
                  <img 
                    src="/ssu_official_logo.png" 
                    alt="SSU Seal" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">Republic of the Philippines</div>
                  <h1 className="text-xl font-bold text-slate-900 uppercase">Samar State University</h1>
                  <div className="text-xs text-slate-600">Office of Academic Affairs</div>
                </div>
              </div>

              <div className="my-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-wide uppercase">
                  Certificate of Academic Clearance
                </h2>
                <p className="text-xs text-slate-600 mt-1">This certifies clearance across all enrolled academic subjects.</p>
              </div>

              {/* Student Metadata Table */}
              <div className="border border-slate-300 p-4 my-6 text-left grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                <div>
                  <span className="text-slate-600">Student Name:</span>
                  <div className="font-semibold text-slate-900 text-sm">{user?.name}</div>
                </div>
                <div>
                  <span className="text-slate-600">Student ID:</span>
                  <div className="font-semibold text-slate-900 text-sm">{user?.studentId || '2026-0001'}</div>
                </div>
                <div>
                  <span className="text-slate-600">Course & Year Level:</span>
                  <div className="font-semibold text-slate-900">{user?.course || 'BS Information Technology'} • {user?.yearLevel || '3rd Year'}</div>
                </div>
                <div>
                  <span className="text-slate-600">Academic Term:</span>
                  <div className="font-semibold text-slate-900">{academicYear} ({semester})</div>
                </div>
              </div>

              {/* Cleared Subjects Table */}
              <div className="text-left mb-6">
                <div className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Cleared Subjects</div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-xs border border-slate-300 border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-900 font-semibold border-b border-slate-300">
                      <tr>
                        <th className="px-3 py-2">Subject</th>
                        <th className="px-3 py-2">Assigned Instructor</th>
                        <th className="px-3 py-2 text-center">Grade</th>
                        <th className="px-3 py-2 text-center">Instructor Signature</th>
                        <th className="px-3 py-2">Signature Date</th>
                        <th className="px-3 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {studentItems.map((item) => (
                        <tr key={item.assignment.id}>
                          <td className="px-3 py-2 font-semibold text-slate-900">{item.subject.subjectCode} - {item.subject.subjectName}</td>
                          <td className="px-3 py-2 text-slate-700">{item.digitalSignature?.instructorName || item.instructor?.name || 'Assigned Faculty'}</td>
                          <td className="px-3 py-2 text-center font-semibold text-slate-900">
                            {item.digitalSignature?.grade !== undefined ? item.digitalSignature.grade.toFixed(2) : '—'}
                          </td>
                          <td className="px-3 py-1 text-center">
                            {item.digitalSignature?.signatureSvg ? (
                              <img
                                className="mx-auto h-10 w-24 object-contain"
                                src={`data:image/svg+xml,${encodeURIComponent(item.digitalSignature.signatureSvg)}`}
                                alt={`Signature from ${item.digitalSignature.instructorName || item.instructor?.name || 'assigned instructor'}`}
                              />
                            ) : '—'}
                          </td>
                          <td className="px-3 py-2 text-slate-700">
                            {item.digitalSignature?.signedAt ? new Date(item.digitalSignature.signedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="text-slate-800 font-semibold">
                              {item.latestRequest?.status === 'Approved' && item.digitalSignature ? 'CLEARED' : item.latestRequest?.status?.toUpperCase() || 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Verification & Date */}
              <div className="flex justify-between items-end pt-6 border-t border-slate-300 text-left text-xs">
                <div>
                  <div className="text-slate-600">Date Issued:</div>
                  <div className="font-semibold text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  <div className="font-mono text-[10px] text-slate-600 mt-1">SSU-DIGITAL-AUTH-VERIFIED</div>
                </div>
                <div className="text-right">
                  <img
                    src="/dean_signature.png"
                    alt="Dean's signature"
                    className="relative z-10 ml-auto -mb-4 block h-12 w-36 object-contain"
                  />
                  <div className="relative z-0 font-semibold text-slate-900">Dr. Clearance Registrar</div>
                  <div className="text-slate-600 text-[11px]">Dean / Academic Affairs Office</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">Officially Signed & Sealed</div>
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => {
                  setShowCertificateModal(false);
                  navigate('/student/dashboard');
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
