import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';
import { 
  FileSignature, 
  Search, 
  RefreshCw, 
  Eye, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export function StudentHistory() {
  const { user } = useAuth();
  const { signatureRequests, subjects, instructors, digitalSignatures, refreshData } = useDb();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter requests for logged in student
  const myRequests = signatureRequests.filter(r => r.studentId === user?.id)
    .sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());

  const filteredRequests = myRequests.filter(req => {
    const subject = subjects.find(s => s.id === req.subjectId);
    const instructor = instructors.find(i => i.userId === req.instructorId || i.id === req.instructorId);
    
    const matchesSearch = 
      (subject?.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (subject?.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (req.id?.toLowerCase().includes(searchTerm.toLowerCase()) || '');

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
    <div className="max-w-[1200px] w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-sky-950 mb-1 tracking-tight">
            Request <span className="text-yellow-600">History</span>
          </h1>
          <p className="text-sky-900/75 text-[15px] font-medium">Audit and review your previous clearance signature requests and approval logs.</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500 text-yellow-950 text-xs font-black rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-yellow-900' : 'text-yellow-900'}`} />
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white/95 backdrop-blur-xs p-4 rounded-3xl border-2 border-sky-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500" />
          <input
            type="text"
            placeholder="Search by subject code, name, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-sky-50 border border-sky-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all font-medium text-sky-950"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-sky-900 uppercase mr-1">Filter:</span>
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all ${
                filterStatus === status
                  ? 'bg-yellow-400 text-yellow-950 border border-yellow-500 shadow-xs'
                  : 'bg-sky-100 text-sky-900 hover:bg-sky-200'
              }`}
            >
              {status === 'Approved' ? 'Signed' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="flex flex-col gap-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white/90 p-12 text-center text-sky-800/60 rounded-3xl border-2 border-sky-200 text-sm font-medium">
            <FileSignature className="w-10 h-10 mx-auto mb-2 text-yellow-500 opacity-60" />
            No request history records found matching your filters.
          </div>
        ) : (
          filteredRequests.map((req) => {
            const subject = subjects.find(s => s.id === req.subjectId);
            const instructor = instructors.find(i => i.userId === req.instructorId || i.id === req.instructorId);
            const isApproved = req.status === 'Approved';
            const isPending = req.status === 'Pending';
            const isRejected = req.status === 'Rejected';

            return (
              <div 
                key={req.id} 
                className="bg-white/95 backdrop-blur-xs rounded-2xl border-2 border-sky-200/80 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-yellow-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    isPending ? 'bg-yellow-100 text-yellow-900 border border-yellow-300' :
                    'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {isApproved ? <CheckCircle className="w-6 h-6" /> :
                     isPending ? <Clock className="w-6 h-6" /> :
                     <AlertCircle className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sky-950 text-base">{subject?.subjectCode || 'Subject'}</h3>
                      <span className="text-xs text-sky-400">•</span>
                      <span className="text-xs text-sky-900 font-bold">{subject?.subjectName}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-sky-800/80 mt-1 font-medium">
                      <span>Assigned Instructor: <strong className="text-sky-950 font-black">{instructor?.name || 'Assigned Faculty'}</strong></span>
                      <span>•</span>
                      <span>Requested: {new Date(req.requestedAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 self-end md:self-auto">
                  <span className={`text-[11px] font-black px-3 py-1.5 rounded-full shadow-2xs ${
                    isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 
                    isPending ? 'bg-yellow-100 text-yellow-900 border border-yellow-300' : 
                    'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {isApproved ? 'Signed ✓' : req.status}
                  </span>

                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-xs font-black rounded-xl transition-colors flex items-center gap-1.5 border border-yellow-500 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* VIEW COMPLETE REQUEST MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-sky-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-yellow-400 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-sky-100 flex items-center justify-between bg-yellow-400">
              <div>
                <h3 className="text-lg font-black text-yellow-950">Complete Request Details</h3>
                <p className="text-xs text-yellow-900 font-mono font-bold">Reference ID: {selectedRequest.id}</p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-yellow-950 hover:bg-yellow-500/50 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-sm">
              <div className="flex justify-between py-2 border-b border-sky-100">
                <span className="text-sky-800 font-medium">Subject</span>
                <span className="font-black text-sky-950">
                  {subjects.find(s => s.id === selectedRequest.subjectId)?.subjectCode} - {subjects.find(s => s.id === selectedRequest.subjectId)?.subjectName}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-sky-100">
                <span className="text-sky-800 font-medium">Assigned Instructor</span>
                <span className="font-black text-sky-950">
                  {instructors.find(i => i.userId === selectedRequest.instructorId || i.id === selectedRequest.instructorId)?.name || 'Faculty Member'}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-sky-100">
                <span className="text-sky-800 font-medium">Request Date & Time</span>
                <span className="text-sky-900 font-bold">
                  {selectedRequest.requestedAt ? new Date(selectedRequest.requestedAt).toLocaleString() : 'N/A'}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-sky-100">
                <span className="text-sky-800 font-medium">Status</span>
                <span className={`px-3 py-1 text-xs font-black rounded-full shadow-2xs ${
                  selectedRequest.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  selectedRequest.status === 'Pending' ? 'bg-yellow-100 text-yellow-900 border border-yellow-300' :
                  'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {selectedRequest.status === 'Approved' ? 'Signed & Approved ✓' : selectedRequest.status}
                </span>
              </div>

              {selectedRequest.reviewedAt && (
                <div className="flex justify-between py-2 border-b border-sky-100">
                  <span className="text-sky-800 font-medium">Review Date</span>
                  <span className="text-sky-900 font-bold">{new Date(selectedRequest.reviewedAt).toLocaleString()}</span>
                </div>
              )}

              {selectedRequest.remarks && (
                <div className="py-2 border-b border-sky-100">
                  <span className="text-xs font-black text-sky-900 uppercase tracking-wider block mb-1">Student Message / Remarks:</span>
                  <div className="p-3 bg-sky-50 rounded-2xl text-xs text-sky-950 border border-sky-200 font-medium">
                    {selectedRequest.remarks}
                  </div>
                </div>
              )}

              {selectedRequest.instructorRemarks && (
                <div className="py-2">
                  <span className="text-xs font-black text-sky-900 uppercase tracking-wider block mb-1">Instructor Comments:</span>
                  <div className={`p-3 rounded-2xl text-xs font-bold ${
                    selectedRequest.status === 'Rejected' ? 'bg-red-50 text-red-900 border border-red-200' : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  }`}>
                    {selectedRequest.instructorRemarks}
                  </div>
                </div>
              )}

              {/* Digital signature hash if approved */}
              {selectedRequest.status === 'Approved' && (
                <div className="p-3.5 rounded-2xl bg-yellow-50 border border-yellow-300 text-xs text-yellow-950">
                  <div className="font-black flex items-center gap-1.5 text-yellow-900 mb-0.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Digital Signature Authenticated
                  </div>
                  <div className="font-medium text-yellow-900/90">Verified by {selectedRequest.reviewedBy || 'Instructor'} under Samar State University Clearance Registry.</div>
                </div>
              )}
            </div>

            <div className="p-4 bg-sky-50 border-t border-sky-100 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2 bg-sky-200 hover:bg-sky-300 text-sky-950 text-xs font-bold rounded-xl transition-colors"
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
