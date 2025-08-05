"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
      const { getDoc, doc } = await import('firebase/firestore')
      const { db } = await import('@/firebase/config')
      
      const teacherDoc = await getDoc(doc(db, 'teachers', user.uid))
      if (teacherDoc.exists()) {
        router.push('/dashboard/teacher')
        return
      }

      // Check if user exists in students collection
      const studentDoc = await getDoc(doc(db, 'students', user.uid))
      if (studentDoc.exists()) {
        router.push('/dashboard/student')
        return
      }

      // If user exists but no role assigned, redirect to role selection
      router.push('/select-role')
    } catch (error) {
      console.error('Error checking user role:', error)
      router.push('/sign-in')
    }
  }

  if (loading) {
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
          <CardTitle className="text-4xl font-bold text-gray-800 mb-2">
            Welcome to Quiz Platform
          </CardTitle>
          <p className="text-lg text-gray-600">
            Create, take, and manage quizzes with ease
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 text-center hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-2">For Teachers</h3>
              <p className="text-gray-600 mb-4">Create engaging quizzes and track student performance</p>
              <Button asChild className="w-full">
                <Link href="/sign-up">Get Started as Teacher</Link>
              </Button>
            </Card>
            <Card className="p-6 text-center hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-2">For Students</h3>
              <p className="text-gray-600 mb-4">Join quizzes and compete with your peers</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/sign-up">Join as Student</Link>
              </Button>
            </Card>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">Already have an account?</p>
            <Button asChild variant="ghost">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
