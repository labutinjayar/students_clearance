import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { FileSignature } from 'lucide-react';

function Input({ label, type = 'text', defaultValue, readOnly, className = '', placeholder, min, max }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-bold text-gray-700">{label}</label>
      <input 
        type={type}
        defaultValue={defaultValue}
        readOnly={readOnly}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`px-4 py-2 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${className}`}
      />
    </div>
  );
}

export function ReserveBooklet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subjects, subjectAssignments, createSignatureRequest } = useDb();
  
  const [remarks, setRemarks] = useState('');

  const assignment = subjectAssignments.find(sa => sa.id === id);
  const subject = subjects.find(s => s.id === assignment?.subjectId);

  if (!assignment || !subject) {
    return <div className="p-8 text-center text-gray-500">Subject assignment not found.</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      createSignatureRequest({
        studentId: user.id,
        subjectId: subject.id,
        remarks
      });
      navigate('/student/dashboard'); // Or confirmation page
    }
  };

  return (
    <div className="max-w-[800px] mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 mb-2 tracking-tight">Request Signature</h1>
        <p className="text-gray-500 text-[15px]">Request your instructor to electronically sign your clearance for this subject.</p>
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        <div className="bg-[#f8fafc] p-8 border-b border-gray-100 flex items-start gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
            <FileSignature className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-blue-600 uppercase tracking-wider mb-1">Subject Clearance</div>
            <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-1">{subject.subjectCode} - {subject.subjectName}</h2>
            <p className="text-gray-500 text-[14px]">Academic Year: {assignment.academicYear} • {assignment.semester} Semester</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <h3 className="font-bold text-[16px] text-gray-900 mb-6">Student Details</h3>
          
          <div className="space-y-6">
            <Input
              label="Student Name"
              type="text"
              defaultValue={user?.name}
              readOnly
              className="h-12 bg-gray-50"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Course / Program"
                type="text"
                defaultValue={user?.course || 'BS Information Technology'}
                readOnly
                className="h-12 bg-gray-50"
              />
              
              <Input
                label="Year Level"
                type="text"
                defaultValue={user?.yearLevel || '3rd Year'}
                readOnly
                className="h-12 bg-gray-50"
              />
            </div>
            
            <div className="flex flex-col gap-1.5 pt-4">
              <label className="text-[13px] font-bold text-gray-700">Remarks / Message to Instructor (Optional)</label>
              <textarea 
                rows={3}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="E.g., I have already submitted all my final requirements."
                className="px-4 py-3 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <h3 className="font-bold text-[16px] text-gray-900 mb-6">Request Summary</h3>
            
            <div className="bg-[#f8fafc] rounded-xl p-6 border border-gray-100">
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-[14px] text-gray-500">Subject</span>
                  <span className="text-[14px] font-bold text-gray-900">{subject.subjectCode}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-[14px] text-gray-500">Assigned Instructor</span>
                  <span className="text-[14px] font-bold text-gray-900">Prof. Assigned</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[14px] text-gray-500">Status</span>
                  <span className="text-[14px] font-bold text-blue-600">Pending Request</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => navigate('/student/booklets')}
                  className="flex-1 py-3.5 text-[14px] font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 text-[14px] font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-[0_4px_14px_0_rgba(29,78,216,0.39)] hover:shadow-[0_6px_20px_rgba(29,78,216,0.23)]"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
