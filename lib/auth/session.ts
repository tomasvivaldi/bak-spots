import { cookies } from 'next/headers'

export function isAuthenticated(): boolean {
  const secret = process.env.SESSION_SECRET
  if (!secret) return false
  const session = cookies().get('bkk_admin_session')
  return session?.value === secret
}
