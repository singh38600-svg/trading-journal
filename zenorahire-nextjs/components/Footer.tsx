'use client'

import { motion } from 'framer-motion'

const links = {
  Services:  ['Executive Search', 'IT Recruitment', 'Contract Staffing', 'HR Consulting', 'Global Talent', 'D&I Hiring'],
  Company:   ['About Us', 'Our Process', 'Case Studies', 'Careers', 'Blog'],
  Contact:   ['hello@zenorahire.com', 'LinkedIn', 'Twitter', 'Privacy Policy', 'Terms'],
}

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#05050f] overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-sm">
                Z
              </div>
              <span className="font-bold text-lg text-white">
                Zenora<span className="text-indigo-400">Hire</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              World-class recruitment consultancy connecting exceptional talent with visionary companies since 2014.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {['in', 'tw', 'yt'].map((s) => (
                <motion.a
                  key={s}
                  href="#"
                  whileHover={{ scale: 1.15, y: -2 }}
                  className="w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/50 transition-colors text-xs font-bold uppercase"
                >
                  {s}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">{group}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-slate-500 hover:text-white text-sm transition-colors duration-200 group flex items-center gap-1"
                    >
                      <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-300 text-indigo-400">→</span>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-600 text-xs">
          <span>© {new Date().getFullYear()} Zenora Hire. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with <span className="text-red-500 mx-1">♥</span> for world-class talent
          </span>
        </div>
      </div>
    </footer>
  )
}
