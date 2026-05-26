'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadBoxProps {
  label: string;
  onFileSelect: (file: File | null) => void;
  selectedFileName?: string | null;
  selectedFileSize?: number | null;
  error?: string;
}

export const UploadBox = ({
  label,
  onFileSelect,
  selectedFileName,
  selectedFileSize,
  error
}: UploadBoxProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering click on box
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      <label className="text-xs font-bold text-zinc-300 tracking-wide px-1">
        {label}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBoxClick}
        className={`w-full rounded-xl border-2 border-dashed p-6 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center relative overflow-hidden ${
          isDragActive 
            ? 'border-indigo-500 bg-indigo-500/5' 
            : error 
              ? 'border-red-500/50 bg-red-500/5'
              : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700 hover:bg-zinc-950/40'
        }`}
      >
        <AnimatePresence mode="wait">
          {selectedFileName ? (
            /* Selected File State */
            <motion.div
              key="file-details"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between w-full bg-zinc-950/70 border border-white/5 p-3 rounded-lg"
            >
              <div className="flex items-center gap-3 text-left overflow-hidden mr-4">
                <div className="h-9 w-9 rounded bg-indigo-600/15 flex items-center justify-center text-indigo-400 shrink-0">
                  <FileText size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate max-w-[200px] md:max-w-[300px]">
                    {selectedFileName}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                    {formatFileSize(selectedFileSize)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                title="Remove syllabus file"
              >
                <Trash2 size={15} />
              </button>
            </motion.div>
          ) : (
            /* Upload Action State */
            <motion.div
              key="upload-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className={`h-11 w-11 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 mb-3 transition-colors ${
                isDragActive ? 'text-indigo-400 bg-indigo-500/10' : ''
              }`}>
                <UploadCloud size={20} />
              </div>
              <p className="text-xs font-bold text-white">
                Drag syllabus or materials here
              </p>
              <p className="text-[10px] text-zinc-500 font-medium mt-1">
                Supports PDF, DOCX, or TXT up to 10MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <span className="text-[11px] font-medium text-red-400 px-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default UploadBox;
