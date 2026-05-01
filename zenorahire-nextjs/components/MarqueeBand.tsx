'use client'

import { motion } from 'framer-motion'

const items = [
  'Executive Search', 'IT Recruitment', 'HR Consulting', 'Talent Acquisition',
  'C-Suite Hiring', 'Remote Placements', 'Diversity Hiring', 'Contract Staffing',
]

function Track() {
  return (
    <div className="flex items-center gap-0 shrink-0">
      {items.map((item) => (
        <span key={item} className="flex items-center gap-6 px-6 text-sm font-semibold text-white/80 uppercase tracking-widest whitespace-nowrap">
          {item}
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
        </span>
      ))}
    </div>
  )
}

export default function MarqueeBand() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950 via-violet-950 to-indigo-950 border-y border-white/5 py-4">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-indigo-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-indigo-950 to-transparent z-10 pointer-events-none" />

      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="flex w-max hover:[animation-play-state:paused]"
      >
        <Track />
        <Track />
      </motion.div>
    </div>
  )
}
