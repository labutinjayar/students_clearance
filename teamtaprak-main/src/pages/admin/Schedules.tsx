import React from 'react';
import { Clock } from 'lucide-react';

export function AdminSchedules() {
  const dates = [
    { day: 'Mon', date: '11', active: false },
    { day: 'Tue', date: '12', active: false },
    { day: 'Wed', date: '13', active: false },
    { day: 'Thu', date: '14', active: false },
    { day: 'Fri', date: '15', active: true },
    { day: 'Sat', date: '16', active: false },
  ];

  const slots = [
    { time: '09:00 AM - 10:00 AM', left: 4, total: 20, status: 'Active' },
    { time: '10:30 AM - 11:30 AM', left: 2, total: 20, status: 'Active' },
    { time: '01:00 PM - 02:00 PM', left: 0, total: 20, status: 'Full' },
    { time: '02:30 PM - 03:30 PM', left: 8, total: 20, status: 'Active' },
  ];

  return (
    <div className="max-w-[1200px] w-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-[28px] font-bold text-gray-900 mb-1 tracking-tight">Manage Schedules</h2>
          <p className="text-gray-500 text-[15px]">Configure available timeslots and capacities for booklet pickups.</p>
        </div>
        <button className="px-5 h-10 text-[14px] font-bold text-white bg-[#1d4ed8] hover:bg-blue-800 rounded-lg transition-colors shadow-sm">
          + Add Timeslot
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 mb-8">
        {dates.map((d, i) => (
          <div 
            key={i} 
            className={`flex flex-col items-center justify-center py-4 rounded-xl border cursor-pointer transition-colors ${
              d.active 
                ? 'bg-[#1d4ed8] border-[#1d4ed8] text-white shadow-[0_4px_14px_0_rgba(29,78,216,0.39)]' 
                : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]'
            }`}
          >
            <span className={`text-[13px] font-medium mb-1 ${d.active ? 'text-blue-100' : 'text-gray-400'}`}>{d.day}</span>
            <span className={`text-xl font-bold ${d.active ? 'text-white' : 'text-gray-900'}`}>{d.date}</span>
          </div>
        ))}
      </div>

      <h3 className="text-[15px] font-bold text-gray-900 mb-4 tracking-tight">Configured Slots (Dec 15)</h3>
      
      <div className="flex flex-col gap-4">
        {slots.map((slot, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${slot.status === 'Active' ? 'bg-[#f4f7fb]' : 'bg-red-50'}`}>
                <Clock className={`w-4 h-4 ${slot.status === 'Active' ? 'text-blue-600' : 'text-red-500'}`} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-gray-900 text-[14px]">{slot.time}</h3>
                <span className="text-[13px] text-gray-400">{slot.left} of {slot.total} slots available</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-md ${
                slot.status === 'Active' ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-red-50 text-red-600'
              }`}>
                {slot.status}
              </span>
              <div className="h-6 w-px bg-gray-200"></div>
              <button className="text-[13px] font-bold text-[#1d4ed8] hover:text-blue-800 transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
