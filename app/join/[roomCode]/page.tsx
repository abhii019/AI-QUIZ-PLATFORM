// app/join/[roomCode]/page.tsx

import { firestoreDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizClientWrapper } from "@/components/quiz-client-wrapper";
import { Clock } from "lucide-react";

interface JoinQuizPageProps {
  params: {
    roomCode: string;
  };
}

export default async function JoinQuizPage({ params }: JoinQuizPageProps) {
  const { roomCode } = params;
  const quiz = await firestoreDb.quizzes.getByRoomCode(roomCode.toUpperCase());

  if (!quiz) {
    notFound();
  }

  // ✅ Serialize timestamps for client usage
  const { startTime, endTime, ...quizWithoutTimes } = quiz;
  const quizForClient = {
    ...quizWithoutTimes,
    createdAt: quiz?.createdAt?.seconds
      ? new Date(quiz.createdAt.seconds * 1000).toISOString()
      : null,
    updatedAt: quiz?.updatedAt?.seconds
      ? new Date(quiz.updatedAt.seconds * 1000).toISOString()
      : null,
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-4xl font-extrabold text-purple-700">
            Welcome to the Quiz!
          </CardTitle>
          <p className="text-center text-lg text-gray-500">
            Room Code:{" "}
            <span className="font-mono font-bold text-purple-600">
              {roomCode.toUpperCase()}
            </span>
          </p>
          <div className="text-center space-y-2">
            <p className="text-lg text-gray-600">
              Subject: <span className="font-semibold">{quiz.subject}</span> |
              Difficulty:{" "}
              <span className="font-semibold">{quiz.difficulty}</span> |
              Questions:{" "}
              <span className="font-semibold">{quiz.questions.length}</span>
            </p>
            <div className="flex items-center justify-center gap-2 text-lg text-blue-600">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">
                Time Limit: {quiz.timeLimit || 30} minutes
              </span>
            </div>
            <p className="text-sm text-gray-500">
              ⚠️ Timer will start as soon as you begin the quiz
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <QuizClientWrapper
            quiz={quizForClient}
            isQuizActive={true}
            quizEndTime={null}
            isQuizUpcoming={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
