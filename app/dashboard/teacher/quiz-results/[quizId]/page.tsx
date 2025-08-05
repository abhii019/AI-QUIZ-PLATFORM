"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { firestoreDb, type Quiz, type Submission } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Award,
  Users,
  Clock,
  BarChart3,
  Download,
  Mail,
  Calendar,
  Target,
} from "lucide-react";
import type { Timestamp } from "firebase/firestore";

export default function TeacherQuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const fetchQuizResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const quizId = params.quizId as string;
        const quizData = await firestoreDb.quizzes.getById(quizId);

        if (!quizData) {
          setError("Quiz not found");
          return;
        }

        // Check if the teacher owns this quiz
        if (quizData.teacherId !== user.uid) {
          setError("You don't have permission to view this quiz");
          return;
        }

        setQuiz(quizData);

        // Fetch submissions for this quiz
        const submissionsData = await firestoreDb.submissions.getByQuizId(
          quizId
        );
        setSubmissions(submissionsData);
      } catch (err: any) {
        console.error("Error fetching quiz results:", err);
        setError(err.message || "Failed to load quiz results");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResults();
  }, [params.quizId, user, router]);

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

  const getScoreGrade = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  const calculateStats = () => {
    if (submissions.length === 0) return null;

    const totalScore = submissions.reduce((sum, sub) => sum + sub.score, 0);
    const averageScore = totalScore / submissions.length;
    const maxScore = Math.max(...submissions.map((sub) => sub.score));
    const minScore = Math.min(...submissions.map((sub) => sub.score));
    const passCount = submissions.filter(
      (sub) => (sub.score / quiz!.questions.length) * 100 >= 60
    ).length;

    return {
      averageScore: averageScore.toFixed(1),
      maxScore,
      minScore,
      passCount,
      passRate: ((passCount / submissions.length) * 100).toFixed(1),
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading quiz results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <BarChart3 className="h-16 w-16 mx-auto mb-2" />
            <p className="text-xl font-semibold">Error Loading Results</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={() => router.push("/dashboard/teacher")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-lg text-gray-600">Quiz not found</p>
          <Button
            onClick={() => router.push("/dashboard/teacher")}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {quiz.subject} Quiz Results
          </h1>
          <p className="text-gray-600">Room Code: {quiz.roomCode}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/teacher")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Quiz Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {submissions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Average Score
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {stats
                    ? `${stats.averageScore}/${quiz.questions.length}`
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Pass Rate</p>
                <p className="text-2xl font-bold text-purple-800">
                  {stats ? `${stats.passRate}%` : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-orange-600 font-medium">
                  Time Limit
                </p>
                <p className="text-2xl font-bold text-orange-800">
                  {quiz.timeLimit || 30}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">Student Results</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Results
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">
                No students have taken this quiz yet
              </p>
              <p className="text-sm text-gray-500">
                Share the room code with your students to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-purple-50 text-left text-sm font-medium text-gray-700">
                    <th className="py-4 px-6 border-b">Rank</th>
                    <th className="py-4 px-6 border-b">Student Email</th>
                    <th className="py-4 px-6 border-b">Score</th>
                    <th className="py-4 px-6 border-b">Percentage</th>
                    <th className="py-4 px-6 border-b">Grade</th>
                    <th className="py-4 px-6 border-b">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission, index) => {
                    const percentage = (
                      (submission.score / quiz.questions.length) *
                      100
                    ).toFixed(1);
                    const grade = getScoreGrade(
                      submission.score,
                      quiz.questions.length
                    );

                    // Debug logging to check email issue
                    console.log("Teacher results submission:", {
                      id: submission.id,
                      studentId: submission.studentId,
                      studentEmail: submission.studentEmail,
                      score: submission.score,
                    });

                    return (
                      <tr
                        key={submission.id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50 transition-colors`}
                      >
                        <td className="py-4 px-6 border-b">
                          <div className="flex items-center gap-2">
                            {getRankIcon(index + 1)}
                            <span className="font-semibold">{index + 1}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 border-b">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-800">
                              {submission.studentEmail ||
                                `Student ${submission.studentId.slice(-4)}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 border-b">
                          <span
                            className={`font-bold ${getScoreColor(
                              submission.score,
                              quiz.questions.length
                            )}`}
                          >
                            {submission.score} / {quiz.questions.length}
                          </span>
                        </td>
                        <td className="py-4 px-6 border-b">
                          <span
                            className={`font-semibold ${getScoreColor(
                              submission.score,
                              quiz.questions.length
                            )}`}
                          >
                            {percentage}%
                          </span>
                        </td>
                        <td className="py-4 px-6 border-b">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              grade === "A+" || grade === "A"
                                ? "bg-green-100 text-green-800"
                                : grade === "B"
                                ? "bg-blue-100 text-blue-800"
                                : grade === "C"
                                ? "bg-yellow-100 text-yellow-800"
                                : grade === "D"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {grade}
                          </span>
                        </td>
                        <td className="py-4 px-6 border-b text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {(submission.submittedAt as Timestamp)
                              .toDate()
                              .toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
