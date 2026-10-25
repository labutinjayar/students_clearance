import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Mail, ShieldCheck } from 'lucide-react';

export function Support() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const faqs = [
    {
      question: "Who can sign off on my subject clearance requests?",
      answer: "Only the designated faculty instructor assigned to teach your specific course section or the department chairperson can authorize your clearance request with their digital signature."
    },
    {
      question: "How long does instructor signature approval take?",
      answer: "Sign-offs are typically processed within 1-2 business days. You can monitor the real-time status (Pending, Approved, or Returned with remarks) directly on your Clearance Booklet."
    },
    {
      question: "Can an instructor also hold administrative privileges?",
      answer: "Yes! Faculty members with administrative credentials can easily switch between their Instructor Sign-off workspace and the Admin Master Clearance panel using the quick role switcher in the top navigation bar."
    },
    {
      question: "How are instructor signatures and grades recorded?",
      answer: "The assigned instructor enters a grade and submits a drawn signature. The system records the instructor, signature, grade, and submission time with the clearance request. This electronic signature record does not automatically establish legal validity in every context."
    }
  ];

  return (
    <div className="flex-1 bg-gradient-to-br from-sky-100 via-sky-50 to-sky-200/70 flex flex-col justify-between">
      <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24 w-full max-w-[1600px] mx-auto flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Left Column */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-950 border border-yellow-500 text-xs font-black px-3 py-1 rounded-full uppercase mb-4 shadow-2xs self-start">
              Help & Support Desk
            </div>
            <h1 className="text-4xl lg:text-[48px] font-black text-sky-950 tracking-tight mb-4 leading-tight">
              Support & Help
            </h1>
            <p className="text-lg text-sky-900/80 font-medium leading-relaxed mb-10 max-w-sm">
              Frequently asked questions, clearance troubleshooting, and direct academic assistance channels.
            </p>

            <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-8 border-2 border-sky-200/80 shadow-xs">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-yellow-950 flex items-center justify-center shrink-0 font-black shadow-2xs">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sky-950 text-lg">Still need assistance?</h3>
              </div>
              <p className="text-sky-900/80 text-sm font-medium leading-relaxed mb-6">
                For technical issues, subject assignment adjustments, or account authorization concerns, please contact the SSU registrar desk:
              </p>
              <a 
                href="mailto:clearance-support@ssu.edu.ph" 
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border border-yellow-500 font-black text-sm rounded-2xl shadow-2xs transition-colors"
              >
                clearance-support@ssu.edu.ph
              </a>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7">
            <h2 className="text-3xl font-black text-sky-950 mb-8 tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div 
                    key={index} 
                    className="bg-white/95 backdrop-blur-xs rounded-2xl border-2 border-sky-200/80 shadow-xs overflow-hidden transition-all duration-200 cursor-pointer hover:border-yellow-400"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <div className="px-6 py-5">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-black text-sky-950 text-[15px]">{faq.question}</h3>
                        <ChevronDown className={`w-5 h-5 text-yellow-700 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {isOpen && (
                        <div className="mt-4 text-sky-900/80 font-medium text-[14px] leading-relaxed pt-3 border-t border-sky-100">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
