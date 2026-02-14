import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

if (genAI) {
  console.log('[Quiz] Gemini API enabled — using AI-generated questions');
} else {
  console.log('[Quiz] No GEMINI_API_KEY — using built-in fallback questions');
}

const FALLBACK_QUESTIONS = {
  math: [
    { question: 'What is 15% of 80?', options: ['10', '12', '14', '16'], correctIndex: 1 },
    { question: 'Solve: 2x + 5 = 15', options: ['x = 3', 'x = 5', 'x = 7', 'x = 10'], correctIndex: 1 },
    { question: 'What is the square root of 144?', options: ['10', '11', '12', '14'], correctIndex: 2 },
    { question: 'Simplify: 3² + 4²', options: ['7', '25', '12', '5'], correctIndex: 1 },
    { question: 'What is 7 × 8?', options: ['54', '56', '58', '64'], correctIndex: 1 },
    { question: 'What is 12 ÷ 3 + 4?', options: ['6', '7', '8', '9'], correctIndex: 2 },
    { question: 'What is the area of a 5×4 rectangle?', options: ['18', '20', '22', '24'], correctIndex: 1 },
    { question: 'Solve: 3x - 6 = 12', options: ['x = 4', 'x = 5', 'x = 6', 'x = 7'], correctIndex: 2 },
    { question: 'What is 9²?', options: ['72', '81', '90', '99'], correctIndex: 1 },
    { question: 'What is 1/2 + 1/4?', options: ['1/6', '2/6', '3/4', '1/3'], correctIndex: 2 },
  ],
  science: [
    { question: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correctIndex: 2 },
    { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctIndex: 1 },
    { question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi'], correctIndex: 2 },
    { question: 'What is H₂O commonly known as?', options: ['Salt', 'Water', 'Sugar', 'Acid'], correctIndex: 1 },
    { question: 'Speed of light is approximately (m/s)?', options: ['3×10⁶', '3×10⁸', '3×10¹⁰', '3×10¹²'], correctIndex: 1 },
    { question: 'What gas do plants absorb from the air?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], correctIndex: 2 },
    { question: 'What is the smallest bone in the human body?', options: ['Femur', 'Stapes', 'Tibia', 'Radius'], correctIndex: 1 },
    { question: 'What planet is closest to the Sun?', options: ['Venus', 'Earth', 'Mercury', 'Mars'], correctIndex: 2 },
    { question: 'What is the chemical symbol for iron?', options: ['Ir', 'In', 'Fe', 'Fi'], correctIndex: 2 },
    { question: 'How many bones are in the adult human body?', options: ['186', '206', '226', '246'], correctIndex: 1 },
  ],
  gk: [
    { question: 'What is the capital of France?', options: ['Lyon', 'Paris', 'Marseille', 'Nice'], correctIndex: 1 },
    { question: 'Who wrote "Romeo and Juliet"?', options: ['Dickens', 'Shakespeare', 'Austen', 'Twain'], correctIndex: 1 },
    { question: 'In which year did World War II end?', options: ['1943', '1944', '1945', '1946'], correctIndex: 2 },
    { question: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctIndex: 3 },
    { question: 'How many continents are there?', options: ['5', '6', '7', '8'], correctIndex: 2 },
    { question: 'What is the capital of Japan?', options: ['Seoul', 'Beijing', 'Tokyo', 'Osaka'], correctIndex: 2 },
    { question: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'], correctIndex: 1 },
    { question: 'What is the longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correctIndex: 1 },
    { question: 'In which country is the Great Wall located?', options: ['Japan', 'India', 'China', 'Mongolia'], correctIndex: 2 },
    { question: 'What is the smallest country in the world?', options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], correctIndex: 1 },
  ],
};

function pickFallback(categories, count) {
  const catList = Array.isArray(categories) && categories.length ? categories : ['math', 'science', 'gk'];
  const all = [];
  for (const cat of catList) {
    const pool = FALLBACK_QUESTIONS[cat] || FALLBACK_QUESTIONS.math;
    for (const q of pool) {
      all.push({ ...q, category: cat });
    }
  }
  const shuffled = all.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export async function generateQuestions(categories, count = 10) {
  const catList = Array.isArray(categories) && categories.length ? categories : ['math', 'science', 'gk'];
  const catStr = catList.join(', ');

  if (!genAI) {
    return pickFallback(catList, count);
  }

  const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-flash', 'gemini-pro'];
  const prompt = `You are a quiz generator. Return exactly ${count} multiple-choice questions.
Categories to use: ${catStr}. Mix difficulty from medium to hard.
Return ONLY a valid JSON array, no markdown or extra text. Each object must have:
- "question": string
- "options": array of exactly 4 strings
- "correctIndex": number (0-3)
- "category": one of "math", "science", "gk"

Example: [{"question":"What is 2+2?","options":["3","4","5","6"],"correctIndex":1,"category":"math"}]`;

  let lastErr;
  for (const modelId of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      console.log(`[Quiz] Fetching ${count} questions from Gemini (model: ${modelId}, categories: ${catStr})`);
      const result = await model.generateContent(prompt);
      const text = result.response?.text?.()?.trim() || '';
      let json = text.replace(/^```json?\s*|\s*```$/g, '').trim();
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid response');
      const mapped = parsed.slice(0, count).map((q) => ({
        question: q.question || '',
        options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
        correctIndex: Math.min(3, Math.max(0, parseInt(q.correctIndex, 10) || 0)),
        category: q.category || catList[0],
      }));
      console.log(`[Quiz] Gemini returned ${mapped.length} questions (model: ${modelId})`);
      return mapped.sort(() => Math.random() - 0.5);
    } catch (err) {
      lastErr = err;
      console.warn(`[Quiz] Model ${modelId} failed:`, err.message);
    }
  }
  console.error('[Quiz] All Gemini models failed:', lastErr?.message);
  return pickFallback(catList, count);
}
