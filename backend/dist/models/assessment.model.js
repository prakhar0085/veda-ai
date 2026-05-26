"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assessment = exports.Assignment = void 0;
const mongoose_1 = require("mongoose");
const SectionQuestionSchema = new mongoose_1.Schema({
    question: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    marks: { type: Number, required: true }
});
const AssignmentSectionSchema = new mongoose_1.Schema({
    sectionTitle: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [SectionQuestionSchema], required: true }
});
const AssignmentSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
exports.Assignment = (0, mongoose_1.model)('Assignment', AssignmentSchema);
// Export alias to maintain compatibility with existing assessments files
exports.Assessment = exports.Assignment;
//# sourceMappingURL=assessment.model.js.map