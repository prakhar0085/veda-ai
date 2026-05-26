import { Request, Response, NextFunction } from 'express';
import { Assignment } from '../models/assessment.model';
import { addAssessmentJob } from '../queues/generator.queue';
import fs from 'fs';
import path from 'path';

export const createAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      subject,
      gradeLevel,
      topics,
      difficulty,
      questionType,
      numberOfQuestions,
      additionalInstructions
    } = req.body;

    const assignment = new Assignment({
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
    await addAssessmentJob(assignment._id.toString());

    res.status(202).json({
      status: 'success',
      message: 'Assignment generation queue enqueued',
      data: {
        id: assignment._id,
        status: assignment.status
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id);

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
  } catch (error) {
    next(error);
  }
};

export const downloadAssignmentPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id);

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

    const filePath = path.join(__dirname, '..', '..', 'public', 'pdfs', `assessment-${assignment._id}.pdf`);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        status: 'fail',
        message: 'PDF document not found on fileserver disk'
      });
      return;
    }

    const cleanTitle = assignment.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const downloadName = `${cleanTitle}-assignment.pdf`;

    res.download(filePath, downloadName);
  } catch (error) {
    next(error);
  }
};
