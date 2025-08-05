"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      checkUserRoleAndRedirect()
    }
  }, [user, loading])

  const checkUserRoleAndRedirect = async () => {
    if (!user) return

    try {
      const { getDoc, doc } = await import('firebase/firestore')
      const { db } = await import('@/firebase/config')
      
      const teacherDoc = await getDoc(doc(db, 'teachers', user.uid))
      if (teacherDoc.exists()) {
        router.push('/dashboard/teacher')
        return
      }

      const studentDoc = await getDoc(doc(db, 'students', user.uid))
      if (studentDoc.exists()) {
        router.push('/dashboard/student')
        return
      }

      router.push('/select-role')
    } catch (error) {
      console.error('Error checking user role:', error)
      router.push('/sign-in')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4">Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Redirecting...</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Please wait while we redirect you to your dashboard.</p>
        </CardContent>
      </Card>
    </div>
  )
} 