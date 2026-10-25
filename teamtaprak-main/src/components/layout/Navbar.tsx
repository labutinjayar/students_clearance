import React from 'react';

export function Navbar() {
  return (
    <nav className="bg-sky-950/95 text-white border-b border-yellow-400/40 py-3 px-3 sm:px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-[0_12px_30px_-18px_rgba(8,47,73,0.8)] relative overflow-hidden backdrop-blur-xl">
      {/* Background watermark seal accent at logo */}
      <div className="absolute -left-6 -top-6 w-32 h-32 opacity-15 pointer-events-none rounded-full overflow-hidden">
        <img src="/ssu_official_logo.png" alt="" className="w-full h-full object-contain" />
      </div>

      <div className="flex items-center gap-2 sm:gap-3.5 relative z-10 min-w-0">
        {/* Official SSU Seal Logo matching user's image with white background badge */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white border-2 border-yellow-400 flex items-center justify-center overflow-hidden shrink-0 shadow-lg ring-2 ring-yellow-300/30 p-0.5 transition-transform duration-300 hover:scale-105 hover:rotate-2">
          <img 
            src="/ssu_official_logo.png" 
            alt="Samar State University Official Logo" 
            className="w-full h-full object-contain" 
          />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-white font-black text-sm sm:text-lg leading-tight uppercase tracking-wider drop-shadow-2xs truncate">SSU Clearance</h1>
            <span className="hidden sm:inline bg-yellow-400 text-yellow-950 border border-yellow-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-2xs">
              Portal
            </span>
          </div>
          <span className="text-[9px] sm:text-[11px] text-sky-100 uppercase font-extrabold tracking-wider truncate">Samar State University</span>
        </div>
      </div>
    </nav>
  );
}
