'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zustand stores
import { useAssignmentStore } from '../../../store/useAssignmentStore';
import { useAssignmentFormStore } from '../../../store/useAssignmentFormStore';
import { Card } from '../../../components/ui/card';


// Icons & Animations
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Calendar, 
  FileText, 
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  UploadCloud,
  Mic
} from 'lucide-react';

// Form validation schema enforcing non-empty and non-negative bounds
const formSchema = z.object({
  title: z
    .string()
    .min(3, 'Assignment Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  subject: z
    .string()
    .min(2, 'Subject Domain must be at least 2 characters long')
    .max(50, 'Subject name is too long'),
  dueDate: z
    .string()
    .min(1, 'Please specify a valid due date for the assignment'),
  additionalInstructions: z.string().optional()
});

type FormInputs = z.infer<typeof formSchema>;

interface IQuestionConfigRow {
  id: string;
  type: string;
  count: number;
  marks: number;
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [activeFile, setActiveFile] = useState<File | null>(null);

  // Zustand Store 1: Generation state & Sockets progress
  const { 
    createAssignment, 
    isGenerating, 
    generationProgress, 
    generationMessage, 
    generationError,
    activeAssignment,
    resetGenerationState 
  } = useAssignmentStore();

  // Zustand Store 2: Persisted Draft values
  const draftStore = useAssignmentFormStore();

  // Dynamic Question Types State (Figma Mockup configurations)
  const [rows, setRows] = useState<IQuestionConfigRow[]>([
    { id: '1', type: 'mcq', count: 4, marks: 1 },
    { id: '2', type: 'short', count: 3, marks: 2 },
    { id: '3', type: 'mixed', count: 5, marks: 5 },
    { id: '4', type: 'numerical', count: 5, marks: 5 }
  ]);

  const questionTypeOptions = [
    { value: 'mcq', label: 'Multiple Choice Questions' },
    { value: 'short', label: 'Short Questions' },
    { value: 'mixed', label: 'Diagram/Graph-Based Questions' },
    { value: 'numerical', label: 'Numerical Problems' }
  ];

  // Initialize form options
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch, 
    setValue,
    reset
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: draftStore.title || '',
      subject: draftStore.subject || 'Mathematics',
      dueDate: draftStore.dueDate || '',
      additionalInstructions: draftStore.additionalInstructions || ''
    }
  });

  // Load draft values into local React Hook Form state once Zustand persists mount
  useEffect(() => {
    if (draftStore.title) setValue('title', draftStore.title);
    if (draftStore.subject) setValue('subject', draftStore.subject);
    if (draftStore.dueDate) setValue('dueDate', draftStore.dueDate);
    if (draftStore.additionalInstructions) setValue('additionalInstructions', draftStore.additionalInstructions);
  }, [setValue]); // Run only on initial mount/initial setValue setup

  // Sync active inputs to persistent Zustand localstorage draft store in real-time
  const watchedTitle = watch('title');
  const watchedSubject = watch('subject');
  const watchedDueDate = watch('dueDate');
  const watchedInstructions = watch('additionalInstructions');
  
  useEffect(() => {
    if (watchedTitle !== undefined && watchedTitle !== draftStore.title) {
      draftStore.updateField('title', watchedTitle);
    }
  }, [watchedTitle, draftStore]);

  useEffect(() => {
    if (watchedSubject !== undefined && watchedSubject !== draftStore.subject) {
      draftStore.updateField('subject', watchedSubject);
    }
  }, [watchedSubject, draftStore]);

  useEffect(() => {
    if (watchedDueDate !== undefined && watchedDueDate !== draftStore.dueDate) {
      draftStore.updateField('dueDate', watchedDueDate);
    }
  }, [watchedDueDate, draftStore]);

  useEffect(() => {
    if (watchedInstructions !== undefined && watchedInstructions !== draftStore.additionalInstructions) {
      draftStore.updateField('additionalInstructions', watchedInstructions);
    }
  }, [watchedInstructions, draftStore]);


  // Handle syllabus files drop/selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setActiveFile(file);
    if (file) {
      draftStore.updateField('uploadedFileName', file.name);
      draftStore.updateField('uploadedFileSize', file.size);
    } else {
      draftStore.updateField('uploadedFileName', null);
      draftStore.updateField('uploadedFileSize', null);
    }
  };

  const removeFile = () => {
    setActiveFile(null);
    draftStore.updateField('uploadedFileName', null);
    draftStore.updateField('uploadedFileSize', null);
  };

  // Steppers Row Handlers
  const addRow = () => {
    const newRow: IQuestionConfigRow = {
      id: Date.now().toString(),
      type: 'mcq',
      count: 5,
      marks: 5
    };
    setRows([...rows, newRow]);
  };

  const updateRow = (id: string, field: 'type' | 'count' | 'marks', value: any) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const removeRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
  };

  // Reset Draft Form trigger
  const handleReset = () => {
    draftStore.resetForm();
    setActiveFile(null);
    setRows([
      { id: '1', type: 'mcq', count: 4, marks: 1 },
      { id: '2', type: 'short', count: 3, marks: 2 },
      { id: '3', type: 'mixed', count: 5, marks: 5 },
      { id: '4', type: 'numerical', count: 5, marks: 5 }
    ]);
    reset({
      title: '',
      subject: 'Mathematics',
      dueDate: '',
      additionalInstructions: ''
    });
  };

  // Submission handler mapping specifications to the backend BullMQ worker
  const onSubmit = async (data: FormInputs) => {
    try {
      const totalQs = rows.reduce((sum, r) => sum + r.count, 0);
      
      // Build custom prompt instructions incorporating dynamic rows config
      const rowsSpecText = rows.map(r => {
        const typeLabel = questionTypeOptions.find(o => o.value === r.type)?.label || r.type;
        return `- ${typeLabel}: ${r.count} questions (${r.marks} marks each)`;
      }).join('\n');

      const compositeInstructions = `
[Target Questions Distribution Matrix]
${rowsSpecText}

[User Guildlines]
${data.additionalInstructions || 'None'}
`;

      const payload = {
        title: data.title,
        subject: data.subject,
        gradeLevel: '10', // Default grade level representation to satisfy Zod
        topics: [data.subject || 'General'], // Default topics array derived from subject
        difficulty: 'medium' as const, // default average
        questionType: 'mixed' as const, // default mixed style configuration
        numberOfQuestions: totalQs || 5,
        additionalInstructions: compositeInstructions
      };

      await createAssignment(payload);
    } catch (err) {
      console.error('Failed to submit generation:', err);
    }
  };

  // Redirect to detail page upon completion
  useEffect(() => {
    if (!isGenerating && generationProgress === 100 && activeAssignment) {
      const timeout = setTimeout(() => {
        router.push(`/dashboard/papers/${activeAssignment._id}`);
        setTimeout(() => {
          resetGenerationState();
          draftStore.resetForm();
        }, 500);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isGenerating, generationProgress, activeAssignment, router, resetGenerationState]);

  // Calculate dynamic stats from steppers matrix
  const totalQuestionsSum = rows.reduce((sum, r) => sum + r.count, 0);
  const totalMarksSum = rows.reduce((sum, r) => sum + r.count * r.marks, 0);

  // Stepper sub-component
  const Stepper = ({ value, onChange, min = 1, max = 50 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) => {
    return (
      <div className="flex items-center bg-[#f3f4f6]/70 rounded-full px-2 py-1 select-none w-fit border border-gray-100">
        <button 
          type="button" 
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-5.5 w-5.5 rounded-full bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-xs text-sm font-bold cursor-pointer active:scale-90 transition-all shrink-0"
        >
          −
        </button>
        <span className="w-8 text-center text-xs font-bold text-gray-800">{value}</span>
        <button 
          type="button" 
          onClick={() => onChange(Math.min(max, value + 1))}
          className="h-5.5 w-5.5 rounded-full bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-xs text-sm font-bold cursor-pointer active:scale-90 transition-all shrink-0"
        >
          +
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 relative px-4 pb-12">
      
      {/* Title Header with green status dot */}
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 rounded-full bg-emerald-100/80 flex items-center justify-center border border-emerald-200">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-none">
            Create Assignment
          </h2>
          <p className="text-gray-500 text-xs font-semibold mt-1">
            Set up a new assignment for your students
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isGenerating && !generationError ? (
          /* FIGMA MAIN FORM INTERFACE */
          <motion.div
            key="creation-workspace"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              {/* Figma White Details Card */}
              <div className="w-full bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-gray-100/80">
                
                {/* Segmented Step Indicator lines */}
                <div className="w-full flex gap-3 mb-8">
                  <div className="h-1 flex-1 bg-zinc-800 rounded-full" />
                  <div className="h-1 flex-1 bg-gray-200 rounded-full" />
                </div>

                {/* Subtitle brand */}
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">
                    Assignment Details
                  </h3>
                  <p className="text-gray-400 text-xs font-semibold mt-0.5">
                    Basic information about your assignment
                  </p>
                </div>

                <div className="flex flex-col gap-5">
                  {/* Title & Subject row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-900 tracking-tight">
                        Assignment Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Calculus Midterm Examination"
                        className="bg-[#f3f4f6]/50 focus:bg-white rounded-2xl p-3 px-4 text-sm text-gray-800 w-full outline-none border border-transparent focus:border-gray-200/80 transition-all font-semibold"
                        {...register('title')}
                      />
                      {errors.title && (
                        <span className="text-[10px] font-bold text-rose-500 ml-1">{errors.title.message}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-900 tracking-tight">
                        Subject Category
                      </label>
                      <div className="relative">
                        <select
                          className="bg-[#f3f4f6]/50 focus:bg-white rounded-2xl p-3 px-4 text-sm text-gray-800 w-full outline-none border border-transparent focus:border-gray-200/80 transition-all font-semibold appearance-none cursor-pointer pr-10"
                          style={{
                            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 16px center',
                            backgroundSize: '16px'
                          }}
                          {...register('subject')}
                        >
                          <option value="Mathematics">Mathematics</option>
                          <option value="Science">General Science</option>
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Biology">Biology</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="History">History</option>
                          <option value="Literature">Literature</option>
                        </select>
                      </div>
                      {errors.subject && (
                        <span className="text-[10px] font-bold text-rose-500 ml-1">{errors.subject.message}</span>
                      )}
                    </div>
                  </div>

                  {/* Figma File drag & drop box */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs font-bold text-gray-900 tracking-tight">
                      Syllabus / Reference Context (Optional)
                    </label>
                    
                    <div className="relative rounded-[1.5rem] bg-[#f8fafc] border-dashed border-2 border-gray-200/70 p-6 flex flex-col items-center justify-center text-center transition-colors hover:bg-gray-50/50">
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      
                      <div className="flex flex-col items-center gap-2 select-none">
                        <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100">
                          <UploadCloud size={20} />
                        </div>
                        
                        {draftStore.uploadedFileName ? (
                          <div className="z-20 relative mt-1 flex flex-col items-center">
                            <span className="text-xs font-bold text-gray-900 truncate max-w-md">
                              {draftStore.uploadedFileName}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile();
                              }}
                              className="mt-1 text-[10px] font-bold text-rose-500 hover:underline cursor-pointer relative z-30"
                            >
                              Remove file
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-bold text-gray-800 leading-tight">
                              Choose a file or drag & drop it here
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider leading-none">
                              JPEG, PNG, UPTO 10MB
                            </span>
                            <button 
                              type="button"
                              className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-[10px] font-bold text-gray-700 transition-colors shadow-xs"
                            >
                              Browse Files
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <span className="text-[10px] text-gray-400 font-semibold text-center mt-1 select-none">
                      Upload images of your preferred document/image
                    </span>
                  </div>

                  {/* Due Date Picker */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs font-bold text-gray-900 tracking-tight">
                      Due Date
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        className="bg-[#f3f4f6]/50 focus:bg-white rounded-2xl p-3 px-4 text-sm text-gray-800 w-full outline-none border border-transparent focus:border-gray-200/80 transition-all font-semibold cursor-pointer"
                        {...register('dueDate')}
                      />
                    </div>
                    {errors.dueDate && (
                      <span className="text-[10px] font-bold text-rose-500 ml-1">{errors.dueDate.message}</span>
                    )}
                  </div>

                  {/* Dynamic Stepper Configuration Matrix */}
                  <div className="flex flex-col gap-3 mt-4 border-t border-gray-100 pt-5">
                    <div className="grid grid-cols-12 gap-3 text-xs font-bold text-gray-400 select-none pb-1">
                      <div className="col-span-6 pl-1">Question Type</div>
                      <div className="col-span-3 text-center">No. of Questions</div>
                      <div className="col-span-3 text-right pr-6">Marks</div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {rows.map((row) => (
                        <div key={row.id} className="grid grid-cols-12 gap-3 items-center">
                          {/* Dropdown Selector */}
                          <div className="col-span-6 relative">
                            <select
                              value={row.type}
                              onChange={(e) => updateRow(row.id, 'type', e.target.value)}
                              className="bg-[#f3f4f6]/50 focus:bg-white rounded-2xl p-2.5 px-4 text-xs sm:text-sm font-semibold text-gray-800 outline-none border border-transparent focus:border-gray-200/80 transition-all w-full appearance-none cursor-pointer pr-10"
                              style={{
                                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 14px center',
                                backgroundSize: '14px'
                              }}
                            >
                              {questionTypeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Stepper Count */}
                          <div className="col-span-3 flex justify-center">
                            <Stepper 
                              value={row.count} 
                              onChange={(v) => updateRow(row.id, 'count', v)} 
                            />
                          </div>

                          {/* Stepper Marks */}
                          <div className="col-span-3 flex justify-end items-center gap-3">
                            <Stepper 
                              value={row.marks} 
                              onChange={(v) => updateRow(row.id, 'marks', v)} 
                            />
                            
                            <button
                              type="button"
                              onClick={() => removeRow(row.id)}
                              className="h-6 w-6 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer shrink-0"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add row triggers */}
                    <div className="flex items-center justify-between mt-3">
                      <button
                        type="button"
                        onClick={addRow}
                        className="flex items-center gap-2 text-xs font-bold text-gray-900 hover:text-black cursor-pointer group"
                      >
                        <div className="h-6 w-6 rounded-full bg-zinc-900 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                          <Plus size={14} className="stroke-[2.5]" />
                        </div>
                        <span>Add Question Type</span>
                      </button>

                      {/* Config Diagnoses Summary */}
                      <div className="text-right text-xs font-bold text-gray-500 select-none flex flex-col gap-1.5 leading-none pr-6">
                        <span className={totalQuestionsSum > 25 ? "text-rose-500 font-extrabold flex items-center justify-end animate-pulse" : "text-gray-700"}>
                          Total Questions : {totalQuestionsSum} {totalQuestionsSum > 25 && "(Max 25)"}
                        </span>
                        <span className="mt-0.5">Total Marks : {totalMarksSum}</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Instructions guidelines */}
                  <div className="flex flex-col gap-1.5 mt-4 border-t border-gray-100 pt-5">
                    <label className="text-xs font-bold text-gray-900 tracking-tight">
                      Additional Information (For better output)
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                        className="bg-[#f3f4f6]/50 focus:bg-white rounded-2xl p-4 pr-12 text-sm text-gray-800 w-full outline-none border border-transparent focus:border-gray-200/80 transition-all font-semibold leading-relaxed resize-none"
                        {...register('additionalInstructions')}
                      />
                      <button
                        type="button"
                        className="absolute bottom-4 right-4 h-7 w-7 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-gray-700 shadow-xs border border-gray-100 hover:border-gray-200 cursor-pointer active:scale-95 transition-all"
                      >
                        <Mic size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Figma Bottom Action Bar */}
              <div className="flex items-center justify-between mt-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full py-3 px-7 text-xs font-bold text-gray-700 shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <ArrowLeft size={14} className="stroke-[2.5]" />
                  <span>Previous</span>
                </button>
                
                <button
                  type="submit"
                  disabled={totalQuestionsSum > 25}
                  className={`flex items-center gap-2 border border-transparent rounded-full py-3 px-7 text-xs font-bold shadow-md transition-all active:scale-98 cursor-pointer ${
                    totalQuestionsSum > 25 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                      : 'bg-zinc-900 hover:bg-black text-white'
                  }`}
                >
                  <span>Next</span>
                  <ArrowRight size={14} className="stroke-[2.5]" />
                </button>
              </div>
            </form>
          </motion.div>
        ) : isGenerating ? (
          /* FIGMA COHESIVE PROGRESS DIAL LOADER */
          <motion.div
            key="generation-loader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl mx-auto py-12"
          >
            <Card className="p-8 flex flex-col items-center justify-center text-center bg-white border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-[2.5rem]">
              
              {/* Circular Gauge */}
              <div className="relative h-44 w-44 flex items-center justify-center select-none">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="76"
                    className="stroke-gray-100"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="88"
                    cy="88"
                    r="76"
                    className="stroke-[#f97316]"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 76}
                    strokeDashoffset={2 * Math.PI * 76 * (1 - generationProgress / 100)}
                    strokeLinecap="round"
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </svg>
                
                {/* Dial contents */}
                <div className="flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-gray-900 tracking-tighter">
                    {generationProgress}%
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">
                    Queue Process
                  </span>
                </div>
              </div>

              {/* Progress logging notifications */}
              <div className="mt-8 max-w-md w-full">
                <h3 className="text-base font-bold text-gray-900 flex items-center justify-center gap-2 tracking-tight">
                  <Brain size={16} className="text-[#f97316] animate-pulse shrink-0" />
                  Assembling Exam Blueprint
                </h3>

                <div className="mt-3 px-4 py-3.5 rounded-2xl bg-[#f3f4f6]/60 border border-gray-100 w-full flex items-center justify-center min-h-[52px]">
                  <p className="text-gray-600 text-xs font-semibold tracking-wide animate-pulse leading-snug">
                    {generationMessage}
                  </p>
                </div>

                <p className="text-[10px] text-gray-400 font-medium leading-normal mt-4">
                  Progress indicators sync dynamically using background worker websocket handles.
                </p>
              </div>

            </Card>
          </motion.div>
        ) : (
          /* WORKER FAIL EXCEPTION OVERLAY */
          <motion.div
            key="generation-error"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mx-auto py-12"
          >
            <Card className="border-red-200 bg-red-50/20 p-8 flex flex-col items-center justify-center text-center rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <div className="h-14 w-14 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-500 mb-5 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">Generation Queue Faulted</h3>
              
              <div className="mt-3 px-4 py-3 rounded-2xl bg-white border border-red-100 w-full mb-6 text-left shadow-xs">
                <p className="text-red-500 text-xs font-semibold leading-relaxed break-words">
                  Error details: {generationError}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    resetGenerationState();
                    handleReset();
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-200 cursor-pointer transition-all active:scale-95"
                >
                  Configure New Spec
                </button>
                
                <button 
                  onClick={() => {
                    const data = watch();
                    onSubmit(data);
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-xs"
                >
                  Retry Worker Job
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
