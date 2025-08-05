"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { GeneratedQuestion } from "@/lib/ai";
import type { Quiz } from "@/lib/db";
import { Clock, Edit3, Save, CheckCircle } from "lucide-react";

interface QuizFormEditorProps {
  initialQuizData: GeneratedQuestion[];
  onSave: (
    quiz: Omit<
      Quiz,
      "id" | "createdAt" | "updatedAt" | "roomCode" | "teacherId"
    >
  ) => Promise<void>;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  numQuestions: number;
  prompt: string;
}

export function QuizFormEditor({
  initialQuizData,
  onSave,
  subject,
  difficulty,
  numQuestions,
  prompt,
}: QuizFormEditorProps) {
  const [questions, setQuestions] =
    useState<GeneratedQuestion[]>(initialQuizData);
  const [timeLimit, setTimeLimit] = useState(30); // Default 30 minutes
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTimeMinutes, setCustomTimeMinutes] = useState(30);
  const [isSaving, setIsSaving] = useState(false);

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (qIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answer = value;
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const finalTimeLimit = useCustomTime ? customTimeMinutes : timeLimit;
      await onSave({
        subject,
        difficulty,
        numQuestions,
        prompt,
        questions,
        timeLimit: finalTimeLimit,
      });
    } catch (error) {
      console.error("Failed to save quiz:", error);
      alert("Failed to save quiz. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getTimeDisplay = () => {
    if (useCustomTime) {
      return customTimeMinutes;
    }
    return timeLimit;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <Edit3 className="h-8 w-8 text-blue-600" />
          Edit Your Quiz
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Review and customize the AI-generated questions. You can edit
          questions, options, correct answers, and set the time limit for your
          students.
        </p>
      </div>

      {/* Quiz Info Summary */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardTitle className="text-2xl font-bold">Quiz Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">Subject</h3>
              <p className="text-lg font-bold text-blue-600">{subject}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800">Difficulty</h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                  difficulty
                )}`}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800">Questions</h3>
              <p className="text-lg font-bold text-green-600">
                {questions.length}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800">Prompt</h3>
              <p className="text-sm text-purple-600 truncate" title={prompt}>
                {prompt}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Settings Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Quiz Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label
              htmlFor="timeLimit"
              className="text-lg font-semibold text-gray-700"
            >
              Time Limit Configuration
            </Label>
            <div className="space-y-4 mt-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  id="useCustomTime"
                  checked={useCustomTime}
                  onCheckedChange={(checked) =>
                    setUseCustomTime(checked as boolean)
                  }
                />
                <Label
                  htmlFor="useCustomTime"
                  className="text-base font-medium"
                >
                  Use custom time limit
                </Label>
              </div>

              {useCustomTime ? (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label
                    htmlFor="customTime"
                    className="text-base font-medium text-blue-800"
                  >
                    Custom Time Limit (minutes)
                  </Label>
                  <Input
                    id="customTime"
                    type="number"
                    min="1"
                    max="480"
                    value={customTimeMinutes}
                    onChange={(e) =>
                      setCustomTimeMinutes(Number(e.target.value))
                    }
                    placeholder="Enter time in minutes"
                    className="w-full text-lg"
                  />
                  <p className="text-sm text-blue-600">
                    Enter a value between 1 and 480 minutes (8 hours)
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <Label
                    htmlFor="timeLimit"
                    className="text-base font-medium text-green-800 mb-3 block"
                  >
                    Select Preset Time Limit
                  </Label>
                  <Select
                    value={timeLimit.toString()}
                    onValueChange={(value) => setTimeLimit(Number(value))}
                  >
                    <SelectTrigger id="timeLimit" className="w-full text-lg">
                      <SelectValue placeholder="Select time limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-lg font-bold text-blue-800">
                      Selected Time Limit: {getTimeDisplay()} minutes
                    </p>
                    <p className="text-sm text-blue-600">
                      Students will have {getTimeDisplay()} minutes to complete
                      this quiz
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Questions ({questions.length})
        </h3>
        {questions.map((q, qIndex) => (
          <Card
            key={qIndex}
            className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow"
          >
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                  Q{qIndex + 1}
                </span>
                Question {qIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label
                  htmlFor={`question-${qIndex}`}
                  className="text-base font-semibold text-gray-700 mb-2 block"
                >
                  Question Text
                </Label>
                <Textarea
                  id={`question-${qIndex}`}
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                  className="min-h-[100px] text-base"
                  placeholder="Enter your question here..."
                />
              </div>

              <div>
                <Label className="text-base font-semibold text-gray-700 mb-3 block">
                  Options (Select the correct answer)
                </Label>
                <RadioGroup
                  value={q.answer}
                  onValueChange={(value) => handleAnswerChange(qIndex, value)}
                  className="space-y-3"
                >
                  {q.options.map((option, oIndex) => (
                    <div
                      key={oIndex}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <RadioGroupItem
                        value={option}
                        id={`option-${qIndex}-${oIndex}`}
                        className="text-blue-600"
                      />
                      <Input
                        id={`option-input-${qIndex}-${oIndex}`}
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(qIndex, oIndex, e.target.value)
                        }
                        className="flex-1 text-base border-0 bg-transparent focus:ring-0"
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <div className="text-center pt-6">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Saving Quiz...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Quiz
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
