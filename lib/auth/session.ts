import { cookies } from 'next/headers'

export async function isAuthenticated(): Promise<boolean> {
  const secret = process.env.SESSION_SECRET
  if (!secret) return false
  const cookieStore = await cookies()
  const session = cookieStore.get('bkk_admin_session')
  return session?.value === secret
}
