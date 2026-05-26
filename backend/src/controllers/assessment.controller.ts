import { Request, Response, NextFunction } from 'express';
import { Assessment } from '../models/assessment.model';
import { addAssessmentJob } from '../queues/generator.queue';
import fs from 'fs';
import path from 'path';

export const createAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, subject, gradeLevel, topics, difficulty, questionType, numberOfQuestions } = req.body;

    // Create pending assessment in database
    const assessment = new Assessment({
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
    await addAssessmentJob(assessment._id.toString());

    res.status(202).json({
      status: 'success',
      message: 'Assessment creation initiated successfully',
      data: {
        id: assessment._id,
        status: assessment.status,
        createdAt: assessment.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAssessments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assessments = await Assessment.find()
      .select('title subject gradeLevel difficulty status questions numberOfQuestions createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: assessments.length,
      data: assessments
    });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assessment = await Assessment.findById(req.params.id);

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
  } catch (error) {
    next(error);
  }
};

export const downloadPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assessment = await Assessment.findById(req.params.id);

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
    const filePath = path.join(__dirname, '..', '..', 'public', 'pdfs', `assessment-${assessment._id}.pdf`);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        status: 'fail',
        message: 'PDF file not found on disk. Re-generation might be required.'
      });
      return;
    }

    const cleanTitle = assessment.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const downloadName = `${cleanTitle}-assessment.pdf`;

    res.download(filePath, downloadName);
  } catch (error) {
    next(error);
  }
};

export const deleteAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);

    if (!assessment) {
      res.status(404).json({
        status: 'fail',
        message: 'Assessment not found'
      });
      return;
    }

    // Attempt to delete PDF file on disk if it exists
    const filePath = path.join(__dirname, '..', '..', 'public', 'pdfs', `assessment-${assessment._id}.pdf`);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to clean up PDF document file from disk:', err);
      }
    }

    res.status(200).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

