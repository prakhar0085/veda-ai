"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssessmentSchema = void 0;
const zod_1 = require("zod");
exports.createAssessmentSchema = zod_1.z.object({
    title: zod_1.z
        .string({ required_error: 'Title is required' })
        .min(3, 'Title must be at least 3 characters long')
        .max(100, 'Title cannot exceed 100 characters'),
    subject: zod_1.z
        .string({ required_error: 'Subject is required' })
        .min(2, 'Subject must be at least 2 characters long')
        .max(50, 'Subject cannot exceed 50 characters'),
    gradeLevel: zod_1.z
        .string({ required_error: 'Grade level is required' })
        .min(1, 'Grade level is required'),
    topics: zod_1.z
        .array(zod_1.z.string().min(1, 'Topic name cannot be empty'), {
        required_error: 'Topics are required'
    })
        .min(1, 'At least one topic must be specified'),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard'], {
        required_error: 'Difficulty must be easy, medium, or hard'
    }),
    questionType: zod_1.z.enum(['mcq', 'short', 'long', 'mixed'], {
        required_error: 'Question type must be mcq, short, long, or mixed'
    }),
    numberOfQuestions: zod_1.z
        .number({ required_error: 'Number of questions is required' })
        .int('Number of questions must be an integer')
        .min(1, 'Must have at least 1 question')
        .max(25, 'For performance reasons, maximum questions is 25')
});
//# sourceMappingURL=assessment.validator.js.map