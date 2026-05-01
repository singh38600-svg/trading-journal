'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

const testimonials = [
  {
    name:    'Priya Sharma',
    role:    'CTO, FinScale Technologies',
    avatar:  'PS',
    color:   'from-indigo-500 to-violet-500',
    quote:   'Zenora Hire found us a VP of Engineering in 18 days. Other firms had been trying for 6 months. The quality of candidates was extraordinary — they genuinely understood our technical culture.',
    stars:   5,
  },
  {
    name:    'Marcus Reid',
    role:    'CEO, Apex Ventures',
    avatar:  'MR',
    color:   'from-violet-500 to-purple-600',
    quote:   'We\'ve hired 12 executives through Zenora Hire over 3 years. Not a single mis-hire. Their process is rigorous, their network is unmatched, and they feel like a true partner.',
    stars:   5,
  },
  {
    name:    'Sarah Chen',
    role:    'Head of People, NovaTech',
    avatar:  'SC',
    color:   'from-blue-500 to-indigo-500',
    quote:   'The diversity-focused search process was refreshing. They didn\'t just tick boxes — they found us outstanding candidates we would never have found ourselves.',
    stars:   5,
  },
  {
    name:    'James Okafor',
    role:    'MD, GlobalOps Ltd',
    avatar:  'JO',
    color:   'from-emerald-500 to-teal-500',
    quote:   'From first call to signed offer in 3 weeks. Zenora\'s responsiveness and candidate quality exceeded every expectation. Our go-to partner for senior hires.',
    stars:   5,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1 mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
          className="text-amber-400 text-sm"
        >
          ★
        </motion.span>
      ))}
    </div>
  )
}

export default function Testimonials() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [active, setActive] = useState(0)

  return (
    <section id="testimonials" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_50%,rgba(99,102,241,0.07),transparent)]" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-amber-300 border border-amber-500/30 bg-amber-500/10 mb-6 uppercase tracking-widest">
            Client Stories
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Trusted by{' '}
            <span className="gradient-text">leaders</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Don't take our word for it. Here's what our clients say.
          </p>
        </motion.div>

        {/* Featured testimonial */}
        <div ref={ref} className="mb-8">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-4xl mx-auto rounded-3xl glass border border-white/10 p-10 md:p-16 overflow-hidden"
          >
            {/* Quote mark */}
            <div className="absolute top-8 right-10 text-8xl font-black text-indigo-500/10 leading-none select-none">
              "
            </div>

            <div className="relative z-10">
              <Stars count={testimonials[active].stars} />
              <p className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-10 text-balance">
                "{testimonials[active].quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonials[active].color} flex items-center justify-center text-white font-bold text-sm`}>
                  {testimonials[active].avatar}
                </div>
                <div>
                  <div className="text-white font-semibold">{testimonials[active].name}</div>
                  <div className="text-slate-400 text-sm">{testimonials[active].role}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Selector tabs */}
        <div className="flex justify-center gap-3 flex-wrap">
          {testimonials.map((t, i) => (
            <motion.button
              key={t.name}
              onClick={() => setActive(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border text-sm font-medium transition-all duration-300 ${
                active === i
                  ? 'glass border-indigo-500/50 text-white bg-indigo-500/10'
                  : 'border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-xs`}>
                {t.avatar}
              </div>
              <span className="hidden sm:inline">{t.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
