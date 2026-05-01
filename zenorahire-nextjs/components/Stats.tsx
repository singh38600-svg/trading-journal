'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { value: 500,  suffix: '+', label: 'Placements Made',      sub: 'Across 50+ countries'      },
  { value: 98,   suffix: '%', label: 'Client Satisfaction',  sub: 'Verified by surveys'        },
  { value: 10,   suffix: '+', label: 'Years of Excellence',  sub: 'In the industry'            },
  { value: 200,  suffix: '+', label: 'Companies Served',     sub: 'From startups to Fortune 500'},
]

function Counter({ value, suffix, active }: { value: number; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return
    const duration = 2000
    const start = Date.now()
    const tick = () => {
      const elapsed  = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, value])

  return (
    <span className="tabular-nums">
      {count}{suffix}
    </span>
  )
}

export default function Stats() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="stats" className="py-32 px-6 relative">
      {/* Subtle divider glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-violet-300 border border-violet-500/30 bg-violet-500/10 mb-6 uppercase tracking-widest">
            By The Numbers
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white">
            Results that{' '}
            <span className="gradient-text">speak</span>
          </h2>
        </motion.div>

        <div
          ref={ref}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.04 }}
              className="relative rounded-2xl p-8 glass border border-white/5 text-center overflow-hidden group"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="text-5xl md:text-6xl font-black gradient-text mb-3">
                  <Counter value={s.value} suffix={s.suffix} active={inView} />
                </div>
                <div className="text-white font-semibold mb-1">{s.label}</div>
                <div className="text-slate-500 text-xs">{s.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
