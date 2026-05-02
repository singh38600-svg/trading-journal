"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Discovery & Brief",
    description: "We conduct deep-dive stakeholder interviews to understand your culture, strategic objectives, and the precise profile of leader you need.",
    detail: "3-5 Day Turnaround",
  },
  {
    number: "02",
    title: "Market Mapping",
    description: "Our research team maps the entire market landscape, identifying both active and passive candidates who fit your criteria with precision.",
    detail: "Comprehensive Intelligence",
  },
  {
    number: "03",
    title: "Curated Shortlist",
    description: "We present a curated shortlist of typically 4-6 exceptional candidates, each backed by detailed assessment reports and reference insights.",
    detail: "4–6 Candidates",
  },
  {
    number: "04",
    title: "Selection & Offer",
    description: "We facilitate interviews, manage assessments, and guide both parties through negotiation to achieve aligned, sustainable outcomes.",
    detail: "Guaranteed Success",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 relative overflow-hidden" style={{ background: "#080E1C" }}>
      {/* Decorative line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[rgba(201,168,76,0.15)] to-transparent hidden lg:block" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
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
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              How We Deliver
              <br />
              <span className="gradient-text">Extraordinary Results</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#9CA3AF] text-lg leading-relaxed"
          >
            Our proprietary four-stage methodology has been refined across 15 years and thousands of placements to consistently deliver leaders who transform organisations.
          </motion.p>
        </div>

        {/* Steps */}
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
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px z-0"
                  style={{ background: "linear-gradient(90deg, rgba(201,168,76,0.3), transparent)" }}
                />
              )}

              <div className="relative glass-light rounded-2xl p-6 gradient-border h-full flex flex-col group hover:border-[rgba(201,168,76,0.3)] transition-all duration-300">
                {/* Step number */}
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="text-5xl font-black gradient-text leading-none"
                    style={{ fontFamily: 'var(--font-playfair)', opacity: 0.4 }}
                  >
                    {step.number}
                  </span>
                  <div className="w-8 h-8 rounded-full border border-[rgba(201,168,76,0.3)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
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
