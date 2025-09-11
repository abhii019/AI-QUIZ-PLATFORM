"use client";

import { useState, useEffect } from "react";
import { QuizViewer } from "@/components/quiz-viewer";
import { CountdownTimer } from "@/components/countdown-timer";
import { QuizResultsForStudent } from "@/components/quiz-results-for-student";
import { useAuth } from "@/hooks/use-auth";
import { submitQuizAction } from "@/app/actions/quiz-actions";
import type { Quiz } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuizClientWrapperProps {
  quiz: Omit<Quiz, "createdAt" | "updatedAt" | "startTime" | "endTime"> & {
    createdAt: string | null;
    updatedAt: string | null;
  }; // Quiz data serialized from server
  isQuizActive: boolean;
  quizEndTime: string | null;
  isQuizUpcoming: boolean;
}

export function QuizClientWrapper({
  quiz,
  isQuizActive,
  quizEndTime,
  isQuizUpcoming,
}: QuizClientWrapperProps) {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [timeLimit] = useState(quiz.timeLimit || 30); // Use quiz time limit or default to 30 minutes

  // Start the timer when the component mounts
  useEffect(() => {
    if (!quizStartTime) {
      setQuizStartTime(new Date());
    }
  }, [quizStartTime]);

  const handleSubmitQuiz = async (
    answers: { questionIndex: number; selectedOption: string }[]
  ) => {
    if (authLoading) {
      setSubmissionError("Authentication still loading. Please wait.");
      return;
    }
    if (!user) {
      setSubmissionError("You must be logged in to submit a quiz.");
      return;
    }

    setSubmissionError(null);
    try {
      await submitQuizAction(quiz.id, user.uid, user.email || "", answers);
      setSubmitted(true);
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      setSubmissionError(
        error.message || "Failed to submit quiz. Please try again."
      );
    }
  };

  const handleTimeUp = () => {
    alert("Time's up! Quiz will be submitted automatically.");
    // You can implement auto-submission here if needed
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="text-center p-8">Loading user authentication...</div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">Please log in to take this quiz.</p>
        <Button  className="w-20 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"

      
          onClick={() => router.push("/sign-in")}
        >
          Log in
        </Button>
      </div>
    );
  }

  if (!isQuizActive) {
    return (
      <div className="text-center p-8">
        <p className="text-2xl text-gray-700">
          This quiz is currently unavailable.
        </p>
      </div>
    );
  }

  // Convert createdAt and updatedAt back to Timestamp if needed
  function toTimestamp(date: string | null): any {
    return date ? new Date(date) : null;
  }

  const quizForViewer = {
    ...quiz,
    createdAt: toTimestamp(quiz.createdAt),
    updatedAt: toTimestamp(quiz.updatedAt),
  };

  return (
    <>
      {submissionError && (
        <p className="text-red-500 text-center mb-4">{submissionError}</p>
      )}
      {submitted ? (
        <QuizResultsForStudent
          quizId={quiz.id}
          quizTotalQuestions={quiz.questions.length}
        />
      ) : (
        <>
          {/* Header with logout button */}
          <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {quiz.subject} Quiz
              </h3>
              <p className="text-sm text-gray-600">Student: {user.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          {quizStartTime && (
            <div className="mb-4 text-center">
              <p className="text-lg text-gray-700">Time remaining:</p>
              <CountdownTimer
                targetDate={
                  new Date(quizStartTime.getTime() + timeLimit * 60 * 1000)
                }
                onTimerEnd={handleTimeUp}
              />
            </div>
          )}
          <QuizViewer
            quiz={quizForViewer as Quiz}
            onSubmit={handleSubmitQuiz}
          />
        </>
      )}
    </>
  );
}
