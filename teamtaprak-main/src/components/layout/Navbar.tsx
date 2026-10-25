import React from 'react';

export function Navbar() {
  return (
    <nav className="bg-sky-950/95 text-white border-b border-yellow-400/40 py-3 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-[0_12px_30px_-18px_rgba(8,47,73,0.8)] relative overflow-hidden backdrop-blur-xl">
      {/* Background watermark seal accent at logo */}
      <div className="absolute -left-6 -top-6 w-32 h-32 opacity-15 pointer-events-none rounded-full overflow-hidden">
        <img src="/ssu_official_logo.png" alt="" className="w-full h-full object-contain" />
      </div>

      <div className="flex items-center gap-3.5 relative z-10">
        {/* Official SSU Seal Logo matching user's image with white background badge */}
        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-yellow-400 flex items-center justify-center overflow-hidden shrink-0 shadow-lg ring-2 ring-yellow-300/30 p-0.5 transition-transform duration-300 hover:scale-105 hover:rotate-2">
          <img 
            src="/ssu_official_logo.png" 
            alt="Samar State University Official Logo" 
            className="w-full h-full object-contain" 
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-white font-black text-lg leading-tight uppercase tracking-wider drop-shadow-2xs">SSU Clearance</h1>
            <span className="bg-yellow-400 text-yellow-950 border border-yellow-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-2xs">
              Portal
            </span>
          </div>
          <span className="text-[11px] text-sky-100 uppercase font-extrabold tracking-wider">Samar State University</span>
        </div>
      </div>
    </nav>
  );
}
