"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAssignmentPDF = exports.getAssignmentById = exports.createAssignment = void 0;
const assessment_model_1 = require("../models/assessment.model");
const generator_queue_1 = require("../queues/generator.queue");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const createAssignment = async (req, res, next) => {
    try {
        const { title, subject, gradeLevel, topics, difficulty, questionType, numberOfQuestions, additionalInstructions } = req.body;
        const assignment = new assessment_model_1.Assignment({
            title,
            subject,
            gradeLevel: gradeLevel || 'High School',
            topics: topics || [subject || 'General'],
            difficulty,
            questionType: questionType || 'mixed',
            numberOfQuestions: numberOfQuestions || 5,
            additionalInstructions: additionalInstructions || '',
            status: 'pending',
            sections: []
        });
        await assignment.save();
        // Trigger BullMQ job enqueuer
        await (0, generator_queue_1.addAssessmentJob)(assignment._id.toString());
        res.status(202).json({
            status: 'success',
            message: 'Assignment generation queue enqueued',
            data: {
                id: assignment._id,
                status: assignment.status
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createAssignment = createAssignment;
const getAssignmentById = async (req, res, next) => {
    try {
        const assignment = await assessment_model_1.Assignment.findById(req.params.id);
        if (!assignment) {
            res.status(404).json({
                status: 'fail',
                message: 'Assignment not found'
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: assignment
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAssignmentById = getAssignmentById;
const downloadAssignmentPDF = async (req, res, next) => {
    try {
        const assignment = await assessment_model_1.Assignment.findById(req.params.id);
        if (!assignment) {
            res.status(404).json({
                status: 'fail',
                message: 'Assignment not found'
            });
            return;
        }
        if (assignment.status !== 'completed' || !assignment.pdfPath) {
            res.status(400).json({
                status: 'fail',
                message: 'PDF files are not ready or generation task has failed'
            });
            return;
        }
        const filePath = path_1.default.join(__dirname, '..', '..', 'public', 'pdfs', `assessment-${assignment._id}.pdf`);
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({
                status: 'fail',
                message: 'PDF document not found on fileserver disk'
            });
            return;
        }
        const cleanTitle = assignment.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const downloadName = `${cleanTitle}-assignment.pdf`;
        res.download(filePath, downloadName);
    }
    catch (error) {
        next(error);
    }
};
exports.downloadAssignmentPDF = downloadAssignmentPDF;
//# sourceMappingURL=assignment.controller.js.map