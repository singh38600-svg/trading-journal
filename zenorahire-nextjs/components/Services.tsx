"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const services = [
  {
    icon: "🎯",
    title: "Executive Search",
    desc: "We identify and place C-suite and senior leadership talent that drives company transformation and growth.",
    tags: ["CEO", "CTO", "CFO", "VP-Level"],
    color: "from-indigo-500/20 to-purple-500/10",
    border: "hover:border-indigo-500/40",
  },
  {
    icon: "💻",
    title: "IT & Tech Recruitment",
    desc: "From engineers to architects, we source the top 1% of tech talent that builds world-class products.",
    tags: ["Engineering", "DevOps", "Data Science", "Cloud"],
    color: "from-cyan-500/20 to-blue-500/10",
    border: "hover:border-cyan-500/40",
  },
  {
    icon: "🚀",
    title: "Startup Hiring",
    desc: "Fast-track hiring solutions for high-growth startups that need talent now — without compromising quality.",
    tags: ["Series A-C", "Founders", "GTM", "Product"],
    color: "from-amber-500/20 to-orange-500/10",
    border: "hover:border-amber-500/40",
  },
  {
    icon: "🌐",
    title: "Global Placements",
    desc: "Cross-border hiring, visa support, and relocation — we place talent anywhere in the world.",
    tags: ["US", "UK", "UAE", "Singapore"],
    color: "from-emerald-500/20 to-teal-500/10",
    border: "hover:border-emerald-500/40",
  },
  {
    icon: "🏦",
    title: "BFSI Recruitment",
    desc: "Specialist hiring for Banking, Financial Services and Insurance with deep domain expertise.",
    tags: ["Banking", "Fintech", "Insurance", "Wealth"],
    color: "from-pink-500/20 to-rose-500/10",
    border: "hover:border-pink-500/40",
  },
  {
    icon: "⚡",
    title: "RPO Solutions",
    desc: "End-to-end Recruitment Process Outsourcing for companies scaling from 10 to 1,000 employees.",
    tags: ["Bulk Hiring", "Employer Brand", "ATS Setup"],
    color: "from-violet-500/20 to-fuchsia-500/10",
    border: "hover:border-violet-500/40",
  },
];

function ServiceCard({ s, i }: { s: typeof services[0]; i: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className={`group relative rounded-2xl p-6 glass border border-white/6 ${s.border} transition-all duration-300 cursor-default overflow-hidden shimmer-line`}
    >
      {/* bg gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

      {/* top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <span className="text-3xl mb-4 block">{s.icon}</span>
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-200 transition-colors">{s.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-4">{s.desc}</p>
        <div className="flex flex-wrap gap-1.5">
          {s.tags.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full text-xs text-slate-500 bg-white/5 border border-white/8">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          Learn more
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

export default function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="services" className="py-28 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-medium">What We Do</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Recruitment that <span className="grad">actually works</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Specialised hiring solutions across industries — tailored for speed, quality, and long-term fit.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => <ServiceCard key={s.title} s={s} i={i} />)}
        </div>
      </div>
    </section>
  );
}
