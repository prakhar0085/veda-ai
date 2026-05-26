'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAssignmentStore } from '../../../../store/useAssignmentStore';
import { assessmentService } from '../../../../services/api';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { QuestionCard } from '../../../../components/ui/QuestionCard';
import { DifficultyBadge } from '../../../../components/ui/DifficultyBadge';
import { 
  ChevronLeft, 
  Download, 
  Printer, 
  Clock, 
  TrendingUp, 
  FileText,
  Award,
  BookOpen
} from 'lucide-react';

export default function PaperDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { activeAssignment, loading, fetchAssignmentById } = useAssignmentStore();

  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      fetchAssignmentById(id).catch(() => {
        // If fail, return to dashboard
        router.push('/dashboard');
      });
    }
  }, [id, fetchAssignmentById, router]);

  if (loading || !activeAssignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
        <svg className="animate-spin h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-semibold text-zinc-400">Loading Assignment Blueprint...</span>
      </div>
    );
  }

  const { title, subject, gradeLevel, difficulty, sections = [], pdfPath } = activeAssignment;

  // Calculate stats
  let totalQuestions = 0;
  let totalPoints = 0;
  sections.forEach((sec) => {
    totalQuestions += sec.questions.length;
    sec.questions.forEach((q) => {
      totalPoints += q.marks;
    });
  });

  const estimatedTime = totalQuestions * 4; // Average 4 minutes per question

  const handlePrint = () => {
    window.print();
  };

  // Direct backend PDF route URL
  const pdfDownloadUrl = `http://localhost:5000/api/assignments/${activeAssignment._id}/pdf`;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 print:bg-white print:text-black">
      
      {/* TOP HUB NAVIGATION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 border border-white/5 transition-all duration-200 cursor-pointer">
              <ChevronLeft size={16} />
            </button>
          </Link>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">
              {subject} • Grade {gradeLevel}
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">
              {title}
            </h2>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            icon={<Printer size={15} />}
            onClick={handlePrint}
          >
            Print
          </Button>

          <a 
            href={pdfDownloadUrl}
            download
            className="inline-block"
          >
            <Button variant="primary" icon={<Download size={15} />}>
              Download PDF
            </Button>
          </a>
        </div>
      </div>

      {/* PRIMARY COLUMN CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: EXAM PREVIEW CANVAS */}
        <div className="lg:col-span-2 flex flex-col gap-6 print:col-span-3">
          <Card className="p-8 bg-zinc-950/40 border border-white/10 print:border-none print:bg-white print:p-0">
            {/* Academic Paper Header */}
            <div className="text-center border-b border-zinc-800/80 pb-6 mb-8 print:border-zinc-300">
              <h3 className="text-lg font-bold text-white tracking-wide print:text-black">
                {title.toUpperCase()}
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-3 text-xs text-zinc-400 font-semibold print:text-zinc-600">
                <span>Subject: {subject}</span>
                <span>•</span>
                <span>Target Level: Grade {gradeLevel}</span>
                <span>•</span>
                <span>Total Items: {totalQuestions} Questions</span>
                <span>•</span>
                <span>Weight: {totalPoints} Points</span>
              </div>
            </div>

            {/* Test Content Sections */}
            <div className="flex flex-col gap-8">
              {sections.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">No sections compiled inside this assignment.</p>
              ) : (
                sections.map((section, sIdx) => (
                  <div key={sIdx} className="flex flex-col gap-4 border-b border-white/5 pb-6 last:border-b-0 print:border-zinc-200">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 print:border-zinc-200">
                      <h4 className="text-sm font-bold text-indigo-400 tracking-wider uppercase print:text-black">
                        {section.sectionTitle}
                      </h4>
                    </div>
                    
                    {section.instruction && (
                      <div className="p-3 bg-zinc-950/60 rounded-lg border border-white/5 text-xs text-zinc-400 leading-normal mb-2 print:bg-zinc-50 print:border-zinc-200 print:text-zinc-600">
                        <span className="font-bold text-zinc-300 block mb-0.5 print:text-black">Instructions:</span>
                        {section.instruction}
                      </div>
                    )}

                    <div className="flex flex-col gap-6">
                      {section.questions.map((q, qIdx) => (
                        <QuestionCard
                          key={qIdx}
                          questionNumber={qIdx + 1}
                          text={q.question}
                          type={q.marks === 2 ? 'mcq' : q.marks === 5 ? 'short' : 'long'}
                          marks={q.marks}
                          correctAnswer={q.marks === 2 ? 'Option A' : 'Review response according to section key.'}
                          explanation={`This question evaluates cognitive conceptual understanding of ${subject}.`}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: TAXONOMY SUMMARY & ACTIONS */}
        <div className="flex flex-col gap-6 print:hidden">
          
          <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
            Cognitive Diagnostics
          </span>

          <Card className="flex flex-col gap-5 bg-zinc-950/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
                <TrendingUp size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide leading-none">Diagnostic Analysis</h4>
                <p className="text-[10px] text-zinc-500 mt-1">Structure specs parsed</p>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 text-xs text-zinc-300 font-medium border-t border-white/5 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Clock size={13} />
                  Time Limit (Est.)
                </span>
                <span className="text-white font-bold">{estimatedTime} Minutes</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Award size={13} />
                  Total Value Weight
                </span>
                <span className="text-indigo-400 font-bold">{totalPoints} Points</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <BookOpen size={13} />
                  Cognitive Density
                </span>
                <span className="text-purple-400 font-bold capitalize">{difficulty} Level</span>
              </div>
            </div>
          </Card>

          {/* PDF files preview widget */}
          {pdfPath && (
            <Card className="bg-zinc-950/40 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-400">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide leading-none">Rendered Document</h4>
                  <p className="text-[10px] text-zinc-500 mt-1">Print-ready PDF layout</p>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 leading-normal">
                This assessment is completely processed. The PDF has been compiled using elegant fonts, double-sheet headers, and divider borders.
              </p>

              <div className="flex flex-col gap-2 mt-2">
                <a 
                  href={pdfDownloadUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full"
                >
                  <Button variant="glass" className="w-full text-xs font-semibold py-2">
                    Open PDF in New Tab
                  </Button>
                </a>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
