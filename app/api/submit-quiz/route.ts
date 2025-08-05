// This Route Handler handles student quiz submissions.


import { NextResponse } from "next/server"
import { firestoreDb } from "@/lib/db" // Use firestoreDb

export async function POST(req: Request) {
  try {
    const { quizId, studentId, answers } = await req.json()

    if (!quizId || !studentId || !answers) {
      return NextResponse.json({ error: "Missing quiz ID, student ID, or answers" }, { status: 400 })
    }

    const quiz = await firestoreDb.quizzes.getById(quizId)
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    let score = 0
    answers.forEach((studentAnswer: { questionIndex: number; selectedOption: string }) => {
      const question = quiz.questions[studentAnswer.questionIndex]
      if (question && question.answer === studentAnswer.selectedOption) {
        score++
      }
    })

    const newSubmission = await firestoreDb.submissions.create({
      quizId,
      studentId,
      answers,
      score,
    })

    // In a real-time scenario, you'd broadcast this update (e.g., via WebSockets)
    // For now, we just return the score.
    return NextResponse.json({ score: newSubmission.score, totalQuestions: quiz.questions.length })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json({ error: error.message || "Failed to submit quiz" }, { status: 500 })
  }
}
