"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    n: "01",
    title: "Discovery Call",
    desc: "We understand your company culture, team needs, and the exact profile you're looking for.",
    icon: "🔍",
  },
  {
    n: "02",
    title: "Talent Mapping",
    desc: "Our team activates its network and headhunts the top candidates — active and passive.",
    icon: "🗺️",
  },
  {
    n: "03",
    title: "Deep Vetting",
    desc: "Multi-round screening: skills assessment, cultural fit, reference checks, and background verification.",
    icon: "✅",
  },
  {
    n: "04",
    title: "Shortlist & Present",
    desc: "You receive a curated shortlist of 3–5 exceptional candidates within 5–7 business days.",
    icon: "📋",
  },
  {
    n: "05",
    title: "Interview Support",
    desc: "We coordinate interviews, provide coaching, and act as your negotiation partner.",
    icon: "🤝",
  },
  {
    n: "06",
    title: "Hire & Onboard",
    desc: "Offer management, onboarding support, and a 90-day replacement guarantee.",
    icon: "🎉",
  },
];

export default function Process() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="process" className="py-28 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-medium">How It Works</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            From brief to <span className="grad">brilliant hire</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            A proven 6-step process refined over a decade of executive and specialist recruitment.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="relative group"
            >
              <div className="h-full rounded-2xl glass border border-white/6 hover:border-indigo-500/30 p-6 transition-all duration-300">
                {/* number */}
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{step.icon}</span>
                  <span className="text-5xl font-bold text-white/5 group-hover:text-indigo-500/20 transition-colors duration-300 font-mono">
                    {step.n}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>

                {/* connector line (not last in row) */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
