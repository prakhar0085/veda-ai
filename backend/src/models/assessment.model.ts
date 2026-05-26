import { Schema, model, Document } from 'mongoose';

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

export interface IAssignment extends Document {
  title: string;
  subject: string;
  gradeLevel: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;
  sections: IAssignmentSection[];
  pdfPath?: string;
  topics: string[];
  questionType: 'mcq' | 'short' | 'long' | 'mixed';
  numberOfQuestions?: number;
  additionalInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SectionQuestionSchema = new Schema<ISectionQuestion>({
  question: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  marks: { type: Number, required: true }
});

const AssignmentSectionSchema = new Schema<IAssignmentSection>({
  sectionTitle: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: { type: [SectionQuestionSchema], required: true }
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    gradeLevel: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    status: {
      type: String,
      enum: ['pending', 'generating', 'completed', 'failed'],
      default: 'pending'
    },
    error: { type: String },
    sections: { type: [AssignmentSectionSchema], default: [] },
    pdfPath: { type: String },
    topics: { type: [String], default: [] },
    questionType: { type: String, enum: ['mcq', 'short', 'long', 'mixed'], default: 'mixed' },
    numberOfQuestions: { type: Number, default: 5 },
    additionalInstructions: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Assignment = model<IAssignment>('Assignment', AssignmentSchema);

// Export alias to maintain compatibility with existing assessments files
export const Assessment = Assignment;
export type IAssessment = IAssignment;

