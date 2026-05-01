'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const services = [
  {
    icon: '🎯',
    title: 'Executive Search',
    desc: 'We identify and attract C-suite and senior leadership talent who transform organisations and drive extraordinary results.',
    tags: ['CEO', 'CTO', 'CFO', 'VP'],
    color: 'from-indigo-500/20 to-violet-500/10',
    glow: 'group-hover:shadow-indigo-500/20',
  },
  {
    icon: '💻',
    title: 'IT & Tech Recruitment',
    desc: 'From software engineers to data scientists, we connect you with elite tech professionals who build the future.',
    tags: ['Fullstack', 'DevOps', 'AI/ML', 'Cloud'],
    color: 'from-violet-500/20 to-purple-500/10',
    glow: 'group-hover:shadow-violet-500/20',
  },
  {
    icon: '🌍',
    title: 'Global Talent',
    desc: 'Access a borderless talent pool. We manage international placements, relocation, and cross-border compliance.',
    tags: ['Remote', 'Relocation', '50+ Countries'],
    color: 'from-blue-500/20 to-indigo-500/10',
    glow: 'group-hover:shadow-blue-500/20',
  },
  {
    icon: '⚡',
    title: 'Contract Staffing',
    desc: 'Scale your team rapidly with pre-vetted contract professionals. From 1-month sprints to multi-year engagements.',
    tags: ['Flexible', 'Fast', 'Vetted'],
    color: 'from-amber-500/20 to-orange-500/10',
    glow: 'group-hover:shadow-amber-500/20',
  },
  {
    icon: '🤝',
    title: 'HR Consulting',
    desc: 'Build talent strategies, compensation frameworks, and employer brands that attract the best people on the market.',
    tags: ['Strategy', 'Culture', 'EVP'],
    color: 'from-emerald-500/20 to-teal-500/10',
    glow: 'group-hover:shadow-emerald-500/20',
  },
  {
    icon: '🔍',
    title: 'Diversity & Inclusion',
    desc: 'We actively source and champion diverse candidates, helping you build teams that reflect the world you serve.',
    tags: ['D&I', 'Inclusive', 'Equitable'],
    color: 'from-pink-500/20 to-rose-500/10',
    glow: 'group-hover:shadow-pink-500/20',
  },
]

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
}
const cardVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Services() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="services" className="py-32 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.08),transparent)]" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 mb-6 uppercase tracking-widest">
            What We Do
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Services built for{' '}
            <span className="gradient-text">ambition</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Whether you're scaling a startup or transforming an enterprise, we have the expertise and network to deliver.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((s) => (
            <motion.div
              key={s.title}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`group relative rounded-2xl p-8 glass border border-white/5 cursor-default overflow-hidden hover:shadow-2xl ${s.glow} transition-shadow duration-500`}
            >
              {/* Card background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Shine line on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -inset-x-full top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              </div>

              <div className="relative z-10">
                <div className="text-4xl mb-5">{s.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                  {s.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 group-hover:text-slate-300 transition-colors">
                  {s.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 group-hover:border-white/20 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
