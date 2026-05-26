import { Router } from 'express';
import {
  createAssessment,
  getAssessments,
  getAssessmentById,
  downloadPDF,
  deleteAssessment
} from '../controllers/assessment.controller';
import { validate } from '../middleware/validate.middleware';
import { createAssessmentSchema } from '../validators/assessment.validator';

const router = Router();

// Assessment list and creation (creation is validated via Zod)
router.route('/')
  .post(validate(createAssessmentSchema), createAssessment)
  .get(getAssessments);

// Individual assessment loading and deletion
router.route('/:id')
  .get(getAssessmentById)
  .delete(deleteAssessment);

// Stream and download generated PDF document
router.route('/:id/pdf')
  .get(downloadPDF);

export default router;
