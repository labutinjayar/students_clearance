import React from 'react';
import { ShieldCheck, UserCheck, GraduationCap, CheckCircle2 } from 'lucide-react';

export function About() {
  return (
    <div className="flex-1 bg-gradient-to-br from-sky-100 via-sky-50 to-sky-200/70 flex flex-col justify-between">
      <section className="px-6 md:px-12 lg:px-24 py-16 md:py-24 max-w-7xl mx-auto flex flex-col">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-950 border border-yellow-500 text-xs font-black px-3 py-1 rounded-full uppercase mb-4 shadow-2xs">
            Institutional Clearance Framework
          </div>
          <h1 className="text-4xl lg:text-[48px] font-black text-sky-950 tracking-tight mb-4">
            About <span className="text-yellow-700 underline decoration-yellow-400 decoration-4 underline-offset-4">SSU Clearance</span> Portal
          </h1>
          <p className="text-lg text-sky-900/80 font-medium leading-relaxed">
            Making Samar State University's academic semester clearance and faculty signature authorization systematic, auditable, and entirely digital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-sky-200/80 shadow-xs hover:border-yellow-400 transition-all flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-yellow-400 text-yellow-950 rounded-2xl font-black shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sky-950 text-lg leading-tight">Purpose of the System</h3>
            </div>
            <p className="text-sky-900/80 text-sm font-medium leading-relaxed">
              SSU Clearance is Samar State University's official digital platform created to eliminate physical signature queues by enabling students to submit digital clearance requests directly to designated course instructors.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-sky-200/80 shadow-xs hover:border-yellow-400 transition-all flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-yellow-400 text-yellow-950 rounded-2xl font-black shadow-2xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sky-950 text-lg leading-tight">Benefits for Students</h3>
            </div>
            <p className="text-sky-900/80 text-sm font-medium leading-relaxed">
              Guarantees zero physical queues. Students can submit clearance requests 24/7, monitor real-time instructor review statuses, and download official verified clearance forms once all subjects are signed.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-sky-200/80 shadow-xs hover:border-yellow-400 transition-all flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-yellow-400 text-yellow-950 rounded-2xl font-black shadow-2xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sky-950 text-lg leading-tight">Benefits for Instructors</h3>
            </div>
            <p className="text-sky-900/80 text-sm font-medium leading-relaxed">
              Allows instructors and department chairs to review student submissions, enter grades, and record drawn signatures with timestamps.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-sky-200/80 shadow-xs hover:border-yellow-400 transition-all flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-yellow-400 text-yellow-950 rounded-2xl font-black shadow-2xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sky-950 text-lg leading-tight">How It Helps SSU</h3>
            </div>
            <p className="text-sky-900/80 text-sm font-medium leading-relaxed">
              Ensures strict compliance and institutional accountability. Features tamper-proof SHA-256 digital signature hashes and complete administrative audit ledgers for the university registrar.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-xs border-t-2 border-sky-200 pt-16 pb-8 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
            <div className="max-w-md">
              <h4 className="font-black text-sky-950 mb-2">Samar State University</h4>
              <p className="text-sky-900/80 text-sm font-medium leading-relaxed">
                Online Student Clearance & Digital Signature Portal. Simplifying academic distribution workflows with robust traceability.
              </p>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-sm font-black text-yellow-800 hover:text-yellow-950 transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm font-black text-yellow-800 hover:text-yellow-950 transition-colors">Terms of Use</a>
              <a href="#" className="text-sm font-black text-yellow-800 hover:text-yellow-950 transition-colors">Academic Affairs</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-sky-100 text-xs text-sky-800/80 font-bold">
            <p>© {new Date().getFullYear()} SSU Office of Academic Affairs. Online Student Clearance Portal. All rights reserved.</p>
            <p className="mt-4 md:mt-0">Samar State University • Catbalogan City, Samar</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
