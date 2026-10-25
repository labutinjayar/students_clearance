import React from 'react';
import { BookOpen } from 'lucide-react';

export function AdminBooklets() {
  const booklets = [
    { id: 'CAS-001', title: 'CAS Test Booklet', department: 'CAS', available: 867, total: 1000 },
    { id: 'COENG-001', title: 'COENG Test Booklet', department: 'COENG', available: 450, total: 500 },
    { id: 'CIT-001', title: 'CIT Test Booklet', department: 'CIT', available: 200, total: 300 },
    { id: 'COED-001', title: 'COED Test Booklet', department: 'COED', available: 150, total: 200 },
  ];

  return (
    <div className="max-w-[1200px] w-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 mb-1 tracking-tight">Manage Booklets</h1>
          <p className="text-gray-500 text-[15px]">View and manage test booklet inventory across departments.</p>
        </div>
        
        <button className="px-5 h-10 text-[14px] font-bold text-white bg-[#1d4ed8] hover:bg-blue-800 rounded-lg transition-colors shadow-sm">
          + Add New Booklet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {booklets.map((booklet, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f4f7fb] rounded-lg flex items-center justify-center shrink-0 border border-blue-50/50">
                  <BookOpen className="w-6 h-6 text-[#1d4ed8]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-[16px] text-gray-900">{booklet.title}</h3>
                  <span className="text-[13px] text-gray-500">Dept: {booklet.department} • ID: {booklet.id}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Inventory</span>
                <span className="text-[14px] font-bold text-gray-900">{booklet.available} <span className="text-gray-400 font-normal">/ {booklet.total}</span></span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#137333] rounded-full"
                  style={{ width: `${(booklet.available / booklet.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
