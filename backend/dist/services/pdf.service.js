"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAssessmentPDF = void 0;
const pdf_lib_1 = require("pdf-lib");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fontkit_1 = __importDefault(require("@pdf-lib/fontkit"));
// Custom text word-wrapping and coordinate spacer engine
const drawWrappedText = (page, text, x, y, maxWidth, fontSize, font, color, lineHeight = 14) => {
    const words = text.split(' ');
    let currentLine = '';
    let currentY = y;
    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (testLineWidth > maxWidth) {
            page.drawText(currentLine, { x, y: currentY, size: fontSize, font, color });
            currentLine = word;
            currentY -= lineHeight;
        }
        else {
            currentLine = testLine;
        }
    }
    if (currentLine) {
        page.drawText(currentLine, { x, y: currentY, size: fontSize, font, color });
        currentY -= lineHeight;
    }
    return currentY;
};
const generateAssessmentPDF = async (assignment) => {
    // Ensure target folder exists
    const uploadDir = path_1.default.join(__dirname, '..', '..', 'public', 'pdfs');
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
    const fileName = `assessment-${assignment._id}.pdf`;
    const filePath = path_1.default.join(uploadDir, fileName);
    // Initialize PDF document using pdf-lib
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    // --------------------------------------------------------------
    // Load a Unicode‑compatible font (NotoSans)
    // --------------------------------------------------------------
    const fontPath = path_1.default.resolve(__dirname, '../../fonts/NotoSans-Regular.ttf');
    const fontBytes = fs_1.default.readFileSync(fontPath);
    // Register FontKit so we can embed custom fonts
    pdfDoc.registerFontkit(fontkit_1.default);
    const customFont = await pdfDoc.embedFont(fontBytes);
    // Use the custom font for all text operations
    const helveticaFont = customFont;
    const helveticaBold = customFont;
    const helveticaOblique = customFont;
    // Colors
    const blackColor = (0, pdf_lib_1.rgb)(0.05, 0.05, 0.08);
    const greyColor = (0, pdf_lib_1.rgb)(0.4, 0.4, 0.45);
    const lightGreyColor = (0, pdf_lib_1.rgb)(0.9, 0.9, 0.9);
    const indigoColor = (0, pdf_lib_1.rgb)(0.39, 0.4, 0.95);
    const whiteColor = (0, pdf_lib_1.rgb)(1, 1, 1);
    // Add initial page
    let page = pdfDoc.addPage([595.276, 841.890]); // Standard A4 points
    const { width, height } = page.getSize();
    const leftMargin = 50;
    const rightMargin = width - 50;
    const contentWidth = rightMargin - leftMargin; // 495
    let currentY = height - 55; // 787 Y position cursor
    // Page tracking utility
    const checkPageBoundary = (requiredHeight) => {
        if (currentY - requiredHeight < 60) {
            page = pdfDoc.addPage([595.276, 841.890]);
            currentY = height - 55; // Reset cursor to top of new page
        }
    };
    // --- 1. DARK Slate Header Block ---
    page.drawRectangle({
        x: leftMargin,
        y: currentY - 80,
        width: contentWidth,
        height: 80,
        color: (0, pdf_lib_1.rgb)(0.04, 0.06, 0.1)
    });
    page.drawText('VEDA AI', {
        x: leftMargin + 20,
        y: currentY - 35,
        size: 20,
        font: helveticaBold,
        color: whiteColor
    });
    page.drawText('Automated Assessment Creator', {
        x: leftMargin + 20,
        y: currentY - 55,
        size: 10,
        font: helveticaFont,
        color: whiteColor
    });
    const categoryHeader = 'ASSIGNMENT PAPER';
    const categoryWidth = helveticaBold.widthOfTextAtSize(categoryHeader, 12);
    page.drawText(categoryHeader, {
        x: rightMargin - 20 - categoryWidth,
        y: currentY - 35,
        size: 12,
        font: helveticaBold,
        color: indigoColor
    });
    const assignmentIdText = `ID: ${assignment._id}`;
    const idWidth = helveticaFont.widthOfTextAtSize(assignmentIdText, 8);
    page.drawText(assignmentIdText, {
        x: rightMargin - 20 - idWidth,
        y: currentY - 55,
        size: 8,
        font: helveticaFont,
        color: whiteColor
    });
    currentY -= 110; // Space out beneath header block
    // --- 2. Title & Subject ---
    page.drawText('Title:', { x: leftMargin + 10, y: currentY, size: 10, font: helveticaBold, color: blackColor });
    page.drawText(assignment.title, { x: leftMargin + 45, y: currentY, size: 10, font: helveticaFont, color: blackColor });
    page.drawText('Subject:', { x: leftMargin + 10, y: currentY - 20, size: 10, font: helveticaBold, color: blackColor });
    page.drawText(assignment.subject, { x: leftMargin + 60, y: currentY - 20, size: 10, font: helveticaFont, color: blackColor });
    page.drawText('Grade Level:', { x: leftMargin + 260, y: currentY, size: 10, font: helveticaBold, color: blackColor });
    page.drawText(assignment.gradeLevel, { x: leftMargin + 330, y: currentY, size: 10, font: helveticaFont, color: blackColor });
    page.drawText('Difficulty:', { x: leftMargin + 260, y: currentY - 20, size: 10, font: helveticaBold, color: blackColor });
    page.drawText(assignment.difficulty.toUpperCase(), { x: leftMargin + 315, y: currentY - 20, size: 10, font: helveticaFont, color: blackColor });
    currentY -= 45;
    // --- 3. STUDENT CREDENTIALS GRID ---
    // Draw outer student credentials grid border
    page.drawRectangle({
        x: leftMargin,
        y: currentY - 50,
        width: contentWidth,
        height: 50,
        borderColor: (0, pdf_lib_1.rgb)(0.8, 0.8, 0.8),
        borderWidth: 1
    });
    page.drawText('Student Name: ____________________________________', {
        x: leftMargin + 15,
        y: currentY - 18,
        size: 9,
        font: helveticaBold,
        color: blackColor
    });
    page.drawText('Roll No: __________________   Section: _________', {
        x: leftMargin + 15,
        y: currentY - 38,
        size: 9,
        font: helveticaBold,
        color: blackColor
    });
    // Calculate marks weight
    let totalQuestions = 0;
    let totalPoints = 0;
    assignment.sections.forEach((sec) => {
        totalQuestions += sec.questions.length;
        sec.questions.forEach((q) => {
            totalPoints += q.marks;
        });
    });
    const estimatedTime = totalQuestions * 5;
    page.drawText(`Marks: ${totalPoints} Pts`, { x: leftMargin + 320, y: currentY - 28, size: 9, font: helveticaBold, color: blackColor });
    page.drawText(`Time: ${estimatedTime} Mins`, { x: leftMargin + 400, y: currentY - 28, size: 9, font: helveticaBold, color: blackColor });
    currentY -= 80;
    // --- 4. SECTIONS LOOP ---
    for (const section of assignment.sections) {
        checkPageBoundary(60); // Ensure section header fits
        // Section header
        page.drawText(section.sectionTitle.toUpperCase(), {
            x: leftMargin,
            y: currentY,
            size: 11,
            font: helveticaBold,
            color: blackColor
        });
        // Thin underline
        page.drawLine({
            start: { x: leftMargin, y: currentY - 3 },
            end: { x: rightMargin, y: currentY - 3 },
            thickness: 1,
            color: blackColor
        });
        currentY -= 20;
        // Instructions Box
        if (section.instruction) {
            checkPageBoundary(40);
            page.drawRectangle({
                x: leftMargin,
                y: currentY - 30,
                width: contentWidth,
                height: 30,
                color: lightGreyColor
            });
            page.drawText('Instructions:', {
                x: leftMargin + 10,
                y: currentY - 12,
                size: 8,
                font: helveticaBold,
                color: greyColor
            });
            page.drawText(section.instruction, {
                x: leftMargin + 10,
                y: currentY - 24,
                size: 8,
                font: helveticaOblique,
                color: greyColor
            });
            currentY -= 45;
        }
        // Section questions loop
        let questionCounter = 1;
        for (const q of section.questions) {
            checkPageBoundary(50); // Ensure question fits
            const numPrefix = `${questionCounter}. `;
            const numWidth = helveticaBold.widthOfTextAtSize(numPrefix, 10);
            page.drawText(numPrefix, {
                x: leftMargin,
                y: currentY,
                size: 10,
                font: helveticaBold,
                color: blackColor
            });
            // Wrap and write question query
            const finalY = drawWrappedText(page, q.question, leftMargin + numWidth, currentY, contentWidth - numWidth - 85, 10, helveticaFont, blackColor);
            // Draw marks weight right-aligned
            const marksText = `[${q.marks} Marks]`;
            const marksWidth = helveticaBold.widthOfTextAtSize(marksText, 9);
            page.drawText(marksText, {
                x: rightMargin - marksWidth,
                y: currentY,
                size: 9,
                font: helveticaBold,
                color: indigoColor
            });
            currentY = finalY - 15; // Set cursor to base of wrapped text
            // Draw writing lines for non-MCQ queries
            if (!q.question.toLowerCase().includes('options:')) {
                checkPageBoundary(30);
                page.drawLine({
                    start: { x: leftMargin + 20, y: currentY },
                    end: { x: rightMargin, y: currentY },
                    thickness: 0.5,
                    color: (0, pdf_lib_1.rgb)(0.8, 0.8, 0.8),
                    dashArray: [2, 2]
                });
                currentY -= 15;
                if (q.marks >= 5) {
                    checkPageBoundary(20);
                    page.drawLine({
                        start: { x: leftMargin + 20, y: currentY },
                        end: { x: rightMargin, y: currentY },
                        thickness: 0.5,
                        color: (0, pdf_lib_1.rgb)(0.8, 0.8, 0.8),
                        dashArray: [2, 2]
                    });
                    currentY -= 15;
                }
            }
            currentY -= 10;
            questionCounter++;
        }
        currentY -= 15; // Space out between sections
    }
    // --- 5. CENTERED FOOTER PAGE STAMPING ---
    const pages = pdfDoc.getPages();
    pages.forEach((p, idx) => {
        const footerText = `Page ${idx + 1} of ${pages.length}`;
        const footerWidth = helveticaFont.widthOfTextAtSize(footerText, 8);
        // Centered bottom page number
        p.drawText(footerText, {
            x: 595.276 / 2 - footerWidth / 2,
            y: 30,
            size: 8,
            font: helveticaFont,
            color: greyColor
        });
        // Simple top/bottom dividing lines
        p.drawLine({
            start: { x: leftMargin, y: 42 },
            end: { x: rightMargin, y: 42 },
            thickness: 0.5,
            color: (0, pdf_lib_1.rgb)(0.9, 0.9, 0.9)
        });
    });
    // Write compiled PDF bytes to fileserver disk
    const pdfBytes = await pdfDoc.save();
    await fs_1.default.promises.writeFile(filePath, pdfBytes);
    return filePath;
};
exports.generateAssessmentPDF = generateAssessmentPDF;
//# sourceMappingURL=pdf.service.js.map