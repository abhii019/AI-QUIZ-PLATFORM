import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/sign-in', '/sign-up', '/forgot-password', '/unauthorized']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Check if user is authenticated (you'll need to implement this based on your auth strategy)
  const isAuthenticated = request.cookies.has('auth-token') // Replace with your actual auth check
  
  // If not authenticated and trying to access protected route, redirect to sign-in
  if (!isAuthenticated && !isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  
  // If authenticated and trying to access auth pages, redirect to appropriate dashboard
  if (isAuthenticated && isPublicRoute) {
    // You'll need to determine the user's role here
    // For now, redirect to a role selection page or default dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
