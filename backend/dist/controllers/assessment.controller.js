"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadPDF = exports.getAssessmentById = exports.getAssessments = exports.createAssessment = void 0;
const assessment_model_1 = require("../models/assessment.model");
const generator_queue_1 = require("../queues/generator.queue");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const createAssessment = async (req, res, next) => {
    try {
        const { title, subject, gradeLevel, topics, difficulty, questionType, numberOfQuestions } = req.body;
        // Create pending assessment in database
        const assessment = new assessment_model_1.Assessment({
            title,
            subject,
            gradeLevel,
            topics,
            difficulty,
            questionType,
            numberOfQuestions,
            status: 'pending'
        });
        await assessment.save();
        // Trigger asynchronous queue process
        await (0, generator_queue_1.addAssessmentJob)(assessment._id.toString());
        res.status(202).json({
            status: 'success',
            message: 'Assessment creation initiated successfully',
            data: {
                id: assessment._id,
                status: assessment.status,
                createdAt: assessment.createdAt
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createAssessment = createAssessment;
const getAssessments = async (req, res, next) => {
    try {
        const assessments = await assessment_model_1.Assessment.find()
            .select('title subject gradeLevel difficulty status questions numberOfQuestions createdAt')
            .sort({ createdAt: -1 });
        res.status(200).json({
            status: 'success',
            results: assessments.length,
            data: assessments
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAssessments = getAssessments;
const getAssessmentById = async (req, res, next) => {
    try {
        const assessment = await assessment_model_1.Assessment.findById(req.params.id);
        if (!assessment) {
            res.status(404).json({
                status: 'fail',
                message: 'Assessment not found'
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: assessment
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAssessmentById = getAssessmentById;
const downloadPDF = async (req, res, next) => {
    try {
        const assessment = await assessment_model_1.Assessment.findById(req.params.id);
        if (!assessment) {
            res.status(404).json({
                status: 'fail',
                message: 'Assessment not found'
            });
            return;
        }
        if (assessment.status !== 'completed' || !assessment.pdfPath) {
            res.status(400).json({
                status: 'fail',
                message: 'PDF is not ready or assessment has failed generation'
            });
            return;
        }
        // Resolve path on disk
        const filePath = path_1.default.join(__dirname, '..', '..', 'public', 'pdfs', `assessment-${assessment._id}.pdf`);
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({
                status: 'fail',
                message: 'PDF file not found on disk. Re-generation might be required.'
            });
            return;
        }
        const cleanTitle = assessment.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const downloadName = `${cleanTitle}-assessment.pdf`;
        res.download(filePath, downloadName);
    }
    catch (error) {
        next(error);
    }
};
exports.downloadPDF = downloadPDF;
//# sourceMappingURL=assessment.controller.js.map