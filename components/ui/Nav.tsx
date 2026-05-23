import Link from 'next/link'

const links = [
  { href: '/dates', label: 'Dates' },
  { href: '/nightlife', label: 'Nightlife' },
  { href: '/day', label: 'Day' },
  { href: '/meet', label: 'Meet' },
]

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-foreground">
      <div className="max-w-5xl mx-auto px-6 h-[52px] flex items-center justify-between">
        <Link
          href="/"
          className="text-[11px] tracking-[0.22em] uppercase font-medium font-sans text-foreground"
        >
          BKK
        </Link>
        <div className="flex items-center gap-9">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[10px] tracking-[0.18em] uppercase font-sans text-muted hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
