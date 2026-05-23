'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { login } from '@/actions/auth'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Checking...' : 'Enter'}
    </button>
  )
}

export default function LoginPage() {
  const [state, action] = useActionState(login, null)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Bangkok Hub</h1>
        <p className="text-muted text-sm mb-8">Admin access</p>

        <form action={action} className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoFocus
            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
          {state?.error && (
            <p className="text-red-500 text-sm">{state.error}</p>
          )}
          <SubmitButton />
        </form>
      </div>
    </div>
  )
}
