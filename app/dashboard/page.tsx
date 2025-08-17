"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // ⬅️ Don't do anything while loading

    if (user) {
      checkUserRoleAndRedirect()
    } else {
      // If there's no user after loading is complete
      router.push("/sign-in")
    }
  }, [user, loading])

  const checkUserRoleAndRedirect = async () => {
    if (!user) return

    try {
      const { getDoc, doc } = await import("firebase/firestore")
      const { db } = await import("@/firebase/config")

      const teacherDoc = await getDoc(doc(db, "teachers", user.uid))
      if (teacherDoc.exists()) {
        router.push("/dashboard/teacher")
        return
      }

      const studentDoc = await getDoc(doc(db, "students", user.uid))
      if (studentDoc.exists()) {
        router.push("/dashboard/student")
        return
      }

      router.push("/select-role")
    } catch (error) {
      console.error("Error checking user role:", error)
      router.push("/sign-in")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-gray-800">Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="relative mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-200 border-t-teal-600 mx-auto absolute top-2 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <p className="mt-4 text-gray-700">Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-gray-800">Redirecting...</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-200 border-t-teal-600 mx-auto absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="mt-4 text-gray-700">Please wait while we redirect you to your dashboard.</p>
        </CardContent>
      </Card>
    </div>
  )
}
