"use client";

import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizFormEditor } from "@/components/quiz-form-editor";
import type { GeneratedQuestion } from "@/lib/ai";
import type { Quiz } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";
import {
  CheckCircle,
  Copy,
  Share2,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

export default function CreateQuizPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [numQuestions, setNumQuestions] = useState(5);
  const [prompt, setPrompt] = useState("");
  const [generatedQuiz, setGeneratedQuiz] = useState<
    GeneratedQuestion[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizSaved, setQuizSaved] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedQuiz(null);
    setQuizSaved(false);
    setRoomCode(null);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, difficulty, numQuestions, prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }

      const data = await response.json();
      setGeneratedQuiz(data.questions);
    } catch (err: any) {
      setError(err.message);
      console.error("Error generating quiz:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuiz = async (
    quizData: Omit<
      Quiz,
      "id" | "createdAt" | "updatedAt" | "roomCode" | "teacherId"
    >
  ) => {
    if (!user) {
      throw new Error("You must be logged in to create a quiz");
    }

    try {
      const response = await fetch("/api/save-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quizData, teacherId: user.uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save quiz");
      }

      const data = await response.json();
      setQuizSaved(true);
      setRoomCode(data.roomCode);
    } catch (err: any) {
      setError(err.message);
      console.error("Error saving quiz:", err);
      throw err;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Quiz</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/teacher")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {!generatedQuiz ? (
        <Card className="shadow-lg max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Quiz Generation Parameters
            </CardTitle>
            <p className="text-gray-600">
              Configure your quiz settings and generate questions using AI
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateQuiz} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., JavaScript, History, Physics"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={difficulty}
                    onValueChange={(value) =>
                      setDifficulty(value as "easy" | "medium" | "hard")
                    }
                  >
                    <SelectTrigger id="difficulty" className="mt-1">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="numQuestions">Number of Questions</Label>
                <Input
                  id="numQuestions"
                  type="number"
                  value={numQuestions}
                  onChange={(e) =>
                    setNumQuestions(Number.parseInt(e.target.value))
                  }
                  min={1}
                  max={20}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="prompt">Specific Topic/Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Key events of World War II', 'Basic React hooks', 'Newton's Laws of Motion'"
                  rows={3}
                  required
                  className="mt-1"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Quiz...
                  </>
                ) : (
                  "Generate Quiz"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <QuizFormEditor
          initialQuizData={generatedQuiz}
          onSave={handleSaveQuiz}
          subject={subject}
          difficulty={difficulty}
          numQuestions={numQuestions}
          prompt={prompt}
        />
      )}

      {quizSaved && roomCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl shadow-2xl">
            <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-green-700">
                Quiz Successfully Created!
              </CardTitle>
              <p className="text-gray-600">
                Your quiz is ready to share with students
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Room Code
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-blue-600">
                      {roomCode}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(roomCode)}
                      className="ml-2"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">
                    Direct Link
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-600 truncate flex-1 mr-2">
                      {`${window.location.origin}/join/${roomCode}`}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/join/${roomCode}`
                        )
                      }
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => router.push("/dashboard/teacher")}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`/join/${roomCode}`, "_blank")}
                  className="flex-1"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
