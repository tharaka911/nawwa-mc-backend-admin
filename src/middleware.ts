import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { method, nextUrl } = request
  const { pathname, search } = nextUrl

  // Log the request to terminal
  console.log(`[REQUEST] ${new Date().toISOString()} ${method} ${pathname}${search}`)

  return NextResponse.next()
}

// Optional: Configure which paths should be logged
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
