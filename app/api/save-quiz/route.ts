// This Route Handler saves the generated/edited quiz to the database.

import { NextResponse } from "next/server"
import { firestoreDb } from "@/lib/db" // Use firestoreDb
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  try {
    const { quizData, teacherId } = await req.json()

    if (!quizData || !teacherId) {
      return NextResponse.json({ error: "Missing quiz data or teacher ID" }, { status: 400 })
    }

    // Generate a simple room code (e.g., 6-character alphanumeric)
    // Ensure uniqueness in a real app (e.g., by checking if it exists before saving)
    const roomCode = uuidv4().substring(0, 6).toUpperCase()

    const newQuiz = await firestoreDb.quizzes.create({
      ...quizData,
      teacherId,
      roomCode,
    })

    return NextResponse.json({ quizId: newQuiz.id, roomCode: newQuiz.roomCode })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json({ error: error.message || "Failed to save quiz" }, { status: 500 })
  }
}
