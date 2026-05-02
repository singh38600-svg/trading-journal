"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const bento = [
  {
    title: "Executive Search",
    desc: "C-suite and VP-level placement. We headhunt the top 1% that transforms companies.",
    icon: "🎯",
    span: "lg:col-span-2 lg:row-span-2",
    gradient: "from-indigo-500/15 via-purple-500/8 to-transparent",
    border: "hover:border-indigo-500/50",
    big: true,
    tags: ["CEO", "CTO", "CFO", "COO", "VP-Level"],
    stat: "94%",
    statLabel: "offer acceptance rate",
  },
  {
    title: "IT & Tech",
    desc: "Engineers, architects, and data scientists for world-class products.",
    icon: "💻",
    span: "lg:col-span-1",
    gradient: "from-cyan-500/12 to-transparent",
    border: "hover:border-cyan-500/40",
    big: false,
    tags: ["Engineering", "Cloud", "DevOps"],
    stat: "7 days",
    statLabel: "avg. time to shortlist",
  },
  {
    title: "Global Placements",
    desc: "Cross-border hiring across US, UK, UAE, Singapore and beyond.",
    icon: "🌐",
    span: "lg:col-span-1",
    gradient: "from-emerald-500/12 to-transparent",
    border: "hover:border-emerald-500/40",
    big: false,
    tags: ["US", "UK", "UAE", "SG"],
    stat: "20+",
    statLabel: "countries covered",
  },
  {
    title: "Startup Hiring",
    desc: "Fast-track hiring for high-growth startups — Series A to pre-IPO.",
    icon: "🚀",
    span: "lg:col-span-1",
    gradient: "from-amber-500/12 to-transparent",
    border: "hover:border-amber-500/40",
    big: false,
    tags: ["Founders", "GTM", "Product"],
    stat: "48hrs",
    statLabel: "first candidate presented",
  },
  {
    title: "BFSI & Fintech",
    desc: "Deep domain expertise across banking, insurance, and fintech sectors.",
    icon: "🏦",
    span: "lg:col-span-1",
    gradient: "from-pink-500/12 to-transparent",
    border: "hover:border-pink-500/40",
    big: false,
    tags: ["Banking", "Fintech", "Wealth"],
    stat: "₹0",
    statLabel: "unless you hire",
  },
  {
    title: "RPO Solutions",
    desc: "End-to-end recruitment outsourcing for companies scaling fast.",
    icon: "⚡",
    span: "lg:col-span-2",
    gradient: "from-violet-500/12 to-transparent",
    border: "hover:border-violet-500/40",
    big: false,
    tags: ["Bulk Hiring", "Employer Brand", "ATS Setup", "Onboarding"],
    stat: "500+",
    statLabel: "placements this year",
  },
];

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
          <span className="text-xs uppercase tracking-[0.25em] text-indigo-400 font-medium">What We Do</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Recruitment that <span className="grad">actually works</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Specialised hiring across industries — tailored for speed, quality, and long-term fit.
          </p>
        </motion.div>

        {/* bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">
          {bento.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className={`group relative rounded-2xl glass border border-white/6 ${item.border} ${item.span} transition-all duration-300 overflow-hidden cursor-default`}
            >
              {/* bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className={`relative z-10 p-6 flex flex-col h-full ${item.big ? "min-h-[280px]" : "min-h-[160px]"}`}>
                {/* top row */}
                <div className="flex items-start justify-between mb-4">
                  <span className={`${item.big ? "text-4xl" : "text-2xl"}`}>{item.icon}</span>
                  {item.stat && (
                    <div className="text-right">
                      <div className="text-2xl font-bold grad" style={{ fontFamily: "'Playfair Display', serif" }}>{item.stat}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{item.statLabel}</div>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className={`font-bold text-white mb-2 ${item.big ? "text-2xl" : "text-base"}`}>{item.title}</h3>
                  <p className={`text-slate-400 leading-relaxed ${item.big ? "text-base" : "text-sm"}`}>{item.desc}</p>
                </div>

                {/* tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {item.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-500 bg-white/5 border border-white/8">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
