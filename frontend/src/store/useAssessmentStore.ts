import { create } from 'zustand';
import { assessmentService, IAssessment, ICreateAssessmentPayload } from '../services/api';
import { initSocket, joinAssessmentRoom } from '../services/socket';

interface AssessmentState {
  assessments: IAssessment[];
  activeAssessment: IAssessment | null;
  loading: boolean;
  isGenerating: boolean;
  generationProgress: number;
  generationMessage: string;
  generationError: string | null;
  
  // Actions
  fetchAssessments: () => Promise<void>;
  fetchAssessmentById: (id: string) => Promise<IAssessment>;
  createAssessment: (payload: ICreateAssessmentPayload) => Promise<string>;
  deleteAssessment: (id: string) => Promise<void>;
  setGenerationProgress: (progress: number, message: string) => void;
  setGenerationComplete: (assessment: IAssessment) => void;
  setGenerationFailed: (error: string) => void;
  resetGenerationState: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  assessments: [],
  activeAssessment: null,
  loading: false,
  isGenerating: false,
  generationProgress: 0,
  generationMessage: '',
  generationError: null,

  fetchAssessments: async () => {
    set({ loading: true });
    try {
      const response = await assessmentService.getAll();
      set({ assessments: response.data, loading: false });
    } catch (error: any) {
      console.error('Error fetching assessments:', error);
      set({ loading: false });
    }
  },

  fetchAssessmentById: async (id: string) => {
    set({ loading: true });
    try {
      const response = await assessmentService.getById(id);
      set({ activeAssessment: response.data, loading: false });
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching assessment ${id}:`, error);
      set({ loading: false });
      throw error;
    }
  },

  createAssessment: async (payload: ICreateAssessmentPayload) => {
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
      generationMessage: 'Initializing assessment generation request...',
      generationError: null
    });

    try {
      // 1. Submit creation request to backend
      const response = await assessmentService.create(payload);
      const assessmentId = response.data.id;

      // 2. Establish Socket.io connection and join room
      joinAssessmentRoom(assessmentId);
      const socket = initSocket();

      // 3. Register real-time progress callbacks
      socket.off('generation-progress'); // Clear existing listeners to prevent duplicates
      socket.on('generation-progress', (data: {
        status: 'pending' | 'generating' | 'completed' | 'failed';
        progress: number;
        message: string;
        data?: IAssessment;
      }) => {
        if (data.status === 'generating') {
          set({
            generationProgress: data.progress,
            generationMessage: data.message
          });
        } else if (data.status === 'completed' && data.data) {
          set({
            generationProgress: 100,
            generationMessage: data.message,
            isGenerating: false,
            activeAssessment: data.data
          });
          // Refresh list
          get().fetchAssessments();
        } else if (data.status === 'failed') {
          set({
            isGenerating: false,
            generationError: data.message,
            generationProgress: 0
          });
        }
      });

      return assessmentId;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Failed to submit creation request';
      set({
        isGenerating: false,
        generationError: errMsg,
        generationProgress: 0
      });
      throw error;
    }
  },

  setGenerationProgress: (progress, message) => {
    set({ generationProgress: progress, generationMessage: message });
  },

  setGenerationComplete: (assessment) => {
    set({
      generationProgress: 100,
      generationMessage: 'Assessment generation completed!',
      isGenerating: false,
      activeAssessment: assessment
    });
  },

  setGenerationFailed: (error) => {
    set({
      isGenerating: false,
      generationError: error,
      generationProgress: 0
    });
  },

  deleteAssessment: async (id: string) => {
    try {
      await assessmentService.delete(id);
      // Refresh the assessments list
      get().fetchAssessments();
    } catch (error) {
      console.error(`Error deleting assessment ${id}:`, error);
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

