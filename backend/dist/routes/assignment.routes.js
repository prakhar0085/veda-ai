"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignment_controller_1 = require("../controllers/assignment.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const assessment_validator_1 = require("../validators/assessment.validator");
const router = (0, express_1.Router)();
// Endpoint: POST /assignments/create (validated using Zod schemas)
router.route('/create')
    .post((0, validate_middleware_1.validate)(assessment_validator_1.createAssessmentSchema), assignment_controller_1.createAssignment);
// Endpoint: GET /assignments/:id
router.route('/:id')
    .get(assignment_controller_1.getAssignmentById);
// Endpoint: GET /assignments/:id/pdf
router.route('/:id/pdf')
    .get(assignment_controller_1.downloadAssignmentPDF);
exports.default = router;
//# sourceMappingURL=assignment.routes.js.map