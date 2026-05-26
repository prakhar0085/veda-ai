"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assessment_controller_1 = require("../controllers/assessment.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const assessment_validator_1 = require("../validators/assessment.validator");
const router = (0, express_1.Router)();
// Assessment list and creation (creation is validated via Zod)
router.route('/')
    .post((0, validate_middleware_1.validate)(assessment_validator_1.createAssessmentSchema), assessment_controller_1.createAssessment)
    .get(assessment_controller_1.getAssessments);
// Individual assessment loading
router.route('/:id')
    .get(assessment_controller_1.getAssessmentById);
// Stream and download generated PDF document
router.route('/:id/pdf')
    .get(assessment_controller_1.downloadPDF);
exports.default = router;
//# sourceMappingURL=assessment.routes.js.map