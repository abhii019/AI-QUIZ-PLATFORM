// This is a Next.js Route Handler that acts as an API endpoint
// for generating quizzes using the AI model.

import { NextResponse } from "next/server"
import { generateQuizFromPrompt } from "@/lib/ai"

export async function POST(req: Request) {
  try {
    const { subject, difficulty, numQuestions, prompt } = await req.json()

    if (!subject || !difficulty || !numQuestions || !prompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const generatedQuiz = await generateQuizFromPrompt({
      subject,
      difficulty,
      numQuestions,
      prompt,
    })

    return NextResponse.json(generatedQuiz)
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate quiz" }, { status: 500 })
  }
}
