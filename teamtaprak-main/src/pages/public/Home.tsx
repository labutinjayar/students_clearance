import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function Home() {
  return (
    <div className="flex-1 bg-white">
      {/* Hero Section */}
      <section className="px-6 md:px-12 lg:px-24 py-16 md:py-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 max-w-2xl text-center lg:text-left">
          <h1 className="text-4xl lg:text-[56px] leading-[1.1] font-bold text-gray-900 tracking-tight mb-6">
            A smarter way to reserve and manage test booklets
          </h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Simplify the distribution workflow. Samar State University's unified system for tracking, reserving, and securing exam documents across all campus departments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-bold px-8">Get Started</Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-gray-700 border-gray-200 hover:bg-gray-50 font-bold px-8">Learn More</Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 w-full relative">
          {/* Placeholder for the SSU building image */}
          <div className="relative rounded-[32px] overflow-hidden shadow-2xl aspect-[4/3] w-full">
            <img 
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="University Campus" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
          </div>
        </div>
      </section>

      {/* Why Test Booklet Go? */}
      <section className="px-6 md:px-12 lg:px-24 py-20 max-w-7xl mx-auto border-t border-gray-100">
        <div className="mb-12 max-w-3xl">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Why Test Booklet Go?</h2>
          <p className="text-lg text-gray-600">
            Transforming administrative tasks into systematic and auditable digital pipelines.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-shadow">
            <div className="w-10 h-10 bg-blue-600 mb-6 flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20"></div>
            </div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">Easy Reservation</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Instantly reserve secure booklets in just a few simple clicks.</p>
          </div>
          
          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-shadow">
            <div className="w-10 h-10 bg-blue-600 rounded-full mb-6 flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-full"></div>
            </div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">Schedule Management</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Align booklet counts precisely with your scheduled exam slots.</p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-shadow">
            <div className="w-10 h-10 bg-blue-600 mb-6 rounded-tr-xl flex items-center justify-center relative">
              <div className="absolute top-0 right-0 w-3 h-3 bg-white/20 rounded-bl-xl"></div>
            </div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">Request Tracking</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Get real-time tracing from submission to final document pick-up.</p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-shadow">
            <div className="w-10 h-10 bg-blue-600 rounded-md mb-6 flex items-center justify-center"></div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">Organized Records</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Maintain a complete digital registry of academic booklet handovers.</p>
          </div>
        </div>
      </section>

      {/* Three Simple Steps */}
      <section className="bg-gray-50 py-24">
        <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Three Simple Steps</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              SSU Booklet allocations made fully digital in three progressive phases.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0">1</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Login Securely</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Access the reservation portal using your official SSU credentials.</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0">2</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Reserve Booklets</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Select exam parameters, required counts, and assigned coordinators.</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0">3</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Track Progress</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Monitor approval logs and receive alerts when booklets are ready.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
            <div className="max-w-md">
              <h4 className="font-bold text-gray-900 mb-2">Samar State University</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Secure Test Booklet Reservation Portal. Simplifying academic distribution workflows with robust traceability.
              </p>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Terms of Use</a>
              <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Academic Affairs</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 text-xs text-gray-400">
            <p>© 2024 SSU Office of Academic Affairs. Secure Test Booklet Reservation Portal. All rights reserved.</p>
            <p className="mt-4 md:mt-0">Philippine Government Web Template</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
