"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import type { Submission } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Trophy, Medal, Award, LogOut } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface QuizResultsForStudentProps {
  quizId: string;
  quizTotalQuestions: number;
}

export function QuizResultsForStudent({
  quizId,
  quizTotalQuestions,
}: QuizResultsForStudentProps) {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentRank, setStudentRank] = useState<number | null>(null);
  const [studentScore, setStudentScore] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const submissionsQuery = query(
      collection(db, "submissions"),
      where("quizId", "==", quizId),
      orderBy("score", "desc"),
      orderBy("submittedAt", "asc")
    );

    const unsubscribe = onSnapshot(
      submissionsQuery,
      (snapshot) => {
        try {
          const liveSubmissions: Submission[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Submission, "id">),
          }));
          setSubmissions(liveSubmissions);

          // Calculate student's rank and score
          const studentSubmissionIndex = liveSubmissions.findIndex(
            (s) => s.studentId === user.uid
          );
          if (studentSubmissionIndex !== -1) {
            setStudentRank(studentSubmissionIndex + 1);
            setStudentScore(liveSubmissions[studentSubmissionIndex].score);
          } else {
            setStudentRank(null);
            setStudentScore(null);
          }

          setLoading(false);
        } catch (err) {
          console.error("Error processing submissions:", err);
          setError("Failed to process quiz results.");
          setLoading(false);
        }
      },
      (err) => {
        console.error(
          "Error listening to submissions for student results:",
          err
        );
        setError("Failed to load real-time results.");
        setLoading(false);
      }
    );

    console.log("submissions", submissions);

    return () => unsubscribe();
  }, [quizId, user, authLoading]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2">Loading quiz results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Error Loading Results</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8 text-red-500">
        <p className="text-lg font-semibold">Authentication Required</p>
        <p className="text-sm">Please log in to view your results.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header with logout button */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Quiz Results</h3>
          <p className="text-sm text-gray-600">Student: {user.email}</p>
        </div>
        <Button variant="outline" onClick={handleLogout} size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Card className="shadow-lg border-green-500">
        <CardHeader>
          <CardTitle className="text-center text-green-600 flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6" />
            Quiz Submitted Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {studentScore !== null ? (
            <div>
              <p className="text-2xl font-bold">
                Your Score:{" "}
                <span
                  className={getScoreColor(studentScore, quizTotalQuestions)}
                >
                  {studentScore} / {quizTotalQuestions}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Percentage:{" "}
                {((studentScore / quizTotalQuestions) * 100).toFixed(1)}%
              </p>
            </div>
          ) : (
            <p className="text-xl">Your Score: Calculating...</p>
          )}

          {studentRank !== null ? (
            <div className="flex items-center justify-center gap-2">
              {getRankIcon(studentRank)}
              <p className="text-lg">
                Your Rank:{" "}
                <span className="font-bold text-blue-700">{studentRank}</span>{" "}
                out of {submissions.length} participants
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Your rank will appear once your submission is processed.
            </p>
          )}
        </CardContent>
      </Card>

      <div>
        <h3 className="text-2xl font-semibold mb-4 text-center flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Leaderboard
        </h3>

        {submissions.length === 0 ? (
          <Card className="text-center p-8">
            <p className="text-gray-500">No submissions yet for this quiz.</p>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-medium text-gray-700">
                  <th className="py-3 px-4 border-b">Rank</th>
                  <th className="py-3 px-4 border-b">Student Email</th>
                  <th className="py-3 px-4 border-b">Score</th>
                  <th className="py-3 px-4 border-b">Percentage</th>
                  <th className="py-3 px-4 border-b">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission, index) => {
                  const isCurrentUser = submission.studentId === user.uid;
                  const percentage = (
                    (submission.score / quizTotalQuestions) *
                    100
                  ).toFixed(1);

                  // Debug logging to check email issue
                  console.log("Leaderboard submission:", {
                    id: submission.id,
                    studentId: submission.studentId,
                    studentEmail: submission.studentEmail,
                    isCurrentUser,
                    userEmail: user.email,
                  });

                  return (
                    <tr
                      key={submission.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } ${isCurrentUser ? "bg-blue-100 font-bold" : ""}`}
                    >
                      <td className="py-3 px-4 border-b flex items-center gap-2">
                        {getRankIcon(index + 1)}
                        <span>{index + 1}</span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        {isCurrentUser ? (
                          <span className="text-blue-700">You</span>
                        ) : (
                          <span className="text-gray-600">
                            {submission.studentEmail ||
                              `Student ${submission.studentId.slice(-4)}`}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <span
                          className={getScoreColor(
                            submission.score,
                            quizTotalQuestions
                          )}
                        >
                          {submission.score} / {quizTotalQuestions}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <span
                          className={getScoreColor(
                            submission.score,
                            quizTotalQuestions
                          )}
                        >
                          {percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b text-sm text-gray-600">
                        {(submission.submittedAt as Timestamp)
                          .toDate()
                          .toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
