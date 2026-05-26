"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAssignmentAI = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || 'MOCK_KEY'
});
// Advanced local mock sections database for the offline simulation modes
const MATHEMATICS_MOCK_SECTIONS = [
    {
        sectionTitle: 'Section A: Multiple Choice Questions',
        instruction: 'Choose the most appropriate option for each question. Each item carries 2 marks.',
        questions: [
            {
                question: 'Solve for x: 3x + 7 = 22. Options: A) x=3, B) x=5, C) x=6, D) x=4',
                difficulty: 'easy',
                marks: 2
            },
            {
                question: 'What is the derivative of f(x) = x^3 - 5x + 2? Options: A) 3x^2 - 5, B) x^2 - 5, C) 3x^2 - 5x, D) 3x^2',
                difficulty: 'medium',
                marks: 2
            }
        ]
    },
    {
        sectionTitle: 'Section B: Technical Derivations',
        instruction: 'Show all intermediate steps clearly. Each item carries 5 marks.',
        questions: [
            {
                question: 'Find the limit of (sin x) / x as x approaches 0, and justify your answer using squeeze theorem.',
                difficulty: 'medium',
                marks: 5
            },
            {
                question: 'Find the area of a circle with a radius of 7 units. (Use pi ≈ 22/7)',
                difficulty: 'easy',
                marks: 5
            }
        ]
    },
    {
        sectionTitle: 'Section C: Theoretical Proofs',
        instruction: 'Provide a rigorous mathematical proof. Each item carries 10 marks.',
        questions: [
            {
                question: 'State and prove the Pythagorean Theorem (a^2 + b^2 = c^2) using similar triangles or geometric decomposition.',
                difficulty: 'hard',
                marks: 10
            }
        ]
    }
];
const SCIENCE_MOCK_SECTIONS = [
    {
        sectionTitle: 'Section A: Core Concepts (MCQ)',
        instruction: 'Select the single best answer. Each question carries 2 marks.',
        questions: [
            {
                question: 'Which of the following elements has the chemical symbol "Na"? Options: A) Nitrogen, B) Neon, C) Sodium, D) Nickel',
                difficulty: 'easy',
                marks: 2
            },
            {
                question: 'What is the speed of light in a vacuum? Options: A) ~300,000 km/s, B) ~150,000 km/s, C) ~3,000 km/s, D) ~3,000,000 km/s',
                difficulty: 'easy',
                marks: 2
            }
        ]
    },
    {
        sectionTitle: 'Section B: Short Conceptual Responses',
        instruction: 'Provide brief, factual answers of 2-3 sentences. Each question carries 5 marks.',
        questions: [
            {
                question: 'What is the powerhouse of the eukaryotic cell? Explain its role in generating adenosine triphosphate (ATP).',
                difficulty: 'medium',
                marks: 5
            },
            {
                question: 'State Newtons Second Law of Motion and explain the relationship between force, mass, and acceleration.',
                difficulty: 'easy',
                marks: 5
            }
        ]
    },
    {
        sectionTitle: 'Section C: Extended Inquiries',
        instruction: 'Provide comprehensive explanations including chemical equations. Each question carries 10 marks.',
        questions: [
            {
                question: 'Explain the detailed process of Photosynthesis in green plants. Include both light-dependent and light-independent phases.',
                difficulty: 'hard',
                marks: 10
            }
        ]
    }
];
const COMPUTER_SCIENCE_MOCK_SECTIONS = [
    {
        sectionTitle: 'Section A: Algorithms & Data Structures',
        instruction: 'Select the best matching option. Each question carries 2 marks.',
        questions: [
            {
                question: 'Which data structure follows the First-In, First-Out (FIFO) principle? Options: A) Stack, B) Queue, C) Binary Tree, D) Hash Map',
                difficulty: 'easy',
                marks: 2
            },
            {
                question: 'What is the average-case time complexity of sorting an array of n items using QuickSort? Options: A) O(n), B) O(n log n), C) O(n^2), D) O(log n)',
                difficulty: 'medium',
                marks: 2
            }
        ]
    },
    {
        sectionTitle: 'Section B: Practical Engineering Tasks',
        instruction: 'Analyze or write snippets of code. Each question carries 5 marks.',
        questions: [
            {
                question: 'What is a closure in JavaScript? Provide a brief code snippet demonstrating its application for private data variables.',
                difficulty: 'medium',
                marks: 5
            },
            {
                question: 'Define the term HTTP. Detail the differences between GET and POST request methods.',
                difficulty: 'easy',
                marks: 5
            }
        ]
    },
    {
        sectionTitle: 'Section C: System Architecture Analysis',
        instruction: 'Compare and critique structural choices. Each question carries 10 marks.',
        questions: [
            {
                question: 'Explain the technical differences between relational (SQL) and non-relational (NoSQL) databases. When would you prefer one over the other?',
                difficulty: 'hard',
                marks: 10
            }
        ]
    }
];
const generateAssignmentAI = async (params) => {
    const { title, subject, difficulty, numberOfQuestions } = params;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'MOCK_KEY') {
        console.log('⚡ Using Offline Simulation Generator Mode (No API key found)');
        return generateOfflineMock(params);
    }
    try {
        const prompt = `You are a high-level educational AI assessment agent.
Create a structured assignment based on the specifications:
Assignment Title: ${title}
Subject: ${subject}
Difficulty Level: ${difficulty}
Total Questions Required: ${numberOfQuestions}

Return a strict, valid JSON object containing an array of sections. Follow this exact JSON typescript definition:
{
  "title": string,
  "subject": string,
  "sections": Array<{
    "sectionTitle": string (e.g. "Section A: Multiple Choice Questions"),
    "instruction": string (e.g. "Choose the best matching option..."),
    "questions": Array<{
      "question": string (the question text),
      "difficulty": "easy" | "medium" | "hard",
      "marks": number (assign appropriate marks e.g. mcq = 2, short = 5, long = 10)
    }>
  }>
}

Distribute the ${numberOfQuestions} questions logically across 2 or 3 sections. Return ONLY the raw valid JSON, without extra markdown fences, padding, or text.`;
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an educational AI assistant that strictly produces structured assessment sections in valid JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' }
        });
        const content = response.choices[0]?.message?.content || '{}';
        const parsedData = JSON.parse(content);
        if (parsedData && Array.isArray(parsedData.sections)) {
            return parsedData.sections;
        }
        throw new Error('Parsed response does not contain sections array');
    }
    catch (error) {
        console.error('❌ OpenAI API call failed, falling back to local simulator:', error.message);
        return generateOfflineMock(params);
    }
};
exports.generateAssignmentAI = generateAssignmentAI;
const generateOfflineMock = (params) => {
    const { subject, numberOfQuestions } = params;
    const cleanedSubject = subject.toLowerCase().replace(/[^a-z]/g, '');
    let baseSections = [];
    if (cleanedSubject.includes('math') || cleanedSubject.includes('calculus') || cleanedSubject.includes('algebra')) {
        baseSections = MATHEMATICS_MOCK_SECTIONS;
    }
    else if (cleanedSubject.includes('sci') || cleanedSubject.includes('phys') || cleanedSubject.includes('chem') || cleanedSubject.includes('bio')) {
        baseSections = SCIENCE_MOCK_SECTIONS;
    }
    else {
        baseSections = COMPUTER_SCIENCE_MOCK_SECTIONS;
    }
    // Deep clone mock sections
    const clonedSections = JSON.parse(JSON.stringify(baseSections));
    // Count total questions in our clonedSections
    let totalAvailableQuestions = clonedSections.reduce((sum, sec) => sum + sec.questions.length, 0);
    // If the user wants fewer questions, we trim them circularly. If they want more, we pad/duplicate them.
    let currentCount = 0;
    const finalSections = [];
    for (const section of clonedSections) {
        if (currentCount >= numberOfQuestions)
            break;
        const finalQuestions = [];
        for (const q of section.questions) {
            if (currentCount >= numberOfQuestions)
                break;
            finalQuestions.push(q);
            currentCount++;
        }
        if (finalQuestions.length > 0) {
            finalSections.push({
                sectionTitle: section.sectionTitle,
                instruction: section.instruction,
                questions: finalQuestions
            });
        }
    }
    // If they want more than our default mock pool, duplicate from the first section
    if (currentCount < numberOfQuestions && finalSections.length > 0) {
        const questionsToFill = numberOfQuestions - currentCount;
        const poolSection = clonedSections[0];
        for (let i = 0; i < questionsToFill; i++) {
            const baseQ = poolSection.questions[i % poolSection.questions.length];
            finalSections[0].questions.push({
                question: `${baseQ.question} (Alternate Query #${i + 1})`,
                difficulty: baseQ.difficulty,
                marks: baseQ.marks
            });
        }
    }
    return finalSections;
};
//# sourceMappingURL=openai.service.js.map