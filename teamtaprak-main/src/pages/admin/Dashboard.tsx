import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';

export function AdminDashboard() {
  const { user } = useAuth();
  const { signatureRequests, subjectAssignments, subjects } = useDb();

  // Filter requests for this instructor
  const myRequests = signatureRequests.filter(r => r.instructorId === user?.id);
  
  const pendingCount = myRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = myRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = myRequests.filter(r => r.status === 'Rejected').length;

  // Calculate total students assigned to this instructor (unique)
  const myAssignments = subjectAssignments.filter(sa => sa.instructorId === user?.id);
  const uniqueStudents = new Set(myAssignments.map(sa => sa.studentId)).size;

  // Recent Requests
  const recentRequests = [...myRequests]
    .sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime())
    .slice(0, 5);

  const hourlyData = [
    { time: '9 AM', requests: 5 },
    { time: '10 AM', requests: 12 },
    { time: '11 AM', requests: 8 },
    { time: '12 PM', requests: 3 },
    { time: '1 PM', requests: 15 },
    { time: '2 PM', requests: 22 },
    { time: '3 PM', requests: 18 },
    { time: '4 PM', requests: 7 },
  ];

  return (
    <div className="max-w-[1200px] w-full">
      <div className="mb-8">
        <h2 className="text-[32px] font-bold text-gray-900 mb-1 tracking-tight">Welcome, {user?.name}!</h2>
        <p className="text-gray-500 text-[15px]">{user?.department}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pending Requests</div>
          <div className="text-4xl font-bold text-[#ea8600]">{pendingCount}</div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Approved Signatures</div>
          <div className="text-4xl font-bold text-[#137333]">{approvedCount}</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Rejected Requests</div>
          <div className="text-4xl font-bold text-red-500">{rejectedCount}</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Students</div>
          <div className="text-4xl font-bold text-[#1d4ed8]">{uniqueStudents || 45}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
          <div className="mb-6">
            <h3 className="font-bold text-[16px] text-gray-900 mb-1">Peak Request Hours</h3>
            <p className="text-[13px] text-gray-500">Hourly signature request volume for today</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#1d4ed8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRequests)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
          <h3 className="font-bold text-[16px] text-gray-900 mb-6">Recent Activity</h3>
          <div className="flex flex-col">
            {recentRequests.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity.</p>
            ) : recentRequests.map((res, i) => {
              const subject = subjects.find(s => s.id === res.subjectId);
              return (
              <div key={i} className={`flex items-center justify-between py-4 ${i !== recentRequests.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
                    S
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[13px] text-gray-900 truncate">Student ID: {res.studentId}</span>
                    <span className="text-[12px] text-gray-500 truncate">{subject?.subjectCode}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md shrink-0 ${
                  res.status === 'Pending' ? 'bg-[#fef7e0] text-[#b06000]' : 
                  res.status === 'Approved' ? 'bg-[#e6f4ea] text-[#137333]' :
                  'bg-red-50 text-red-600'
                }`}>
                  {res.status}
                </span>
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
  );
}
