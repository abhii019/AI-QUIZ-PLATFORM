"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, GraduationCap, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/firebase/config"

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user } = useAuth()

  const handleRoleSelection = async () => {
    if (!selectedRole || !user) {
      setError("Please select a role")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const collection = selectedRole === "teacher" ? "teachers" : "students"
      await setDoc(doc(db, collection, user.uid), {
        name: user.displayName || user.email,
        email: user.email,
        role: selectedRole,
        createdAt: new Date(),
      })

      router.push(`/dashboard/${selectedRole}`)
    } catch (err) {
      console.error("Error setting user role:", err)
      setError("Failed to set role. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            Choose Your Role
          </CardTitle>
          <p className="text-lg text-gray-600">
            Welcome, {user.displayName || user.email}! Please select your role to continue.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`p-6 text-center cursor-pointer transition-all hover:shadow-md ${
                selectedRole === "teacher" ? "ring-2 ring-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => setSelectedRole("teacher")}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Teacher</h3>
                  <p className="text-gray-600">
                    Create and manage quizzes, track student performance, and generate reports.
                  </p>
                </div>
              </div>
            </Card>

            <Card 
              className={`p-6 text-center cursor-pointer transition-all hover:shadow-md ${
                selectedRole === "student" ? "ring-2 ring-green-500 bg-green-50" : ""
              }`}
              onClick={() => setSelectedRole("student")}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Student</h3>
                  <p className="text-gray-600">
                    Join quizzes, compete with peers, and track your performance.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleRoleSelection} 
              disabled={!selectedRole || isLoading}
              className="w-full max-w-xs"
            >
              {isLoading ? "Setting up..." : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 