'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const password = formData.get('password') as string

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Wrong password' }
  }

  cookies().set('bkk_admin_session', process.env.SESSION_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  redirect('/admin')
}

export async function logout() {
  cookies().delete('bkk_admin_session')
  redirect('/admin/login')
}
