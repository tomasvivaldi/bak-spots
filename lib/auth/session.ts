import { cookies } from 'next/headers'

export function isAuthenticated(): boolean {
  const session = cookies().get('bkk_admin_session')
  return session?.value === process.env.SESSION_SECRET
}
