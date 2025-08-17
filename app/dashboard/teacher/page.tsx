"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { firestoreDb, type Quiz } from "@/lib/db"
import { PlusCircle, LogOut, Clock, X, ClockFading } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function TeacherDashboardPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loadingQuizzes, setLoadingQuizzes] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingQuiz, setDeletingQuiz] = useState<string | null>(null)
  const { user, logout, loading } = useAuth()
  const router = useRouter()


useEffect(() => {
  if (loading) return; // wait until Firebase resolves auth state

  if (!user) {
    router.push("/sign-in");
    console.log(user);
    return;
  }

  const fetchQuizzes = async () => {
    setLoadingQuizzes(true);
    setError(null);

    try {
      const fetchedQuizzes: Quiz[] = await firestoreDb.quizzes.getByTeacherId(user.uid);
      setQuizzes(fetchedQuizzes);
    } catch (err: any) {
      console.error("Error fetching quizzes:", err);
      setError(err.message || "Failed to load quizzes.");
    } finally {
      setLoadingQuizzes(false);
    }
  };

  fetchQuizzes();
}, [user, loading, router]);


  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return
    }

    setDeletingQuiz(quizId)
    try {
      await firestoreDb.quizzes.delete(quizId)
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId))
    } catch (err: any) {
      console.error("Error deleting quiz:", err)
      alert("Failed to delete quiz. Please try again.")
    } finally {
      setDeletingQuiz(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (loadingQuizzes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-red-200">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Teacher Dashboard</h1>
            <p className="text-emerald-100">Welcome back, {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              <Link href="/dashboard/teacher/create-quiz">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Quiz
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-white drop-shadow">Your Quizzes</h2>
        {quizzes.length === 0 ? (
          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">
                You haven't created any quizzes yet. Click "Create New Quiz" to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="backdrop-blur-sm bg-white/90 border-0 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 relative group"
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteQuiz(quiz.id)}
                  disabled={deletingQuiz === quiz.id}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                  title="Delete Quiz"
                >
                  {deletingQuiz === quiz.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </button>

                <CardHeader>
                  <CardTitle className="text-gray-800">{quiz.subject} Quiz</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Difficulty: {quiz.difficulty}</p>
                    <p className="text-sm text-gray-600">Questions: {quiz.questions.length}</p>
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                      <Clock className="h-4 w-4" />
                      <span>Time Limit: {quiz.timeLimit || 30} minutes</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Room Code: <span className="font-mono font-bold text-emerald-600">{quiz.roomCode}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Created:{" "}
                      {quiz.createdAt instanceof Date
                        ? quiz.createdAt.toLocaleDateString()
                        : new Date(quiz.createdAt.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-col space-y-2">
                    <Link href={`/join/${quiz.roomCode}`} passHref>
                      <Button
                        variant="outline"
                        className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                      >
                        View Test
                      </Button>
                    </Link>
                    <Link href={`/dashboard/teacher/quiz-results/${quiz.id}`} passHref>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">View Results</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
