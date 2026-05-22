import Link from 'next/link'

const links = [
  { href: '/dates', label: 'Dates' },
  { href: '/nightlife', label: 'Nightlife' },
  { href: '/day', label: 'Day' },
  { href: '/meet', label: 'Meet' },
]

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-foreground font-semibold tracking-tight">
          BKK
        </Link>
        <div className="flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
