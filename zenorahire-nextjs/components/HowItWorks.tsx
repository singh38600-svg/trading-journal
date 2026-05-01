'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const steps = [
  {
    num: '01',
    title: 'Discovery Call',
    desc: 'We learn your business, culture, and exact requirements. No generic briefs — just deep, tailored understanding.',
    icon: '📞',
  },
  {
    num: '02',
    title: 'Targeted Search',
    desc: 'Our headhunters tap active and passive talent pools globally. AI-assisted screening meets human judgement.',
    icon: '🔍',
  },
  {
    num: '03',
    title: 'Curated Shortlist',
    desc: 'You receive 3-5 thoroughly vetted candidates with detailed profiles within 2 weeks — not 2 months.',
    icon: '✅',
  },
  {
    num: '04',
    title: 'Seamless Placement',
    desc: 'We manage interviews, offer negotiation, and onboarding support. Your hire lands ready to deliver from day one.',
    icon: '🚀',
  },
]

export default function HowItWorks() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="how" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_50%,rgba(167,139,250,0.07),transparent)]" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-24"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 mb-6 uppercase tracking-widest">
            Our Process
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            How it{' '}
            <span className="gradient-text">works</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            A proven 4-step process that delivers exceptional hires in record time.
          </p>
        </motion.div>

        <div ref={ref} className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'left' }}
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 opacity-30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15 + 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative group text-center"
              >
                {/* Step circle */}
                <div className="relative inline-flex mb-8">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/60 transition-shadow duration-500"
                  >
                    {step.icon}
                  </motion.div>
                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping opacity-0 group-hover:opacity-100" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 border-2 border-indigo-500 text-xs text-indigo-300 font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
