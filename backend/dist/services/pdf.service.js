"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAssessmentPDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const generateAssessmentPDF = (assignment) => {
    return new Promise((resolve, reject) => {
        try {
            // Ensure target directory exists in workspace
            const uploadDir = path_1.default.join(__dirname, '..', '..', 'public', 'pdfs');
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            const fileName = `assessment-${assignment._id}.pdf`;
            const filePath = path_1.default.join(uploadDir, fileName);
            const doc = new pdfkit_1.default({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });
            const writeStream = fs_1.default.createWriteStream(filePath);
            doc.pipe(writeStream);
            // --- HEADER SECTION ---
            doc.rect(50, 45, 495, 80).fill('#0b0f19');
            doc.fillColor('#ffffff');
            doc.fontSize(22).font('Helvetica-Bold').text('VEDA AI', 70, 60);
            doc.fontSize(10).font('Helvetica').text('Automated Assessment Creator', 70, 85);
            doc.fillColor('#6366f1');
            doc.fontSize(14).font('Helvetica-Bold').text('ASSIGNMENT PAPER', 380, 60, { align: 'right', width: 150 });
            doc.fillColor('#ffffff');
            doc.fontSize(8).font('Helvetica').text(`ID: ${assignment._id}`, 380, 80, { align: 'right', width: 150 });
            doc.moveDown(5);
            // --- INFO BLOCK GRID ---
            doc.fillColor('#333333');
            doc.fontSize(10);
            const gridY = 145;
            doc.font('Helvetica-Bold').text('Title: ', 50, gridY);
            doc.font('Helvetica').text(assignment.title, 90, gridY);
            doc.font('Helvetica-Bold').text('Subject: ', 50, gridY + 20);
            doc.font('Helvetica').text(assignment.subject, 100, gridY + 20);
            doc.font('Helvetica-Bold').text('Grade Level: ', 300, gridY);
            doc.font('Helvetica').text(assignment.gradeLevel, 370, gridY);
            doc.font('Helvetica-Bold').text('Difficulty: ', 300, gridY + 20);
            doc.font('Helvetica').text(assignment.difficulty.toUpperCase(), 370, gridY + 20);
            // Compute total questions & weight
            let totalQuestions = 0;
            let totalMarks = 0;
            assignment.sections.forEach((sec) => {
                totalQuestions += sec.questions.length;
                sec.questions.forEach((q) => {
                    totalMarks += q.marks;
                });
            });
            doc.font('Helvetica-Bold').text('Questions: ', 50, gridY + 40);
            doc.font('Helvetica').text(`${totalQuestions}`, 110, gridY + 40);
            doc.font('Helvetica-Bold').text('Total Marks: ', 300, gridY + 40);
            doc.font('Helvetica').text(`${totalMarks} pts`, 370, gridY + 40);
            // Thin divider
            doc.moveTo(50, gridY + 60).lineTo(545, gridY + 60).strokeColor('#dddddd').lineWidth(1).stroke();
            doc.moveDown(4);
            // --- SECTIONS & QUESTIONS ---
            assignment.sections.forEach((section, sIdx) => {
                doc.fontSize(12).fillColor('#0b0f19').font('Helvetica-Bold').text(section.sectionTitle);
                doc.fontSize(9).fillColor('#6b7280').font('Helvetica-Oblique').text(`Instruction: ${section.instruction}`);
                doc.moveDown(1);
                let questionCounter = 1;
                section.questions.forEach((q) => {
                    doc.fontSize(10).fillColor('#1f2937');
                    doc.font('Helvetica-Bold').text(`${questionCounter}. `, { continued: true });
                    doc.font('Helvetica').text(q.question, { continued: true });
                    doc.font('Helvetica-Oblique').fillColor('#6366f1').text(`  [${q.marks} Marks]`, { align: 'right' });
                    doc.fillColor('#1f2937');
                    doc.moveDown(1.5);
                    questionCounter++;
                });
                // Add a line divider between sections except the last one
                if (sIdx < assignment.sections.length - 1) {
                    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#f3f4f6').lineWidth(1).stroke();
                    doc.moveDown(1.5);
                }
            });
            // Finalize document
            doc.end();
            writeStream.on('finish', () => {
                resolve(filePath);
            });
            writeStream.on('error', (err) => {
                reject(err);
            });
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.generateAssessmentPDF = generateAssessmentPDF;
//# sourceMappingURL=pdf.service.js.map