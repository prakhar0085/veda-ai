'use client';

import React from 'react';
import { Sparkles, Trash2, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionBarProps {
  onReset: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  hasErrors?: boolean;
  errorCount?: number;
}

export const ActionBar = ({
  onReset,
  isSubmitting = false,
  submitLabel = 'Generate Assignment',
  hasErrors = false,
  errorCount = 0
}: ActionBarProps) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-20 bg-zinc-950/80 backdrop-blur-md border-t border-white/5 py-4 px-6 -mx-6 -mb-6 flex items-center justify-between rounded-b-2xl">
      
      {/* Validation alert banner */}
      <div className="flex items-center gap-2">
        <AnimatePresence>
          {hasErrors && errorCount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 text-red-400 text-xs font-semibold"
            >
              <AlertCircle size={14} className="shrink-0" />
              <span>Review {errorCount} input error{errorCount > 1 ? 's' : ''}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onReset}
          disabled={isSubmitting}
          icon={<Trash2 size={14} />}
        >
          Reset Draft
        </Button>
        
        <Button
          type="submit"
          variant="secondary"
          size="md"
          loading={isSubmitting}
          disabled={isSubmitting}
          icon={<Sparkles size={14} />}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};

export default ActionBar;
