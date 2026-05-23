'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '@/components/motion/PageTransition'

const categories = [
  {
    href: '/dates',
    label: 'Dates',
    description: 'Restaurants · Rooftops · Bars',
    gradient: 'linear-gradient(160deg, #2C1810 0%, #8B5A4A 60%, #C9A99A 100%)',
  },
  {
    href: '/nightlife',
    label: 'Nightlife',
    description: 'Clubs · Bars · Late nights',
    gradient: 'linear-gradient(160deg, #0D0D14 0%, #2A1A3A 60%, #6B4A8A 100%)',
  },
  {
    href: '/day',
    label: 'Day Out',
    description: 'Parks · Cafes · Markets',
    gradient: 'linear-gradient(160deg, #1A2410 0%, #4A6B3A 60%, #A8C99A 100%)',
  },
  {
    href: '/meet',
    label: 'Meet',
    description: 'Malls · Areas · Social spots',
    gradient: 'linear-gradient(160deg, #1A1A14 0%, #4A4A3A 60%, #C8C0A8 100%)',
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

export default function HomePage() {
  const [active, setActive] = useState(0)

  return (
    <PageTransition>
      <section className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
          className="font-serif text-[clamp(60px,10vw,96px)] font-light leading-none tracking-tight text-foreground"
        >
          Bangkok
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-3 text-[10px] tracking-[0.22em] uppercase font-sans text-muted"
        >
          Your city, curated
        </motion.p>
        <motion.div
          style={{ originX: 0 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' as const }}
          className="border-t border-foreground mt-5 mb-8"
        />

        {/* Split: list + image */}
        <div className="grid grid-cols-[1fr_1.5fr] gap-0 min-h-[320px]">
          {/* List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="border-r border-border pr-10 flex flex-col justify-center"
          >
            {categories.map((cat, i) => (
              <motion.div
                key={cat.href}
                variants={itemVariants}
                animate={{ opacity: active !== i ? 0.3 : 1 }}
                transition={{ opacity: { duration: 0.2 } }}
                className="flex items-center justify-between py-5 border-b border-border first:border-t first:border-border cursor-pointer"
                onHoverStart={() => setActive(i)}
                onTap={() => setActive(i)}
              >
                <div>
                  <Link
                    href={cat.href}
                    className={`font-serif text-2xl font-light text-foreground hover:no-underline ${
                      active === i ? 'border-b border-accent pb-px' : ''
                    }`}
                  >
                    {cat.label}
                  </Link>
                  <p className="text-[10px] tracking-[0.12em] uppercase font-sans text-muted mt-1">
                    {cat.description}
                  </p>
                </div>
                <motion.span
                  aria-hidden="true"
                  animate={{
                    x: active === i ? 4 : 0,
                    color: active === i ? '#C9A99A' : '#D8D0C8',
                  }}
                  transition={{ duration: 0.15 }}
                  className="text-sm"
                >
                  →
                </motion.span>
              </motion.div>
            ))}
          </motion.div>

          {/* Image panel */}
          <div className="pl-10 flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' as const }}
                className="w-full aspect-[4/3] relative overflow-hidden"
                style={{ background: categories[active].gradient }}
              >
                <p className="absolute bottom-3 left-4 text-[9px] tracking-[0.18em] uppercase font-sans text-background/80">
                  {categories[active].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
