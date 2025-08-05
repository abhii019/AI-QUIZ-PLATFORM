"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google"; // Import Gemini from @ai-sdk/google

interface QuizGenerationInput {
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  numQuestions: number;
  prompt: string;
}

export interface GeneratedQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface GeneratedQuiz {
  questions: GeneratedQuestion[];
}

export async function generateQuizFromPrompt({
  subject,
  difficulty,
  numQuestions,
  prompt,
}: QuizGenerationInput): Promise<GeneratedQuiz> {
  const systemPrompt = `You are an expert quiz generator. Your task is to create a multiple-choice quiz based on the user's prompt.
Each question should have 4 distinct options, and exactly one correct answer.
The output MUST be a JSON object with a single key "questions", which is an array of question objects.
Each question object MUST have "question" (string), "options" (array of 4 strings), and "answer" (string, which must be one of the options).
Ensure the questions are ${difficulty} difficulty. remember i want only json format, no other text. just a JSON object.
example of a question object:
{
  "questions": [
    {
      "question": "What does JavaScript primarily add to HTML pages?",
      "options": [
        "Styling",
        "Structure",
        "Interactivity",
        "SEO Optimization"
      ],
      "answer": "Interactivity"
    }
  ]
}
i Just want the JSON object, no other text. Do not include any explanations or additional text outside of the JSON object just like "json word or anything else". The output should be a valid JSON object with the key "questions" containing an array of question objects. Each question object must have the keys "question", "options", and "answer". The options array must contain exactly 4 distinct strings, and the answer must be one of those options.
`;

  const userPrompt = `Generate a quiz on the subject of "${subject}".
The quiz should have ${numQuestions} questions.
Here is the specific topic/prompt: "${prompt}"`;

  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    });

    console.log("AI Response:", text);

    // Sanitize the AI response to remove any wrapping code block or markdown syntax
    const cleanedText = text
      .trim()
      .replace(/^```json/, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    const parsedText = JSON.parse(cleanedText);

    // Validate the parsed structure
    if (!parsedText.questions || !Array.isArray(parsedText.questions)) {
      throw new Error(
        "Invalid quiz format received from AI: missing questions array."
      );
    }

    parsedText.questions.forEach((q: any, index: number) => {
      if (
        typeof q.question !== "string" ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.answer !== "string" ||
        !q.options.includes(q.answer)
      ) {
        console.error(`Validation failed for question ${index}:`, q);
        throw new Error(
          `Invalid question format for question ${index}. Each question must have a 'question' string, 'options' array of 4 strings, and an 'answer' string that is one of the options.`
        );
      }
    });

    return parsedText as GeneratedQuiz;
  } catch (error) {
    console.error("Error generating quiz from AI:", error);
    throw new Error(
      "Failed to generate quiz. Please ensure your API key is correct and the prompt is clear."
    );
  }
}
