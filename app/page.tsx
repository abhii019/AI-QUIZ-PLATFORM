"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Users, Trophy, Sparkles } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Check user role and redirect to appropriate dashboard
      checkUserRoleAndRedirect()
    }
  }, [user, loading])

  const checkUserRoleAndRedirect = async () => {
    if (!user) return

    try {
      // Check if user exists in teachers collection
      const { getDoc, doc } = await import("firebase/firestore")
      const { db } = await import("@/firebase/config")

      const teacherDoc = await getDoc(doc(db, "teachers", user.uid))
      if (teacherDoc.exists()) {
        router.push("/dashboard/teacher")
        return
      }

      // Check if user exists in students collection
      const studentDoc = await getDoc(doc(db, "students", user.uid))
      if (studentDoc.exists()) {
        router.push("/dashboard/student")
        return
      }

      // If user exists but no role assigned, redirect to role selection
      router.push("/select-role")
    } catch (error) {
      console.error("Error checking user role:", error)
      router.push("/sign-in")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-emerald-200 border-t-emerald-500 mx-auto"></div>
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-teal-200 border-t-teal-500 mx-auto absolute top-4 left-4 animate-reverse"></div>
            <div className="animate-pulse absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Sparkles className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700 animate-pulse">Loading your quiz experience...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in-up relative z-10">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-full">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4 animate-fade-in">
            Quiz Platform
          </CardTitle>
          <p className="text-xl text-gray-600 animate-fade-in animation-delay-300">
            Create, take, and manage quizzes with ease
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="group p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:border-emerald-300 animate-fade-in-left">
              <div className="flex justify-center mb-4">
                <div className="bg-emerald-100 p-3 rounded-full group-hover:bg-emerald-200 transition-colors duration-300">
                  <Users className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-emerald-800">For Teachers</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Create engaging quizzes and track student performance with powerful analytics
              </p>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 transform transition-all duration-200 hover:scale-105"
              >
                <Link href="/sign-up?role=teacher">Get Started as Teacher</Link>
              </Button>
            </Card>

            <Card className="group p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 hover:border-teal-300 animate-fade-in-right">
              <div className="flex justify-center mb-4">
                <div className="bg-teal-100 p-3 rounded-full group-hover:bg-teal-200 transition-colors duration-300">
                  <Trophy className="h-8 w-8 text-teal-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-teal-800">For Students</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Join exciting quizzes and compete with your peers in a fun learning environment
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full border-2 border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white font-semibold py-3 transform transition-all duration-200 hover:scale-105 bg-transparent"
              >
                <Link href="/sign-up?role=student">Join as Student</Link>
              </Button>
            </Card>
          </div>

          <div className="text-center animate-fade-in animation-delay-600">
            <p className="text-gray-600 mb-6 text-lg">Already have an account?</p>
            <Button
              asChild
              variant="ghost"
              className="text-lg px-8 py-3 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
