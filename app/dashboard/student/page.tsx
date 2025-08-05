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
import { LogOut, Clock, X } from "lucide-react";

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [quizzesMap, setQuizzesMap] = useState<Map<string, Quiz>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [ranks, setRanks] = useState<Map<string, number>>(new Map());
  const [deletingSubmission, setDeletingSubmission] = useState<string | null>(null);

  useEffect(() => {
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
    if (!confirm("Are you sure you want to delete this quiz attempt? This action cannot be undone.")) {
      return;
    }

    setDeletingSubmission(submissionId);
    try {
      await firestoreDb.submissions.delete(submissionId);
      setSubmissions(submissions.filter(submission => submission.id !== submissionId));
    } catch (err: any) {
      console.error("Error deleting submission:", err);
      alert("Failed to delete quiz attempt. Please try again.");
    } finally {
      setDeletingSubmission(null);
    }
  };

  if (!user) {
    return <div className="container mx-auto p-6 text-center">Loading...</div>;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        Loading student dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.email}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle>Join a New Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleJoinQuiz}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1">
              <Label htmlFor="roomCode">Enter Room Code</Label>
              <Input
                id="roomCode"
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                placeholder="e.g., ABC123"
                className="mt-1"
                required
              />
            </div>
            <Button type="submit" className="sm:self-end">
              Join Quiz
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Your Attempted Quizzes</h2>
      {submissions.length === 0 ? (
        <p className="text-gray-500">
          You haven't attempted any quizzes yet. Enter a room code above to join
          one!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {submissions.map((submission) => {
            const quiz = quizzesMap.get(submission.quizId);
            if (!quiz) return null;

            const submittedDate = (
              submission.submittedAt as Timestamp
            ).toDate();
            const rank = ranks.get(submission.id);

            return (
              <Card key={submission.id} className="shadow-md relative group">
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteSubmission(submission.id)}
                  disabled={deletingSubmission === submission.id}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                  title="Delete Quiz Attempt"
                >
                  {deletingSubmission === submission.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </button>

                <CardHeader>
                  <CardTitle>{quiz.subject} Quiz</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Difficulty: {quiz.difficulty}
                    </p>
                    <p className="text-sm text-gray-600">
                      Your Score:{" "}
                      <span className="font-bold">
                        {submission.score} / {quiz.questions.length}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Clock className="h-4 w-4" />
                      <span>Time Limit: {quiz.timeLimit || 30} minutes</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Rank:{" "}
                      {rank !== null
                        ? `${rank} / ${submissions.length}`
                        : "Calculating..."}
                    </p>
                    <p className="text-sm text-gray-600">
                      Attempted On: {submittedDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link href={`/join/${quiz.roomCode}`} passHref>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
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
  );
}
