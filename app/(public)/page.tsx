'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PageTransition from '@/components/motion/PageTransition'

const categories = [
  { href: '/dates', label: 'Dates', description: 'Restaurants, rooftops, cocktail bars', emoji: '🌙' },
  { href: '/nightlife', label: 'Nightlife', description: 'Clubs, bars, late nights', emoji: '🎶' },
  { href: '/day', label: 'Day Out', description: 'Parks, cafes, markets', emoji: '☀️' },
  { href: '/meet', label: 'Meet', description: 'Malls, areas, social spots', emoji: '👁️' },
]

const wordVariants = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' as const },
  }),
}

export default function HomePage() {
  const words = 'Bangkok'.split('')

  return (
    <PageTransition>
      <section className="max-w-6xl mx-auto px-6 py-24">
        {/* Hero */}
        <div className="mb-20">
          <div className="flex overflow-hidden">
            {words.map((char, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={wordVariants}
                initial="hidden"
                animate="show"
                className="text-8xl font-bold text-foreground tracking-tighter"
              >
                {char}
              </motion.span>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-4 text-xl text-muted"
          >
            Your personal city guide
          </motion.p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map(({ href, label, description, emoji }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.2, ease: 'easeOut' as const }}
            >
              <Link
                href={href}
                className="group block bg-surface border border-border rounded-2xl p-6 hover:border-accent transition-colors"
              >
                <span className="text-3xl block mb-3">{emoji}</span>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                  {label}
                </h2>
                <p className="text-sm text-muted mt-1">{description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </PageTransition>
  )
}
