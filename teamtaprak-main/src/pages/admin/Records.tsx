import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';

export function AdminRecords() {
  const { user } = useAuth();
  const { digitalSignatures, subjects } = useDb();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Filter signatures for this instructor
  const mySignatures = digitalSignatures.filter(s => s.instructorId === user?.id);

  const filteredSignatures = mySignatures.filter(sig => 
    sig.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] w-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 mb-1 tracking-tight">Clearance Records</h1>
          <p className="text-gray-500 text-[15px]">View your digital signature history for student clearances.</p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-[13px] w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-[#f8fafc] text-gray-400 text-[11px] font-bold tracking-wider uppercase border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Signature ID</th>
              <th className="px-6 py-4">Student ID</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Sign Date</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredSignatures.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No signature records found.
                </td>
              </tr>
            ) : filteredSignatures.map((sig) => {
              const subject = subjects.find(s => s.id === sig.subjectId);
              return (
              <tr key={sig.id} className="hover:bg-[#f4f7fb]/50 transition-colors">
                <td className="px-6 py-5 font-mono text-xs text-gray-500">{sig.id}</td>
                <td className="px-6 py-5 font-bold text-gray-900">{sig.studentId}</td>
                <td className="px-6 py-5 text-gray-500 font-medium">{subject?.subjectCode}</td>
                <td className="px-6 py-5 text-gray-400">{new Date(sig.signedAt).toLocaleDateString()}</td>
                <td className="px-6 py-5 flex justify-center">
                  <span className="text-[11px] font-bold px-3 py-1.5 rounded-md bg-[#e6f4ea] text-[#137333]">
                    {sig.signatureStatus}
                  </span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
