import { firestoreDb } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuizClientWrapper } from "@/components/quiz-client-wrapper"
import { Clock } from "lucide-react"

interface JoinPageProps {
  params: {
    roomCode: string
  }
}

// @ts-ignore
export default async function JoinQuizPage({ params }) {
  const { roomCode } = params

  const quiz = await firestoreDb.quizzes.getByRoomCode(roomCode.toUpperCase())

  if (!quiz) {
    notFound()
  }

  // ✅ Serialize timestamps for client usage
  const { startTime, endTime, ...quizWithoutTimes } = quiz
  const quizForClient = {
    ...quizWithoutTimes,
    createdAt: quiz?.createdAt?.seconds ? new Date(quiz.createdAt.seconds * 1000).toISOString() : null,
    updatedAt: quiz?.updatedAt?.seconds ? new Date(quiz.updatedAt.seconds * 1000).toISOString() : null,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-cyan-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto p-6 relative z-10">
        <Card className="shadow-2xl backdrop-blur-sm bg-white/80 border-emerald-200/50 animate-fade-in">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Welcome to the Quiz!
            </CardTitle>
            <p className="text-lg text-gray-600">
              Room Code:{" "}
              <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                {roomCode.toUpperCase()}
              </span>
            </p>
            <div className="space-y-3">
              <p className="text-lg text-gray-700">
                Subject: <span className="font-semibold text-emerald-700">{quiz.subject}</span> | Difficulty:{" "}
                <span className="font-semibold text-teal-700">{quiz.difficulty}</span> | Questions:{" "}
                <span className="font-semibold text-cyan-700">{quiz.questions.length}</span>
              </p>
              <div className="flex items-center justify-center gap-2 text-lg text-emerald-600 bg-emerald-50 rounded-lg p-3 mx-auto w-fit">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Time Limit: {quiz.timeLimit || 30} minutes</span>
              </div>
              <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-2 border border-amber-200">
                ⚠️ Timer will start as soon as you begin the quiz
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <QuizClientWrapper quiz={quizForClient} isQuizActive={true} quizEndTime={null} isQuizUpcoming={false} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
