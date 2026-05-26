'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '../../store/useAssessmentStore';
import { assessmentService } from '../../services/api';
import { Card } from '../../components/ui/card';
import { 
  FileText, 
  Award, 
  Clock,
  Plus,
  MoreVertical,
  Search,
  Filter,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function DashboardPage() {
  const { assessments, loading, fetchAssessments, deleteAssessment } = useAssessmentStore();
  const router = useRouter();

  // Local state for dropdown menus, searches, and filters
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // Click outside to close the three-dots dropdown menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const toastId = Date.now();
    setToasts(prev => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 3000);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    try {
      addToast('🗑️ Deleting assignment Spec...', 'info');
      await deleteAssessment(id);
      addToast('🎉 Assignment deleted successfully!', 'success');
    } catch (err: any) {
      addToast(`❌ Delete failed: ${err.message || 'Error occurred'}`, 'error');
    }
  };

  const totalAssessments = assessments.length;

  // Filter & Search assessments matrix
  const filteredAssessments = assessments.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const subjectMatch = item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || subjectMatch;
    const matchesFilter = filterSubject ? item.subject.toLowerCase() === filterSubject.toLowerCase() : true;
    return matchesSearch && matchesFilter;
  });

  // Extract unique subjects for filter dropdown values
  const uniqueSubjects = Array.from(new Set(assessments.map(a => a.subject)));

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-24 relative select-none">
      
      {/* Toast popup notifications */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full print:hidden">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-xl pointer-events-auto w-full ${
                toast.type === 'success'
                  ? 'bg-zinc-950 border-teal-500/30 text-teal-400'
                  : toast.type === 'error'
                    ? 'bg-zinc-950 border-red-500/30 text-red-400'
                    : 'bg-zinc-950 border-indigo-500/30 text-indigo-400'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle size={16} className="shrink-0" />
              ) : toast.type === 'error' ? (
                <AlertTriangle size={16} className="shrink-0" />
              ) : (
                <Info size={16} className="shrink-0" />
              )}
              <span className="text-xs font-semibold leading-normal">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Figma Header Title block */}
      <div className="flex items-center gap-3.5 mb-1 px-1">
        <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-none">
            Assignments
          </h2>
          <p className="text-gray-500 text-xs font-semibold mt-1">
            Manage and create assignments for your classes.
          </p>
        </div>
      </div>

      {/* PRIMARY CANVAS AREA */}
      <div className="flex-1 flex flex-col min-h-[450px]">

        {loading && totalAssessments === 0 ? (
          /* SKELETON RENDER */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} className="animate-pulse bg-white border border-gray-100/80 rounded-3xl p-6 flex flex-col justify-between min-h-[160px]">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="flex justify-between items-center mt-6">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : totalAssessments === 0 ? (
          /* FIGMA EXACT EMPTY STATE DESIGN */
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 rounded-[2rem] bg-white border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)] text-center">
            {/* Vector circular SVG representation */}
            <div className="w-64 h-64 relative flex items-center justify-center select-none">
              <svg className="w-full h-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="120" cy="120" r="85" fill="#f8fafc" />
                <circle cx="120" cy="120" r="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M50 80 C 45 110, 75 115, 60 135" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="178" cy="115" r="4.5" fill="#3b82f6" />
                <path d="M138 132 L141 138 L147 141 L141 144 L138 150 L135 144 L129 141 L135 138 Z" fill="#6366f1" />
                <g filter="drop-shadow(0px 4px 10px rgba(0,0,0,0.02))">
                  <rect x="150" y="70" width="32" height="18" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                  <circle cx="158" cy="79" r="3.5" fill="#cbd5e1" />
                  <rect x="166" y="77" width="10" height="4" rx="1.5" fill="#cbd5e1" />
                </g>
                <g transform="rotate(-6, 120, 115)">
                  <rect x="90" y="65" width="58" height="78" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                  <rect x="98" y="76" width="22" height="4.5" rx="1.5" fill="#334155" />
                  <rect x="98" y="87" width="42" height="3" rx="1" fill="#cbd5e1" />
                  <rect x="98" y="96" width="34" height="3" rx="1" fill="#cbd5e1" />
                  <rect x="98" y="105" width="40" height="3" rx="1" fill="#cbd5e1" />
                  <rect x="98" y="114" width="28" height="3" rx="1" fill="#cbd5e1" />
                </g>
                <g filter="drop-shadow(0px 8px 24px rgba(0,0,0,0.06))">
                  <circle cx="130" cy="115" r="28" fill="#ffffff" fillOpacity="0.4" stroke="#cbd5e1" strokeWidth="3" />
                  <path d="M107 105 A 25 25 0 0 1 148 97" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M120 105 L140 125" stroke="#ef4444" strokeWidth="5.5" strokeLinecap="round" />
                  <path d="M140 105 L120 125" stroke="#ef4444" strokeWidth="5.5" strokeLinecap="round" />
                  <rect x="148.5" y="132" width="9" height="26" rx="4" transform="rotate(-40, 148.5, 132)" fill="#cbd5e1" stroke="#e2e8f0" strokeWidth="1" />
                  <rect x="151.5" y="138" width="4" height="15" rx="1.5" transform="rotate(-40, 151.5, 138)" fill="#e2e8f0" />
                </g>
              </svg>
            </div>
            <h4 className="text-lg font-bold text-gray-900 tracking-tight mt-1">
              No assignments yet
            </h4>
            <p className="text-gray-500 text-xs max-w-sm mt-2 mb-6 px-4 leading-relaxed font-medium">
              Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
            </p>
            <Link href="/dashboard/create">
              <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-md cursor-pointer transition-all">
                <Plus size={14} className="stroke-[2.5]" />
                <span>Create Your First Assignment</span>
              </button>
            </Link>
          </div>
        ) : (
          /* FIGMA 2-COLUMN PREMIUM ASSIGNMENTS GRID */
          <div className="flex flex-col gap-5 mt-1.5">
            {/* Filter Bar with funnels & Search queries */}
            <div className="w-full bg-white rounded-2xl p-3 px-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-gray-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
              {/* Filter By Selection */}
              <div className="flex items-center gap-2.5 text-xs font-bold text-[#7c8b9a]">
                <Filter size={15} className="text-[#7c8b9a]" />
                <span>Filter By</span>
                <div className="relative">
                  <select 
                    value={filterSubject || ''}
                    onChange={(e) => setFilterSubject(e.target.value || null)}
                    className="bg-[#f3f4f6]/70 focus:bg-[#f3f4f6] rounded-xl py-1.5 pl-3.5 pr-8 text-[11px] font-bold text-gray-800 outline-none border border-transparent cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 8px center',
                      backgroundSize: '12px'
                    }}
                  >
                    <option value="">All Subjects</option>
                    {uniqueSubjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Assignment Field */}
              <div className="relative flex items-center w-full sm:w-64">
                <Search size={14} className="text-gray-400 absolute left-3.5 pointer-events-none" />
                <input 
                  type="text" 
                  placeholder="Search Assignment" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border border-gray-200/80 focus:border-gray-300 rounded-full py-1.5 pl-9 pr-4 text-xs font-medium text-gray-800 placeholder-gray-400 outline-none w-full transition-all"
                />
              </div>
            </div>

            {/* Assignments Matrix Lists */}
            {filteredAssessments.length === 0 ? (
              <div className="text-center py-16 text-xs font-semibold text-gray-400 select-none">
                No matching assignments found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-1.5" ref={dropdownRef}>
                {filteredAssessments.map((item) => {
                  const assignedDate = new Date(item.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }).replace(/\//g, '-');

                  // Format due date elegantly or supply Figma default
                  let dueDate = '21-06-2025';
                  if (item.updatedAt) {
                    dueDate = new Date(item.updatedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }).replace(/\//g, '-');
                  }

                  const isMenuOpen = activeMenuId === item._id;

                  return (
                    <div 
                      key={item._id} 
                      onClick={() => router.push(`/dashboard/papers/${item._id}`)}
                      className="bg-white border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)] rounded-3xl p-6 relative flex flex-col justify-between min-h-[160px] hover:shadow-md hover:translate-y-[-1px] transition-all duration-200 cursor-pointer overflow-visible"
                    >
                      {/* Top Section */}
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="text-base font-bold text-gray-900 tracking-tight leading-snug line-clamp-2 text-left">
                          {item.title}
                        </h4>
                        
                        {/* More Actions Three-dots */}
                        <div className="relative shrink-0 overflow-visible z-20">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : item._id);
                            }}
                            className="h-8 w-8 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer shrink-0"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {/* Figma Actions popup menu */}
                          <AnimatePresence>
                            {isMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-9 bg-white shadow-xl border border-gray-100 rounded-2xl p-1.5 z-40 w-36 flex flex-col shadow-gray-200/50"
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/papers/${item._id}`);
                                  }}
                                  className="flex items-center gap-2 text-left text-[11px] font-bold text-gray-800 p-2 py-2 hover:bg-[#f3f4f6]/80 rounded-xl cursor-pointer w-full transition-all"
                                >
                                  <Eye size={13} className="text-gray-500" />
                                  <span>View Assignment</span>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(item._id, e)}
                                  className="flex items-center gap-2 text-left text-[11px] font-bold text-red-500 p-2 py-2 hover:bg-red-50 rounded-xl cursor-pointer w-full transition-all"
                                >
                                  <Trash2 size={13} className="text-red-500" />
                                  <span>Delete</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Bottom Section */}
                      <div className="flex items-center justify-between text-[11px] tracking-tight border-t border-gray-50 pt-4 mt-6">
                        <span className="text-gray-400 font-semibold uppercase">
                          <span className="text-gray-700 font-bold">Assigned on :</span> {assignedDate}
                        </span>
                        
                        <span className="text-gray-400 font-semibold uppercase">
                          <span className="text-gray-700 font-bold">Due :</span> {dueDate}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Figma Bottom centered floating Create Assignment pill action button */}
            <div className="w-full flex justify-center mt-6">
              <Link href="/dashboard/create">
                <button className="flex items-center gap-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold px-6 py-3.5 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer">
                  <Plus size={14} className="stroke-[2.5]" />
                  <span>Create Assignment</span>
                </button>
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
