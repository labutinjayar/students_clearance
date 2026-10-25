import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { 
  History, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  X, 
  Clock, 
  RefreshCw,
  ShieldCheck 
} from 'lucide-react';

export function SignatureHistory() {
  const { user } = useAuth();
  const { 
    signatureRequests, 
    subjects, 
    students, 
    digitalSignatures, 
    refreshData 
  } = useDb();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Approved' | 'Rejected'>('All');
  const [selectedItemForView, setSelectedItemForView] = useState<any | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // History includes only evaluated (Approved / Rejected) items by this instructor
  const myHistory = signatureRequests.filter(
    r => r.instructorId === user?.id && (r.status === 'Approved' || r.status === 'Rejected')
  ).sort((a, b) => new Date(b.reviewedAt || b.requestedAt || 0).getTime() - new Date(a.reviewedAt || a.requestedAt || 0).getTime());

  const filteredHistory = myHistory.filter(req => {
    const student = students.find(s => s.userId === req.studentId);
    const subject = subjects.find(s => s.id === req.subjectId);
    
    const matchesSearch = 
      (student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (student?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (subject?.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (subject?.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) || '');

    const matchesFilter = filterStatus === 'All' ? true : req.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-sky-950 mb-1 tracking-tight">Signature History</h1>
          <p className="text-sky-900/80 text-[15px] font-medium">
            Comprehensive digital signature registry and action log for all evaluated clearance requests.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500 text-yellow-950 text-xs font-black rounded-2xl shadow-2xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-yellow-950' : 'text-yellow-950'}`} />
          Refresh Registry
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/95 backdrop-blur-xs p-4 rounded-3xl border-2 border-sky-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
          <input
            type="text"
            placeholder="Search student name, ID, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-sky-50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white text-sky-950 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-sky-900 uppercase">Filter:</span>
          {(['All', 'Approved', 'Rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all ${
                filterStatus === status
                  ? 'bg-yellow-400 text-yellow-950 border border-yellow-500 shadow-2xs'
                  : 'bg-sky-100 text-sky-900 hover:bg-sky-200'
              }`}
            >
              {status === 'Approved' ? 'Signed' : status}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white/95 backdrop-blur-xs border-2 border-sky-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-100 text-sky-900 uppercase text-[11px] font-black tracking-wider border-b border-sky-200">
              <tr>
                <th className="px-5 py-4">Student Name</th>
                <th className="px-5 py-4">Student ID</th>
                <th className="px-5 py-4">Subject Code</th>
                <th className="px-5 py-4">Decision Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Grade / Signature Record</th>
                <th className="px-5 py-4">Remarks</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sky-800/60 font-medium">
                    <History className="w-8 h-8 text-sky-300 mx-auto mb-2" />
                    No previous signature decisions recorded in history.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((req) => {
                  const student = students.find(s => s.userId === req.studentId) || {
                    name: 'Profile unavailable',
                    studentId: 'Not provided'
                  };
                  const subject = subjects.find(s => s.id === req.subjectId);
                  const digiSig = digitalSignatures.find(s => s.signatureRequestId === req.id || (s.studentId === req.studentId && s.subjectId === req.subjectId));
                  const isApproved = req.status === 'Approved';

                  return (
                    <tr key={req.id} className="hover:bg-sky-50/80 transition-colors">
                      <td className="px-5 py-4 font-black text-sky-950">
                        {student.name}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-sky-800">
                        {student.studentId}
                      </td>
                      <td className="px-5 py-4 font-bold text-yellow-700">
                        {subject?.subjectCode}
                      </td>
                      <td className="px-5 py-4 text-sky-800 font-medium whitespace-nowrap">
                        {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-2xs ${
                          isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {isApproved ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {isApproved ? 'Signed ✓' : 'Rejected'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {digiSig?.signatureHash ? (
                          <span className="font-mono text-[10px] bg-yellow-100 text-yellow-950 px-2 py-0.5 rounded-lg border border-yellow-300 font-black block truncate max-w-[140px]" title={digiSig.signatureHash}>
                            {digiSig.grade !== undefined ? `Grade ${digiSig.grade.toFixed(2)}` : 'Signed'}
                          </span>
                        ) : (
                          <span className="text-sky-700/60 italic font-medium">No signature created</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sky-900 font-medium max-w-[180px]">
                        <span className="truncate block" title={req.instructorRemarks}>
                          {req.instructorRemarks || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedItemForView({ req, student, subject, digiSig })}
                          className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-950 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1 border border-sky-200 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-700" />
                          View
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

      {/* VIEW MODAL */}
      {selectedItemForView && (
        <div className="fixed inset-0 bg-sky-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-yellow-400 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-yellow-500 flex items-center justify-between bg-yellow-400">
              <div>
                <h3 className="font-black text-yellow-950 text-base">Signature Audit Record</h3>
                <p className="text-xs text-yellow-900 font-mono">Reference: {selectedItemForView.req.id}</p>
              </div>
              <button onClick={() => setSelectedItemForView(null)} className="text-yellow-950 hover:bg-yellow-500/50 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-sm">
              <div className="flex justify-between py-1.5 border-b border-sky-100">
                <span className="text-sky-700 font-medium">Student Name</span>
                <span className="font-black text-sky-950">{selectedItemForView.student.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sky-100">
                <span className="text-sky-700 font-medium">Student ID</span>
                <span className="font-bold text-sky-950">{selectedItemForView.student.studentId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sky-100">
                <span className="text-sky-700 font-medium">Subject</span>
                <span className="font-bold text-yellow-700">{selectedItemForView.subject?.subjectCode} - {selectedItemForView.subject?.subjectName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sky-100">
                <span className="text-sky-700 font-medium">Decision</span>
                <span className={`font-black ${selectedItemForView.req.status === 'Approved' ? 'text-emerald-700' : 'text-red-700'}`}>
                  {selectedItemForView.req.status === 'Approved' ? 'Approved & Signed ✓' : 'Rejected'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sky-100">
                <span className="text-sky-700 font-medium">Decision Date</span>
                <span className="text-sky-950 font-semibold">{selectedItemForView.req.reviewedAt ? new Date(selectedItemForView.req.reviewedAt).toLocaleString() : 'Not recorded'}</span>
              </div>

              {selectedItemForView.digiSig?.grade !== undefined && (
                <div className="flex justify-between py-1.5 border-b border-sky-100">
                  <span className="text-sky-700 font-medium">Submitted Grade</span>
                  <span className="font-black text-emerald-700">{selectedItemForView.digiSig.grade.toFixed(2)}</span>
                </div>
              )}
              {selectedItemForView.digiSig?.signatureSvg && (
                <div className="rounded-xl border border-sky-200 bg-white p-3">
                  <span className="mb-1 block text-xs font-black uppercase text-sky-900">Instructor Signature</span>
                  <img
                    className="h-20 w-full object-contain"
                    src={`data:image/svg+xml,${encodeURIComponent(selectedItemForView.digiSig.signatureSvg)}`}
                    alt={`Signature from ${selectedItemForView.digiSig.instructorName}`}
                  />
                </div>
              )}
              {selectedItemForView.digiSig?.signatureHash && (
                <div className="py-2 border-b border-sky-100">
                  <span className="text-xs font-black text-sky-900 uppercase block mb-1">Signature Record Reference:</span>
                  <div className="font-mono text-xs text-yellow-950 bg-yellow-100 p-2.5 rounded-xl border border-yellow-300 break-all font-bold">
                    {selectedItemForView.digiSig.signatureHash}
                  </div>
                </div>
              )}

              {selectedItemForView.req.instructorRemarks && (
                <div className="py-2">
                  <span className="text-xs font-black text-sky-900 uppercase block mb-1">Instructor Remarks:</span>
                  <p className="text-xs bg-sky-50 border border-sky-200 p-2.5 rounded-xl text-sky-950 font-medium">{selectedItemForView.req.instructorRemarks}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-sky-50 border-t border-sky-100 flex justify-end">
              <button onClick={() => setSelectedItemForView(null)} className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-xs font-black rounded-xl border border-yellow-500 shadow-2xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
