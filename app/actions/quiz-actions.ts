"use server";

import { firestoreDb } from "@/lib/db";
import type { Quiz } from "@/lib/db"; // Import Quiz type

export async function submitQuizAction(
  quizId: string,
  studentId: string,
  studentEmail: string,
  answers: { questionIndex: number; selectedOption: string }[]
) {
  if (!quizId || !studentId || !studentEmail || !answers) {
    throw new Error("Missing quiz ID, student ID, student email, or answers");
  }

  const quiz: Quiz | undefined = await firestoreDb.quizzes.getById(quizId);
  if (!quiz) {
    throw new Error("Quiz not found");
  }

  // Ensure the user is stored in the users collection
  try {
    const existingUser = await firestoreDb.users.getById(studentId);
    if (!existingUser) {
      await firestoreDb.users.create(studentId, {
        email: studentEmail,
        role: "student",
      });
    } else if (existingUser.email !== studentEmail) {
      // Update email if it changed
      await firestoreDb.users.update(studentId, { email: studentEmail });
    }
  } catch (error) {
    console.error("Error ensuring user is stored:", error);
    // Continue with quiz submission even if user storage fails
  }

  let score = 0;
  answers.forEach((studentAnswer) => {
    const question = quiz.questions[studentAnswer.questionIndex];
    if (question && question.answer === studentAnswer.selectedOption) {
      score++;
    }
  });

  const newSubmission = await firestoreDb.submissions.create({
    quizId,
    studentId,
    studentEmail,
    answers,
    score,
  });

  // Return the score and total questions for client-side display
  return { score: newSubmission.score, totalQuestions: quiz.questions.length };
}
