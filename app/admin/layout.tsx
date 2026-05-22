import Link from 'next/link'
import { logout } from '@/actions/auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-semibold text-foreground">BKK Admin</Link>
          <Link href="/admin/spots" className="text-sm text-muted hover:text-foreground">Spots</Link>
          <Link href="/admin/import" className="text-sm text-muted hover:text-foreground">Import</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-muted hover:text-foreground">View site</Link>
          <form action={logout}>
            <button type="submit" className="text-xs text-muted hover:text-foreground">Logout</button>
          </form>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
