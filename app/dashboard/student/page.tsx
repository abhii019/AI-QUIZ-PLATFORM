"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { firestoreDb, type Submission, type Quiz } from "@/lib/db";
import type { Timestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Clock, X, BookOpen, Trophy, Target } from "lucide-react";

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [quizzesMap, setQuizzesMap] = useState<Map<string, Quiz>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [ranks, setRanks] = useState<Map<string, number>>(new Map());
  const [deletingSubmission, setDeletingSubmission] = useState<string | null>(
    null
  );

  useEffect(() => {
    console.log(user);
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const fetchStudentData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedSubmissions: Submission[] =
          await firestoreDb.submissions.getByStudentId(user.uid);
        setSubmissions(fetchedSubmissions);

        const newQuizzesMap = new Map<string, Quiz>();
        for (const submission of fetchedSubmissions) {
          if (!newQuizzesMap.has(submission.quizId)) {
            const quiz = await firestoreDb.quizzes.getById(submission.quizId);
            if (quiz) {
              newQuizzesMap.set(submission.quizId, quiz);
            }
          }
        }
        setQuizzesMap(newQuizzesMap);

        const newRanks = new Map<string, number>();
        for (const submission of fetchedSubmissions) {
          const quiz = quizzesMap.get(submission.quizId);
          if (quiz) {
            const allSubmissionsForQuiz =
              await firestoreDb.submissions.getByQuizId(quiz.id);
            allSubmissionsForQuiz.sort((a, b) => {
              if (b.score !== a.score) {
                return b.score - a.score;
              }
              const timeA = (a.submittedAt as Timestamp).toMillis();
              const timeB = (b.submittedAt as Timestamp).toMillis();
              return timeA - timeB;
            });
            const rank =
              allSubmissionsForQuiz.findIndex((s) => s.id === submission.id) +
              1;
            newRanks.set(submission.id, rank);
          }
        }
        setRanks(newRanks);
      } catch (err: any) {
        console.error("Error fetching student data:", err);
        setError(err.message || "Failed to load student dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user, router]);

  const handleJoinQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCodeInput.trim()) {
      router.push(`/join/${roomCodeInput.trim().toUpperCase()}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this quiz attempt? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingSubmission(submissionId);
    try {
      await firestoreDb.submissions.delete(submissionId);
      setSubmissions(
        submissions.filter((submission) => submission.id !== submissionId)
      );
    } catch (err: any) {
      console.error("Error deleting submission:", err);
      alert("Failed to delete quiz attempt. Please try again.");
    } finally {
      setDeletingSubmission(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="text-emerald-700 mt-4 text-lg">
            Loading student dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-xl backdrop-blur-sm bg-white/80 border-red-200">
          <CardContent className="text-center p-6">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-cyan-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto p-6 relative z-10">
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Student Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Welcome back, {user.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 bg-transparent"
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <Card className="mb-8 shadow-xl backdrop-blur-sm bg-white/80 border-emerald-200/50 animate-fade-in delay-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <BookOpen className="h-5 w-5" />
              Join a New Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleJoinQuiz}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1">
                <Label htmlFor="roomCode" className="text-gray-700">
                  Enter Room Code
                </Label>
                <Input
                  id="roomCode"
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value)}
                  placeholder="e.g., ABC123"
                  className="mt-1 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                  required
                />
              </div>
              <Button
                type="submit"
                className="sm:self-end bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
              >
                Join Quiz
              </Button>
            </form>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold mb-6 text-emerald-800 flex items-center gap-2 animate-fade-in delay-200">
          <Trophy className="h-6 w-6" />
          Your Attempted Quizzes
        </h2>

        {submissions.length === 0 ? (
          <Card className="shadow-xl backdrop-blur-sm bg-white/80 border-emerald-200/50 animate-fade-in delay-300">
            <CardContent className="text-center p-8">
              <Target className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                You haven't attempted any quizzes yet. Enter a room code above
                to join one!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((submission, index) => {
              const quiz = quizzesMap.get(submission.quizId);
              if (!quiz) return null;

              const submittedDate = (
                submission.submittedAt as Timestamp
              ).toDate();
              const rank = ranks.get(submission.id);

              return (
                <Card
                  key={submission.id}
                  className="shadow-xl backdrop-blur-sm bg-white/80 border-emerald-200/50 relative group hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <button
                    onClick={() => handleDeleteSubmission(submission.id)}
                    disabled={deletingSubmission === submission.id}
                    className="absolute top-3 right-3 p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 hover:scale-110"
                    title="Delete Quiz Attempt"
                  >
                    {deletingSubmission === submission.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>

                  <CardHeader>
                    <CardTitle className="text-emerald-700 pr-8">
                      {quiz.subject} Quiz
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Difficulty:
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                          {quiz.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Your Score:
                        </span>
                        <span className="font-bold text-emerald-700">
                          {submission.score} / {quiz.questions.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-cyan-600 bg-cyan-50 rounded-lg p-2">
                        <Clock className="h-4 w-4" />
                        <span>Time Limit: {quiz.timeLimit || 30} minutes</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rank:</span>
                        <span className="font-semibold text-amber-600">
                          {rank !== null
                            ? `${rank} / ${submissions.length}`
                            : "Calculating..."}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">
                        Attempted On: {submittedDate.toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-6">
                      <Link href={`/join/${quiz.roomCode}`} passHref>
                        <Button
                          variant="outline"
                          className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 bg-transparent"
                        >
                          Review Quiz
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
