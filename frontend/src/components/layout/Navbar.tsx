'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Grid, 
  Bell, 
  ChevronDown, 
  Menu,
  X,
  Sparkles,
  Users,
  FileText,
  Laptop,
  Clock,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Home', icon: Grid, href: '/dashboard/home' },
    { label: 'My Groups', icon: Users, href: '/dashboard/groups' },
    { label: 'Assignments', icon: FileText, href: '/dashboard' },
    { label: 'AI Teacher\'s Toolkit', icon: Laptop, href: '/dashboard/toolkit' },
    { label: 'My Library', icon: Clock, href: '/dashboard/library' }
  ];

  const handleBack = () => {
    // Navigate back or fallback to dashboard
    if (pathname === '/dashboard') {
      router.push('/');
    } else {
      router.back();
    }
  };

  // Determine breadcrumb text based on pathname
  let breadcrumbName = 'Assignment';
  if (pathname.includes('/create')) {
    breadcrumbName = 'Create Assignment';
  } else if (pathname.includes('/papers/')) {
    breadcrumbName = 'View Assignment';
  }

  return (
    <>
      <header className="w-full bg-white rounded-2xl p-3 px-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 flex items-center justify-between z-30 shrink-0">
        
        {/* Left Section: Back action & breadcrumbs */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-[#7c8b9a] transition-all cursor-pointer"
          >
            <Menu size={20} />
          </button>

          <button 
            onClick={handleBack}
            className="h-9 w-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-1.5 ml-1 text-gray-400 text-sm font-semibold select-none">
            <Grid size={15} className="text-gray-400" />
            <span className="tracking-tight">{breadcrumbName}</span>
          </div>
        </div>

        {/* Right Section: Notification & User profile */}
        <div className="flex items-center gap-3">
          {/* Figma notification bell with red dot */}
          <button className="h-9 w-9 rounded-full bg-transparent flex items-center justify-center text-[#7c8b9a] hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer relative shrink-0">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#dc2626] rounded-full border border-white" />
          </button>

          {/* Figma Profile bar */}
          <div className="flex items-center ml-2 pl-4 border-l border-gray-200 py-1 cursor-pointer group select-none">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center border border-orange-200 shrink-0">
              <svg className="w-6.5 h-6.5 text-orange-600" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="14" fill="#fed7aa" />
                <path d="M18 4C24.6274 4 30 9.37258 30 16C30 22.6274 24.6274 28 18 28C11.3726 28 6 22.6274 6 16C6 9.37258 11.3726 4 18 4Z" fill="#fdba74" />
                <path d="M10 22C10 18.134 13.5817 15 18 15C22.4183 15 26 18.134 26 22V28H10V22Z" fill="#f97316" />
                <circle cx="18" cy="11" r="4.5" fill="#fed7aa" />
              </svg>
            </div>
            
            <div className="hidden sm:flex flex-col ml-2.5 items-start">
              <span className="text-xs font-bold text-gray-900 tracking-tight leading-tight group-hover:text-gray-700 transition-colors">
                John Doe
              </span>
            </div>

            <ChevronDown size={14} className="text-[#7c8b9a] ml-1.5 shrink-0 group-hover:text-gray-600 transition-colors" />
          </div>
        </div>
      </header>

      {/* Responsive Slide-out Sidebar Drawer on Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/40 backdrop-blur-xs transition-opacity duration-300">
          <div className="w-64 bg-white h-full p-5 flex flex-col justify-between shadow-2xl animate-slide-in relative">
            {/* Close Button */}
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-[#7c8b9a] hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-8">
              {/* Logo Section */}
              <div className="flex items-center px-2 py-1">
                <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#f97316] to-[#dc2626] flex items-center justify-center shadow-md shadow-orange-500/20">
                  <span className="font-extrabold text-white text-base tracking-tight">V</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 ml-2.5 tracking-tight">
                  VedaAI
                </h2>
              </div>

              {/* Action Button */}
              <Link href="/dashboard/create" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full relative group overflow-hidden bg-zinc-900 text-white rounded-full py-3 px-5 text-xs font-semibold flex items-center justify-center gap-2 border border-orange-500/80 transition-all cursor-pointer">
                  <Sparkles size={14} className="text-white fill-white" />
                  <span>Create Assignment</span>
                </button>
              </Link>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === '/dashboard' 
                    ? (pathname === '/dashboard' || pathname.startsWith('/dashboard/papers') || pathname.startsWith('/dashboard/create'))
                    : pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-[#f3f4f6] text-gray-900 font-bold'
                          : 'text-[#7c8b9a] hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon
                        size={16}
                        className={`transition-colors shrink-0 ${
                          isActive ? 'text-gray-800' : 'text-[#7c8b9a]'
                        }`}
                      />
                      <span>{item.label}</span>
                      {item.label === 'My Library' && (
                        <span className="ml-auto bg-[#f97316] text-white rounded-lg text-[9px] px-1.5 py-0.5 font-bold leading-none select-none">
                          32
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Footer school profile */}
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2 text-[#7c8b9a] hover:text-gray-900 text-xs font-semibold"
              >
                <Settings size={16} className="text-[#7c8b9a] shrink-0" />
                <span>Settings</span>
              </Link>

              <div className="rounded-xl bg-[#f3f4f6]/80 p-2.5 flex items-center gap-2.5 border border-gray-100">
                <div className="h-8.5 w-8.5 rounded-lg overflow-hidden bg-orange-100 flex items-center justify-center shrink-0">
                  <svg className="w-7 h-7 text-orange-600" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="14" fill="#fed7aa" />
                    <circle cx="6" cy="18" r="4" fill="#fdba74" />
                    <circle cx="30" cy="18" r="4" fill="#fdba74" />
                    <path d="M6 16C6 9.37258 11.3726 4 18 4C24.6274 4 30 9.37258 30 16V18H6V16Z" fill="#b45309" />
                    <path d="M10 17C10 13.134 13.5817 10 18 10C22.4183 10 26 13.134 26 17C26 20.866 22.4183 24 18 24C13.5817 24 10 20.866 10 17Z" fill="#ffedd5" />
                    <circle cx="13" cy="19" r="1" fill="#fca5a5" />
                    <circle cx="23" cy="19" r="1" fill="#fca5a5" />
                    <ellipse cx="14.5" cy="16.5" rx="1.5" ry="2" fill="#1e293b" />
                    <ellipse cx="21.5" cy="16.5" rx="1.5" ry="2" fill="#1e293b" />
                    <path d="M16 19.5C16 18.6716 16.8954 18 18 18C19.1046 18 20 18.6716 20 19.5C20 20.3284 19.1046 21 18 21C16.8954 21 16 20.3284 16 19.5Z" fill="#fdba74" />
                    <path d="M16 21C16 22 17 22.5 18 22.5C19 22.5 20 22 20 21" stroke="#b45309" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="overflow-hidden min-w-0">
                  <h4 className="text-[11px] font-bold text-gray-900 truncate leading-none">
                    Delhi Public School
                  </h4>
                  <p className="text-[9px] text-gray-500 font-medium truncate leading-none mt-1">
                    Bokaro Steel City
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
