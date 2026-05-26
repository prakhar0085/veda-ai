'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Zustand stores
import { useAssignmentStore } from '../../../../store/useAssignmentStore';

// UI components
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Loader } from '../../../../components/ui/Loader';

// Icons & Animations
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Download, 
  Printer, 
  Copy, 
  RotateCw, 
  FileText,
  Clock,
  Award,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function PaperDetailsPage() {
  const params = useParams();
  const router = useRouter();

  // Zustand Store
  const { 
    activeAssignment, 
    loading, 
    fetchAssignmentById,
    createAssignment,
    isGenerating,
    generationProgress,
    generationMessage,
    generationError,
    resetGenerationState
  } = useAssignmentStore();

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      fetchAssignmentById(id).catch(() => {
        router.push('/dashboard');
      });
    }
  }, [id, fetchAssignmentById, router]);

  // Toast Notification triggers
  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const toastId = Date.now();
    setToasts(prev => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 3000);
  };

  if (loading || !activeAssignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
        <svg className="animate-spin h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-semibold text-zinc-400">Loading Academic Paper Specs...</span>
      </div>
    );
  }

  const { title, subject, gradeLevel, difficulty, sections = [], pdfPath } = activeAssignment;

  // Calculate statistics
  let totalQuestions = 0;
  let totalPoints = 0;
  sections.forEach((sec) => {
    totalQuestions += sec.questions.length;
    sec.questions.forEach((q) => {
      totalPoints += q.marks;
    });
  });

  const estimatedTime = totalQuestions * 5;

  // Action 1: Print Examination
  const handlePrint = () => {
    addToast('🖨️ Opening print menu...', 'info');
    window.print();
  };

  // Action 2: Copy Raw Exam Text
  const handleCopy = () => {
    let text = `==================================================\n`;
    text += `         VEDAAI COGNITIVE EXAMINATION PORTAL       \n`;
    text += `==================================================\n\n`;
    text += `Assignment: ${title.toUpperCase()}\n`;
    text += `Subject: ${subject} • Grade Class: ${gradeLevel}\n`;
    text += `Weight: ${totalPoints} Marks • Duration: ${estimatedTime} Minutes\n\n`;
    text += `--------------------------------------------------\n`;
    text += `Student Name: ____________________________________\n`;
    text += `Roll Number: _________________ Section: __________\n`;
    text += `--------------------------------------------------\n\n`;

    sections.forEach((section, sIdx) => {
      text += `\n${section.sectionTitle.toUpperCase()}\n`;
      text += `Instructions: ${section.instruction}\n`;
      text += `--------------------------------------------------\n`;

      section.questions.forEach((q, qIdx) => {
        text += `${qIdx + 1}. ${q.question}   [${q.marks} Marks]\n\n`;
      });
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      addToast('📋 Paper text copied to clipboard successfully!', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Action 3: Re-generate Assignment Spec
  const handleRegenerate = async () => {
    try {
      addToast('🔄 Re-enqueuing generation request to worker...', 'info');
      const payload = {
        title,
        subject,
        gradeLevel: activeAssignment?.gradeLevel || '10',
        topics: activeAssignment?.topics || [subject || 'General'],
        difficulty,
        questionType: activeAssignment?.questionType || 'mixed',
        numberOfQuestions: totalQuestions,
        additionalInstructions: activeAssignment?.additionalInstructions || ''
      };

      const newId = await createAssignment(payload as any);
      router.push(`/dashboard/papers/${newId}`);
    } catch (err: any) {
      addToast(`❌ Error: ${err.message || 'Regeneration failed'}`, 'error');
    }
  };

  // Action 4: Download PDF
  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      addToast('📄 Fetching PDF document from fileserver...', 'info');
      
      // Simulate small download latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const link = document.createElement('a');
      link.href = `http://localhost:5000/api/assignments/${activeAssignment._id}/pdf`;
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-assignment.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('🎉 PDF downloaded successfully!', 'success');
      setDownloading(false);
    } catch (err: any) {
      addToast('❌ PDF not compiled yet or Redis offline', 'error');
      setDownloading(false);
    }
  };

  const getBadgeStyle = (level: 'easy' | 'medium' | 'hard') => {
    return {
      easy: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      hard: 'bg-rose-100 text-rose-800 border-rose-200'
    }[level];
  };

  return (
    <div className="min-h-screen pb-24 relative print:pb-0 print:bg-white print:text-black">
      
      {/* CORNER TOAST NOTIFICATIONS */}
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

      {/* Dynamic Queue Process Overlays */}
      <AnimatePresence>
        {isGenerating && (
          <Loader progress={generationProgress} message={generationMessage} />
        )}
      </AnimatePresence>

      {/* back navigation link */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-6 print:hidden">
        <Link href="/dashboard">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-zinc-900/50 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <ChevronLeft size={14} /> Back to Workspace
          </button>
        </Link>
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">
          VedaAI Exam Publisher v2.0
        </span>
      </div>

      <AnimatePresence mode="wait">
        {!isGenerating && !generationError ? (
          /* HIGH-FIDELITY PRINTABLE ASSESSMENTS PAPER CONTAINER */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-4xl mx-auto bg-white text-zinc-900 shadow-2xl rounded-2xl p-10 border border-zinc-200/60 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-full font-serif"
          >
            
            {/* 1. ACADEMIC SHEET HEADER */}
            <div className="text-center border-b-2 border-zinc-900 pb-5 mb-6">
              <h1 className="text-xl md:text-2xl font-extrabold tracking-wider text-zinc-950 font-sans uppercase">
                VEDAAI COGNITIVE EXAMINATION PORTAL
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 font-sans tracking-widest mt-1">
                ACADEMIC PERFORMANCE ASSESSMENT DIVISION
              </p>

              <h2 className="text-base font-black tracking-wide text-zinc-800 mt-4 uppercase font-sans">
                {title}
              </h2>
              <p className="text-[11px] font-bold text-zinc-500 mt-1 uppercase font-sans">
                Subject: {subject} • Evaluation Level: Grade {gradeLevel}
              </p>
            </div>

            {/* 2. CLASSROOM CREDENTIALS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 border border-zinc-300 p-4 rounded-xl text-xs font-semibold text-zinc-700 mb-6 bg-zinc-50/50 print:bg-white print:border-zinc-300">
              <div className="sm:col-span-3 pb-1 border-b border-dashed border-zinc-200">
                Name: <span className="border-b border-zinc-400 inline-block w-[80%] h-4 ml-1"></span>
              </div>
              <div>
                Roll Number: <span className="border-b border-zinc-400 inline-block w-[60%] h-4 ml-1"></span>
              </div>
              <div>
                Section Class: <span className="border-b border-zinc-400 inline-block w-[60%] h-4 ml-1"></span>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 text-[11px] font-extrabold text-zinc-900 sm:col-span-1">
                <span>Marks: {totalPoints} Pts</span>
                <span>Time: {estimatedTime} Mins</span>
              </div>
            </div>

            {/* 3. SECTIONS LOOP */}
            <div className="flex flex-col gap-8 mt-8">
              {sections.map((section, sIdx) => (
                <div key={sIdx} className="flex flex-col gap-4 border-b border-zinc-200 pb-6 last:border-b-0 last:pb-0 print:page-break-inside-avoid">
                  
                  {/* Section Title */}
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-1.5 print:border-zinc-300">
                    <h3 className="text-sm font-extrabold text-zinc-950 font-sans tracking-wide uppercase">
                      {section.sectionTitle}
                    </h3>
                  </div>

                  {/* Section instructions */}
                  {section.instruction && (
                    <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-600 leading-relaxed italic print:bg-zinc-50 print:border-zinc-300">
                      <span className="font-bold text-zinc-800 block mb-0.5 font-sans not-italic">Instructions:</span>
                      {section.instruction}
                    </div>
                  )}

                  {/* Questions inside Section */}
                  <div className="flex flex-col gap-6 mt-2">
                    {section.questions.map((q, qIdx) => (
                      <div key={qIdx} className="flex flex-col gap-2 relative">
                        
                        {/* Question headline */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex gap-2">
                            <span className="font-bold text-zinc-950 text-sm">{qIdx + 1}.</span>
                            <p className="text-sm text-zinc-800 leading-relaxed font-sans text-left">
                              {q.question}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 print:gap-1.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase font-sans print:hidden ${getBadgeStyle(q.difficulty)}`}>
                              {q.difficulty}
                            </span>
                            <span className="text-xs font-bold text-zinc-950 whitespace-nowrap font-sans">
                              [{q.marks} Marks]
                            </span>
                          </div>
                        </div>

                        {/* Standard writing lines for questions */}
                        {sIdx > 0 && (
                          <div className="pl-6 flex flex-col gap-2 mt-2">
                            <div className="h-0.5 border-b border-dashed border-zinc-200 w-full" />
                            {q.marks >= 5 && (
                              <>
                                <div className="h-0.5 border-b border-dashed border-zinc-200 w-full mt-2" />
                                <div className="h-0.5 border-b border-dashed border-zinc-200 w-full mt-2" />
                              </>
                            )}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>

            {/* Printable Footnote */}
            <div className="mt-12 pt-4 border-t-2 border-zinc-900 text-center text-[9px] font-semibold text-zinc-400 font-sans tracking-widest uppercase">
              End of Examination Paper • compiled via VedaAI Engine
            </div>

          </motion.div>
        ) : (
          /* QUEUE PROCESS ERROR HANDLE */
          <motion.div
            key="creation-error"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mx-auto py-12"
          >
            <Card className="border-red-500/20 bg-red-950/5 p-8 flex flex-col items-center justify-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-5">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Regeneration Halt</h3>
              
              <div className="mt-3 px-4 py-3 rounded-lg bg-zinc-950 border border-red-500/10 w-full mb-6">
                <p className="text-red-400 text-xs font-semibold leading-relaxed break-words text-left">
                  Error details: {generationError}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetGenerationState();
                    router.push('/dashboard');
                  }}
                >
                  Dashboard Hub
                </Button>
                <Button variant="primary" onClick={handleRegenerate}>
                  Retry Process
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIGMA FLOATING GLASS STICKY ACTION BAR */}
      {!isGenerating && !generationError && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full px-5 py-3 shadow-2xl flex items-center gap-3 print:hidden">
          <Button
            variant="glass"
            size="sm"
            onClick={handleCopy}
            icon={copied ? <CheckCircle size={13} className="text-teal-400" /> : <Copy size={13} />}
          >
            {copied ? 'Copied!' : 'Copy Paper'}
          </Button>

          <Button
            variant="glass"
            size="sm"
            onClick={handleRegenerate}
            icon={<RotateCw size={13} />}
          >
            Regenerate
          </Button>

          <Button
            variant="glass"
            size="sm"
            onClick={handlePrint}
            icon={<Printer size={13} />}
          >
            Print
          </Button>

          <Button
            variant="primary"
            size="sm"
            loading={downloading}
            onClick={handleDownloadPDF}
            icon={<Download size={13} />}
          >
            {downloading ? 'Compiling...' : 'Download PDF'}
          </Button>
        </div>
      )}

    </div>
  );
}
