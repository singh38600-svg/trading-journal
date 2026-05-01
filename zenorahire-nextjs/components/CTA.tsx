'use client'

import { motion } from 'framer-motion'

export default function CTA() {
  return (
    <section id="contact" className="py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#05050f] to-violet-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(99,102,241,0.15),transparent)]" />

      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Floating orbs */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute w-96 h-96 rounded-full bg-indigo-600 blur-[150px] opacity-20 -top-20 -left-20 pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, delay: 3 }}
        className="absolute w-80 h-80 rounded-full bg-violet-600 blur-[150px] opacity-20 -bottom-20 -right-20 pointer-events-none"
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 mb-8 uppercase tracking-widest">
            Let's Work Together
          </span>

          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 text-balance leading-tight">
            Ready to hire{' '}
            <span className="gradient-text">exceptional</span>
            {' '}talent?
          </h2>

          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
            Book a free discovery call today. We'll understand your needs and tell you exactly how we can help — no fluff, no hard sell.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.a
              href="mailto:hello@zenorahire.com"
              whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(99,102,241,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="group relative px-10 py-5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg overflow-hidden"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              <span className="relative z-10 flex items-center gap-2">
                Book a Free Call
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </motion.a>

            <motion.a
              href="mailto:hello@zenorahire.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-5 rounded-full glass glow-border text-white font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Send a Brief
            </motion.a>
          </div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-16 flex flex-wrap justify-center gap-8 text-slate-500 text-sm"
          >
            {['No upfront fees', 'Response within 24h', '90-day guarantee', 'Global coverage'].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
