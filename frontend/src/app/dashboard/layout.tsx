import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen bg-[#f3f4f6] text-gray-900 flex overflow-hidden p-4 md:p-6 gap-6 font-sans">
      {/* Figma White Sidebar */}
      <Sidebar />
      
      {/* Right Content Panel */}
      <div className="flex-1 flex flex-col gap-5 overflow-hidden">
        {/* Figma Header Panel */}
        <Navbar />
        
        {/* Scrollable Subpage Content Canvas */}
        <main className="flex-1 overflow-y-auto no-scrollbar rounded-2xl">
          {children}
        </main>
      </div>
    </div>
  );
}

