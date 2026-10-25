import React from 'react';
import { LogIn, FileSpreadsheet, Send, CheckCircle2, Award } from 'lucide-react';

export function HowItWorks() {
  return (
    <div className="flex-1 bg-gradient-to-br from-sky-100 via-sky-50 to-sky-200/70 flex flex-col justify-between">
      <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24 w-full max-w-[1600px] mx-auto flex-1">
        <div className="max-w-3xl mb-20">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-950 border border-yellow-500 text-xs font-black px-3 py-1 rounded-full uppercase mb-4 shadow-2xs">
            Step-by-Step Clearance Workflow
          </div>
          <h1 className="text-4xl lg:text-[48px] font-black text-sky-950 tracking-tight mb-4">
            How It Works
          </h1>
          <p className="text-lg text-sky-900/80 font-medium leading-relaxed">
            A transparent and structured five-step lifecycle for Samar State University student digital clearance.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line for Desktop */}
          <div className="hidden lg:block absolute top-5 left-10 right-10 h-[3px] bg-yellow-400/70 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col h-full">
              <div className="w-10 h-10 rounded-full border-2 border-yellow-500 bg-yellow-400 text-yellow-950 font-black flex items-center justify-center mb-6 shadow-xs">
                1
              </div>
              <div className="bg-white/95 backdrop-blur-xs p-6 lg:p-5 xl:p-6 rounded-3xl border-2 border-sky-200/80 shadow-xs flex-1 flex flex-col hover:border-yellow-400 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-yellow-400 text-yellow-950 flex items-center justify-center shrink-0 font-black shadow-2xs">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-sky-950 text-[15px] leading-tight">Login to SSU Portal</h3>
                </div>
                <p className="text-sky-900/80 text-[13px] font-medium leading-relaxed">
                  Authenticate using your official student, instructor, or administrator SSU account credentials.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col h-full">
              <div className="w-10 h-10 rounded-full border-2 border-yellow-500 bg-yellow-400 text-yellow-950 font-black flex items-center justify-center mb-6 shadow-xs">
                2
              </div>
              <div className="bg-white/95 backdrop-blur-xs p-6 lg:p-5 xl:p-6 rounded-3xl border-2 border-sky-200/80 shadow-xs flex-1 flex flex-col hover:border-yellow-400 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-yellow-400 text-yellow-950 flex items-center justify-center shrink-0 font-black shadow-2xs">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-sky-950 text-[15px] leading-tight">Select Enrolled Subjects</h3>
                </div>
                <p className="text-sky-900/80 text-[13px] font-medium leading-relaxed">
                  View all active academic subjects requiring clearance and verify the assigned course faculty members.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col h-full">
              <div className="w-10 h-10 rounded-full border-2 border-yellow-500 bg-yellow-400 text-yellow-950 font-black flex items-center justify-center mb-6 shadow-xs">
                3
              </div>
              <div className="bg-white/95 backdrop-blur-xs p-6 lg:p-5 xl:p-6 rounded-3xl border-2 border-sky-200/80 shadow-xs flex-1 flex flex-col hover:border-yellow-400 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-yellow-400 text-yellow-950 flex items-center justify-center shrink-0 font-black shadow-2xs">
                    <Send className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-sky-950 text-[15px] leading-tight">Submit Signature Request</h3>
                </div>
                <p className="text-sky-900/80 text-[13px] font-medium leading-relaxed">
                  Attach optional compliance notes or remarks and submit digital sign-off requests straight to instructors.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col h-full">
              <div className="w-10 h-10 rounded-full border-2 border-yellow-500 bg-yellow-400 text-yellow-950 font-black flex items-center justify-center mb-6 shadow-xs">
                4
              </div>
              <div className="bg-white/95 backdrop-blur-xs p-6 lg:p-5 xl:p-6 rounded-3xl border-2 border-sky-200/80 shadow-xs flex-1 flex flex-col hover:border-yellow-400 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-yellow-400 text-yellow-950 flex items-center justify-center shrink-0 font-black shadow-2xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-sky-950 text-[15px] leading-tight">Faculty Review & Sign</h3>
                </div>
                <p className="text-sky-900/80 text-[13px] font-medium leading-relaxed">
                  Instructors review student requests, submit grades, and record a drawn signature with the submission time.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col h-full">
              <div className="w-10 h-10 rounded-full border-2 border-yellow-500 bg-yellow-400 text-yellow-950 font-black flex items-center justify-center mb-6 shadow-xs">
                5
              </div>
              <div className="bg-white/95 backdrop-blur-xs p-6 lg:p-5 xl:p-6 rounded-3xl border-2 border-sky-200/80 shadow-xs flex-1 flex flex-col hover:border-yellow-400 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-yellow-400 text-yellow-950 flex items-center justify-center shrink-0 font-black shadow-2xs">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-sky-950 text-[15px] leading-tight">Complete Clearance & Print</h3>
                </div>
                <p className="text-sky-900/80 text-[13px] font-medium leading-relaxed">
                  Once 100% of subject instructors sign off, download or print your official stamped university clearance certificate.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-xs border-t-2 border-sky-200 pt-16 pb-8 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1600px] mx-auto">
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
