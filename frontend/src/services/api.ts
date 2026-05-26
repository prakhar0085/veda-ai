import axios from 'axios';

let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
if (rawApiUrl.endsWith('/')) {
  rawApiUrl = rawApiUrl.slice(0, -1);
}
if (!rawApiUrl.endsWith('/api')) {
  rawApiUrl = `${rawApiUrl}/api`;
}
const API_BASE_URL = rawApiUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface IQuestion {
  id: string;
  text: string;
  type: 'mcq' | 'short' | 'long';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
}

export interface IAssessment {
  _id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  topics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: 'mcq' | 'short' | 'long' | 'mixed';
  numberOfQuestions: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;
  questions?: IQuestion[];
  pdfPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateAssessmentPayload {
  title: string;
  subject: string;
  gradeLevel: string;
  topics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: 'mcq' | 'short' | 'long' | 'mixed';
  numberOfQuestions: number;
}

export const assessmentService = {
  create: async (payload: ICreateAssessmentPayload) => {
    const response = await apiClient.post<{
      status: string;
      message: string;
      data: { id: string; status: string; createdAt: string };
    }>('/assessments', payload);
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get<{
      status: string;
      results: number;
      data: IAssessment[];
    }>('/assessments');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{
      status: string;
      data: IAssessment;
    }>(`/assessments/${id}`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{
      status: string;
      data: null;
    }>(`/assessments/${id}`);
    return response.data;
  },

  getPDFDownloadUrl: (id: string) => {
    return `${API_BASE_URL}/assessments/${id}/pdf`;
  },

  getPDFViewUrl: (id: string, path?: string) => {
    if (!path) return '';
    // Serve static file directly from the express public fileserver
    const serverUrl = API_BASE_URL.replace('/api', '');
    return `${serverUrl}${path}`;
  }
};
