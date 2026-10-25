import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.16),_transparent_34%),linear-gradient(135deg,_#e0f2fe_0%,_#f8fcff_48%,_#dff7f3_100%)] flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col page-reveal">
        <Outlet />
      </main>
    </div>
  );
}
