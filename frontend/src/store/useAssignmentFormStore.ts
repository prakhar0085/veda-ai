import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AssignmentFormState {
  title: string;
  subject: string;
  dueDate: string;
  questionType: 'mcq' | 'short' | 'long' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  numberOfQuestions: number;
  marksPerQuestion: number;
  additionalInstructions: string;
  uploadedFileName: string | null;
  uploadedFileSize: number | null;

  // Actions
  updateField: <K extends keyof Omit<AssignmentFormState, 'updateField' | 'resetForm'>>(
    key: K,
    value: AssignmentFormState[K]
  ) => void;
  resetForm: () => void;
}

const initialFormValues = {
  title: '',
  subject: 'Mathematics',
  dueDate: '',
  questionType: 'mcq' as const,
  difficulty: 'medium' as const,
  numberOfQuestions: 5,
  marksPerQuestion: 2,
  additionalInstructions: '',
  uploadedFileName: null,
  uploadedFileSize: null
};

export const useAssignmentFormStore = create<AssignmentFormState>()(
  persist(
    (set) => ({
      ...initialFormValues,

      updateField: (key, value) => {
        set({ [key]: value });
      },

      resetForm: () => {
        set(initialFormValues);
      }
    }),
    {
      name: 'veda-ai-assignment-draft' // localstorage persistence key name
    }
  )
);
