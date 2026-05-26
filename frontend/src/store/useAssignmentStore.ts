import { create } from 'zustand';
import { apiClient } from '../services/api';
import { initSocket } from '../services/socket';

export interface ISectionQuestion {
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
}

export interface IAssignmentSection {
  sectionTitle: string;
  instruction: string;
  questions: ISectionQuestion[];
}

export interface IAssignment {
  _id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;
  sections: IAssignmentSection[];
  pdfPath?: string;
  topics?: string[];
  questionType?: 'mcq' | 'short' | 'long' | 'mixed';
  additionalInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateAssignmentPayload {
  title: string;
  subject: string;
  gradeLevel?: string;
  topics?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionType?: 'mcq' | 'short' | 'long' | 'mixed';
  numberOfQuestions: number;
  additionalInstructions?: string;
}

interface AssignmentStoreState {
  activeAssignment: IAssignment | null;
  isGenerating: boolean;
  generationProgress: number;
  generationMessage: string;
  generationError: string | null;
  loading: boolean;

  // Actions
  createAssignment: (payload: ICreateAssignmentPayload) => Promise<string>;
  fetchAssignmentById: (id: string) => Promise<IAssignment>;
  resetGenerationState: () => void;
}

export const useAssignmentStore = create<AssignmentStoreState>((set, get) => ({
  activeAssignment: null,
  isGenerating: false,
  generationProgress: 0,
  generationMessage: '',
  generationError: null,
  loading: false,

  createAssignment: async (payload: ICreateAssignmentPayload) => {
    if (payload.numberOfQuestions > 25) {
      set({
        isGenerating: false,
        generationProgress: 0,
        generationError: 'For performance and prompt length limits, the maximum number of questions is limited to 25. Please reduce the counts in your question types matrix.'
      });
      throw new Error('Total questions exceeds the maximum of 25.');
    }

    set({
      isGenerating: true,
      generationProgress: 0,
      generationMessage: 'Submitting assignment specifications to queue...',
      generationError: null
    });

    try {
      // 1. Submit REST POST request to backend /api/assignments/create
      const response = await apiClient.post<{
        status: string;
        message: string;
        data: { id: string; status: string };
      }>('/assignments/create', payload);

      const assignmentId = response.data.data.id;

      // 2. Setup Sockets listeners and join room assignment:id
      const socket = initSocket();
      socket.emit('join-assessment-room', assignmentId);

      // Clear existing listeners
      socket.off('generation-started');
      socket.off('generation-progress');
      socket.off('generation-completed');
      socket.off('generation-failed');

      // WebSocket Event 1: started
      socket.on('generation-started', (data: { id: string; message: string }) => {
        set({
          generationProgress: 10,
          generationMessage: data.message
        });
      });

      // WebSocket Event 2: progress
      socket.on('generation-progress', (data: { id: string; progress: number; message: string }) => {
        set({
          generationProgress: data.progress,
          generationMessage: data.message
        });
      });

      // WebSocket Event 3: completed
      socket.on('generation-completed', (data: { id: string; data: IAssignment }) => {
        set({
          generationProgress: 100,
          generationMessage: 'Assignment generation completed successfully!',
          isGenerating: false,
          activeAssignment: data.data
        });
      });

      // WebSocket Event 4: failed
      socket.on('generation-failed', (data: { id: string; error: string }) => {
        set({
          isGenerating: false,
          generationProgress: 0,
          generationError: data.error
        });
      });

      return assignmentId;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Failed to trigger assignment generation';
      set({
        isGenerating: false,
        generationProgress: 0,
        generationError: errMsg
      });
      throw error;
    }
  },

  fetchAssignmentById: async (id: string) => {
    set({ loading: true });
    try {
      const response = await apiClient.get<{
        status: string;
        data: IAssignment;
      }>(`/assignments/${id}`);

      set({ activeAssignment: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      console.error(`Error loading assignment ${id}:`, error);
      set({ loading: false });
      throw error;
    }
  },

  resetGenerationState: () => {
    set({
      isGenerating: false,
      generationProgress: 0,
      generationMessage: '',
      generationError: null
    });
  }
}));
