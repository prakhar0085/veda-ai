'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Sparkles } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      label: 'Assignments',
      icon: FileText,
      href: '/dashboard'
    }
  ];

  return (
    <aside className="w-64 h-full bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="flex flex-col gap-8">
        
        {/* Figma Logo Section */}
        <div className="flex items-center px-2 py-1">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#f97316] to-[#dc2626] flex items-center justify-center shadow-md shadow-orange-500/20">
            <span className="font-extrabold text-white text-xl tracking-tight">V</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 ml-3 tracking-tight">
            VedaAI
          </h2>
        </div>

        {/* Figma Sparkly Action Button */}
        <Link href="/dashboard/create">
          <button className="w-full relative group overflow-hidden bg-zinc-900 hover:bg-black text-white rounded-full py-3.5 px-6 text-sm font-semibold flex items-center justify-center gap-2 border-2 border-orange-500/80 transition-all duration-200 shadow-lg shadow-orange-500/10 active:scale-98 cursor-pointer">
            <Sparkles size={16} className="text-white fill-white animate-pulse" />
            <span>Create Assignment</span>
          </button>
        </Link>

        {/* Figma Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            // Logic for active tab:
            // "Assignments" maps to '/dashboard'. It is active if path is exactly '/dashboard' or starts with '/dashboard/papers'
            const isActive = item.href === '/dashboard' 
              ? (pathname === '/dashboard' || pathname.startsWith('/dashboard/papers') || pathname.startsWith('/dashboard/create'))
              : pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#f3f4f6] text-gray-900 font-semibold'
                    : 'text-[#7c8b9a] hover:text-gray-900 hover:bg-gray-50/50'
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-colors duration-200 shrink-0 ${
                    isActive ? 'text-gray-800' : 'text-[#7c8b9a] group-hover:text-gray-600'
                  }`}
                />
                <span className="tracking-tight">{item.label}</span>
                {item.label === 'My Library' && (
                  <span className="ml-auto bg-[#f97316] text-white rounded-lg text-[10px] px-2 py-0.5 font-bold leading-none select-none">
                    32
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Figma Footer Actions */}
      <div className="flex flex-col gap-4">

        {/* Figma School Profile Widget */}
        <div className="rounded-2xl bg-[#f3f4f6]/80 p-3 flex items-center gap-3 border border-gray-100/50">
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-orange-100 flex items-center justify-center shrink-0 border border-orange-200">
            {/* High-quality vector monkey-like avatar representation */}
            <svg className="w-8 h-8 text-orange-600" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="14" fill="#fed7aa" />
              {/* Ears */}
              <circle cx="6" cy="18" r="4" fill="#fdba74" />
              <circle cx="30" cy="18" r="4" fill="#fdba74" />
              {/* Hair/Helmet outline */}
              <path d="M6 16C6 9.37258 11.3726 4 18 4C24.6274 4 30 9.37258 30 16V18H6V16Z" fill="#b45309" />
              {/* Inner Face */}
              <path d="M10 17C10 13.134 13.5817 10 18 10C22.4183 10 26 13.134 26 17C26 20.866 22.4183 24 18 24C13.5817 24 10 20.866 10 17Z" fill="#ffedd5" />
              {/* Cheeks */}
              <circle cx="13" cy="19" r="1.5" fill="#fca5a5" />
              <circle cx="23" cy="19" r="1.5" fill="#fca5a5" />
              {/* Eyes */}
              <ellipse cx="14.5" cy="16.5" rx="1.5" ry="2" fill="#1e293b" />
              <ellipse cx="21.5" cy="16.5" rx="1.5" ry="2" fill="#1e293b" />
              {/* Nose/Muzzle */}
              <path d="M16 19.5C16 18.6716 16.8954 18 18 18C19.1046 18 20 18.6716 20 19.5C20 20.3284 19.1046 21 18 21C16.8954 21 16 20.3284 16 19.5Z" fill="#fdba74" />
              <path d="M17.5 19.5H18.5" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
              {/* Smile */}
              <path d="M16 21C16 22 17 22.5 18 22.5C19 22.5 20 22 20 21" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="overflow-hidden min-w-0">
            <h4 className="text-xs font-bold text-gray-900 truncate tracking-tight leading-tight">
              Delhi Public School
            </h4>
            <p className="text-[10px] text-gray-500 font-medium truncate leading-none mt-0.5">
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
