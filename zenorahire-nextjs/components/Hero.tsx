'use client'

import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

/* ── helpers ── */
const sentence = {
  hidden:  { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.6 } },
}
const letter = {
  hidden:  { opacity: 0, y: 60,  rotateX: -90 },
  visible: { opacity: 1, y: 0,   rotateX: 0,
    transition: { type: 'spring', stiffness: 100, damping: 16 } },
}

const words1 = 'We Place'.split('')
const words2 = 'Exceptional'.split('')
const words3 = 'Talent.'.split('')

const badges = ['500+ Placements', '98% Satisfaction', '10+ Years', '200+ Clients']

/* ── Floating orb ── */
function Orb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[120px] opacity-30 pointer-events-none ${className}`}
      animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.4, 0.25] }}
      transition={{ duration: 8, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  )
}

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yText  = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const yOrbs  = useTransform(scrollYProgress, [0, 1], ['0%', '60%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const springY = useSpring(yText, { stiffness: 60, damping: 20 })

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden noise"
      id="hero"
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Radial fade center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(99,102,241,0.12),transparent)]" />

      {/* Orbs – parallax */}
      <motion.div style={{ y: yOrbs }} className="absolute inset-0 pointer-events-none">
        <Orb className="w-[600px] h-[600px] bg-indigo-600 -top-40 -left-40" delay={0} />
        <Orb className="w-[500px] h-[500px] bg-violet-600 -bottom-20 -right-32" delay={3} />
        <Orb className="w-[300px] h-[300px] bg-blue-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" delay={1.5} />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: springY, opacity }}
        className="relative z-10 max-w-6xl mx-auto px-6 text-center"
      >
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass glow-border mb-10 text-sm text-slate-300"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Now placing talent in 50+ countries
          <span className="text-slate-500">→</span>
        </motion.div>

        {/* Headline – character reveal */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-8 perspective-[800px]">
          <motion.span
            variants={sentence}
            initial="hidden"
            animate="visible"
            className="block text-white"
            aria-label="We Place"
          >
            {words1.map((char, i) => (
              <motion.span key={i} variants={letter} className="inline-block">
                {char === ' ' ? ' ' : char}
              </motion.span>
            ))}
          </motion.span>

          <motion.span
            variants={sentence}
            initial="hidden"
            animate="visible"
            className="block gradient-text"
            aria-label="Exceptional"
          >
            {words2.map((char, i) => (
              <motion.span key={i} variants={letter} className="inline-block">
                {char}
              </motion.span>
            ))}
          </motion.span>

          <motion.span
            variants={sentence}
            initial="hidden"
            animate="visible"
            className="block text-white"
            aria-label="Talent."
          >
            {words3.map((char, i) => (
              <motion.span key={i} variants={letter} className="inline-block">
                {char}
              </motion.span>
            ))}
          </motion.span>
        </h1>

        {/* Sub-heading */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 text-balance"
        >
          Zenora Hire connects visionary companies with world-class professionals.
          Executive search, IT recruitment, and HR consulting — done right.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
        >
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}
            whileTap={{ scale: 0.97 }}
            className="relative px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-base overflow-hidden group"
          >
            <span className="relative z-10">Hire Top Talent →</span>
            <motion.span
              className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"
            />
          </motion.a>

          <motion.a
            href="#services"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-4 rounded-full glass glow-border text-white font-semibold text-base hover:bg-white/10 transition-colors"
          >
            See Our Services
          </motion.a>
        </motion.div>

        {/* Floating stat badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {badges.map((b, i) => (
            <motion.span
              key={b}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2 + i * 0.1, type: 'spring', stiffness: 200 }}
              className="px-4 py-1.5 rounded-full glass text-sm text-slate-300 border border-white/10"
            >
              {b}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-xs"
      >
        <span>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-indigo-500 to-transparent"
        />
      </motion.div>
    </section>
  )
}
