"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Share Your Role Requirements",
    description: "Fill in a 5-minute brief: stack, seniority, CTC range, team context. The more detail you give, the sharper our targeting.",
    detail: "5-Minute Setup",
  },
  {
    number: "02",
    title: "AI Sources 100+ Candidates Overnight",
    description: "Our AI engine runs Boolean and semantic searches across LinkedIn, GitHub, and niche communities — delivering a ranked longlist by morning.",
    detail: "Overnight Sourcing",
  },
  {
    number: "03",
    title: "Human Screening Narrows to Top 5",
    description: "Our tech recruiters screen on communication, motivation, and depth. You receive 5 curated profiles with notes, not 50 raw CVs.",
    detail: "Curated Shortlist",
  },
  {
    number: "04",
    title: "You Interview and Hire in 14 Days",
    description: "Run your interviews, make your offer. We coordinate, negotiate, and ensure smooth onboarding. You're backed by a 90-day replacement guarantee.",
    detail: "14-Day Closure",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 relative overflow-hidden" style={{ background: "#080E1C" }}>
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[rgba(201,168,76,0.15)] to-transparent hidden lg:block" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full glass-light"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A84C]">The Process</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Stop Waiting 90 Days.
              <br />
              <span className="gradient-text">Hire in 14.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#9CA3AF] text-lg leading-relaxed"
          >
            Traditional recruiters send you 50 CVs and disappear. We send you 5 screened candidates
            and close your role. Our four-step process is fast, transparent, and built around your team's time.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" }}
              className="relative"
            >
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px z-0"
                  style={{ background: "linear-gradient(90deg, rgba(201,168,76,0.3), transparent)" }}
                />
              )}
              <div className="relative glass-light rounded-2xl p-6 gradient-border h-full flex flex-col group hover:border-[rgba(201,168,76,0.3)] transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="text-5xl font-black gradient-text leading-none"
                    style={{ fontFamily: "var(--font-playfair)", opacity: 0.4 }}
                  >
                    {step.number}
                  </span>
                  <div className="w-8 h-8 rounded-full border border-[rgba(201,168,76,0.3)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
                  {step.title}
                </h3>
                <p className="text-[#6B7280] text-sm leading-relaxed flex-1 group-hover:text-[#9CA3AF] transition-colors">
                  {step.description}
                </p>
                <div className="mt-5 pt-4 border-t border-[rgba(201,168,76,0.08)]">
                  <span className="text-xs font-semibold text-[#C9A84C] uppercase tracking-wider">{step.detail}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
