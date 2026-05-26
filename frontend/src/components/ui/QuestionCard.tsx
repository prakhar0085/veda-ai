'use client';

import React, { useState } from 'react';
import { HelpCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionCardProps {
  questionNumber: number;
  text: string;
  type: 'mcq' | 'short' | 'long';
  marks: number;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  defaultExpanded?: boolean;
}

export const QuestionCard = ({
  questionNumber,
  text,
  type,
  marks,
  options,
  correctAnswer,
  explanation,
  defaultExpanded = false
}: QuestionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="flex flex-col gap-3.5 border-b border-white/5 pb-6 last:border-b-0 print:border-zinc-200 print:page-break-inside-avoid">
      
      {/* Title & Marks Header line */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-2">
          <span className="font-extrabold text-white text-sm print:text-black">
            {questionNumber}.
          </span>
          <p className="text-sm font-medium text-zinc-200 leading-relaxed text-left print:text-black">
            {text}
          </p>
        </div>
        <span className="text-xs font-semibold text-indigo-400 whitespace-nowrap bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 print:text-black print:border-zinc-300">
          [{marks} Marks]
        </span>
      </div>

      {/* Options grid for MCQs */}
      {type === 'mcq' && options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6 mt-1">
          {options.map((opt, oIdx) => {
            const letters = ['A', 'B', 'C', 'D'];
            const isCorrect = correctAnswer === opt || correctAnswer.startsWith(letters[oIdx]) || correctAnswer.endsWith(opt);
            
            return (
              <div 
                key={oIdx} 
                className={`text-xs px-3.5 py-2.5 rounded-lg border font-medium flex items-center gap-2.5 transition-colors ${
                  isExpanded && isCorrect
                    ? 'bg-teal-500/10 border-teal-500/20 text-teal-400 print:bg-zinc-100 print:text-black print:border-zinc-300'
                    : 'bg-zinc-950/60 border-zinc-900 text-zinc-300 print:bg-white print:text-black print:border-zinc-200'
                }`}
              >
                <span className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  isExpanded && isCorrect
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'bg-zinc-900 text-zinc-500'
                }`}>
                  {letters[oIdx]}
                </span>
                <span>{opt}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Writing lines for open-ended queries */}
      {type !== 'mcq' && (
        <div className="pl-6 mt-1 flex flex-col gap-2">
          <div className="h-0.5 border-b border-dashed border-zinc-800/80 w-full mt-2 print:border-zinc-300" />
          {type === 'long' && (
            <>
              <div className="h-0.5 border-b border-dashed border-zinc-800/80 w-full mt-2 print:border-zinc-300" />
              <div className="h-0.5 border-b border-dashed border-zinc-800/80 w-full mt-2 print:border-zinc-300" />
            </>
          )}
        </div>
      )}

      {/* Expanded Solution sheet */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden print:h-auto print:opacity-100 print:block"
          >
            <div className="pl-6 mt-3">
              <div className="rounded-lg bg-indigo-950/20 border border-indigo-500/10 p-4 flex flex-col gap-2 print:bg-zinc-50 print:border-zinc-300 print:text-black">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-400 print:text-black">
                  <CheckCircle2 size={13} />
                  <span>Correct Answer:</span>
                  <span className="text-zinc-200 font-medium ml-1 print:text-black">{correctAnswer}</span>
                </div>
                <div className="text-xs text-zinc-400 leading-normal mt-1 print:text-zinc-700">
                  <span className="font-semibold text-zinc-300 block mb-0.5 print:text-black">Explanation:</span>
                  {explanation}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand/Collapse trigger (Hidden in print) */}
      <div className="pl-6 flex justify-start print:hidden">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] font-bold text-zinc-500 hover:text-indigo-400 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {isExpanded ? (
            <>
              <EyeOff size={11} /> Hide Answer Key
            </>
          ) : (
            <>
              <Eye size={11} /> View Answer Key
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default QuestionCard;
