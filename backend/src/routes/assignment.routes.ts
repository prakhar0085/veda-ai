import { Router } from 'express';
import {
  createAssignment,
  getAssignmentById,
  downloadAssignmentPDF
} from '../controllers/assignment.controller';
import { validate } from '../middleware/validate.middleware';
import { createAssessmentSchema } from '../validators/assessment.validator';

const router = Router();

// Endpoint: POST /assignments/create (validated using Zod schemas)
router.route('/create')
  .post(validate(createAssessmentSchema), createAssignment);

// Endpoint: GET /assignments/:id
router.route('/:id')
  .get(getAssignmentById);

// Endpoint: GET /assignments/:id/pdf
router.route('/:id/pdf')
  .get(downloadAssignmentPDF);

export default router;
