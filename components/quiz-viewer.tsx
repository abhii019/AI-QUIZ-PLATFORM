"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { Quiz } from "@/lib/db" // Import Quiz type for consistency

interface QuizViewerProps {
  quiz: Quiz
  onSubmit: (answers: { questionIndex: number; selectedOption: string }[]) => Promise<void>
}

export function QuizViewer({ quiz, onSubmit }: QuizViewerProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null)

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const answersArray = Object.entries(selectedAnswers).map(([qIndex, selectedOption]) => ({
      questionIndex: Number.parseInt(qIndex),
      selectedOption,
    }))

    try {
      // Call the onSubmit prop which will handle the actual submission
      await onSubmit(answersArray)
      setSubmitted(true)
      // For this example, let's simulate receiving the score
      const calculatedScore = answersArray.filter(
        (ans) => quiz.questions[ans.questionIndex]?.answer === ans.selectedOption,
      ).length
      setScore(calculatedScore)
      setTotalQuestions(quiz.questions.length)
    } catch (error) {
      console.error("Failed to submit quiz:", error)
      alert("Failed to submit quiz. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-3xl font-bold text-center">{quiz.subject} Quiz</h2>
      <p className="text-center text-lg text-gray-600">Difficulty: {quiz.difficulty}</p>

      {submitted ? (
        <Card className="shadow-lg border-green-500">
          <CardHeader>
            <CardTitle className="text-center text-green-600">Quiz Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-xl font-semibold">
            Your Score: {score !== null ? `${score} / ${totalQuestions}` : "Calculating..."}
            <p className="mt-4 text-sm text-gray-500">
              Your ranking and real-time comparison with other participants will be available on your dashboard.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {quiz.questions.map((q, qIndex) => (
            <Card key={qIndex} className="shadow-md">
              <CardHeader>
                <CardTitle>Question {qIndex + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg font-medium">{q.question}</p>
                <RadioGroup
                  value={selectedAnswers[qIndex] || ""}
                  onValueChange={(value) => handleAnswerChange(qIndex, value)}
                  className="space-y-2"
                >
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`q${qIndex}-o${oIndex}`} />
                      <Label htmlFor={`q${qIndex}-o${oIndex}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
          <Button className="bg-emerald-400  hover:via-teal-800"
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(selectedAnswers).length !== quiz.questions.length }
          >
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </Button>
          {Object.keys(selectedAnswers).length !== quiz.questions.length && (
            <p className="text-sm text-red-500 mt-2">Please answer all questions before submitting.</p>
          )}
        </>
      )}
    </div>
  )
}
