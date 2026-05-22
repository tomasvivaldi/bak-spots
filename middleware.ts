import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) return NextResponse.next()
  if (request.nextUrl.pathname === '/admin/login') return NextResponse.next()

  const secret = process.env.SESSION_SECRET
  if (!secret) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  const session = request.cookies.get('bkk_admin_session')
  if (session?.value !== secret) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
