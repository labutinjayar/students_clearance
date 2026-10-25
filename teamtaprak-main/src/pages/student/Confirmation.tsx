import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export function Confirmation() {
  return (
    <div className="max-w-[600px] mx-auto w-full pt-10">
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-10 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h1>
        <p className="text-gray-500 mb-8">
          Your signature request has been successfully sent to your instructor. You will be notified once they have reviewed it.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            to="/student/history"
            className="px-6 py-3 text-[14px] font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
          >
            View History
          </Link>
          <Link 
            to="/student/dashboard"
            className="px-6 py-3 text-[14px] font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
