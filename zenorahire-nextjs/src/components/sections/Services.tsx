"use client";

import { motion } from "framer-motion";
import { Search, Users, Briefcase, TrendingUp, Globe, Zap } from "lucide-react";

const services = [
  {
    icon: Search,
    title: "Executive Search",
    description: "Precision-targeted headhunting for C-suite and senior leadership positions. We identify passive candidates others cannot reach.",
    tag: "Most Popular",
    accent: true,
  },
  {
    icon: Users,
    title: "Board Advisory",
    description: "Strategic board composition consulting to ensure governance excellence and diversity of thought at the highest level.",
    tag: null,
    accent: false,
  },
  {
    icon: Briefcase,
    title: "Contingency Recruitment",
    description: "Performance-driven hiring for mid to senior-level roles with no upfront fees. Pay only on successful placement.",
    tag: null,
    accent: false,
  },
  {
    icon: TrendingUp,
    title: "Talent Strategy",
    description: "Bespoke workforce planning and talent pipeline development to future-proof your organisation's leadership.",
    tag: null,
    accent: false,
  },
  {
    icon: Globe,
    title: "Global Mobility",
    description: "Cross-border executive relocations with cultural onboarding, visa support, and international market intelligence.",
    tag: null,
    accent: false,
  },
  {
    icon: Zap,
    title: "Interim Leadership",
    description: "Rapid deployment of battle-tested interim executives and transformation leaders for critical transitions.",
    tag: "Fast Track",
    accent: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function Services() {
  return (
    <section id="services" className="py-24 md:py-32 bg-[#060B18] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-8 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full glass-light"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A84C]">Our Services</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Recruitment Solutions
            <br />
            <span className="gradient-text">Built for Excellence</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#9CA3AF] max-w-xl mx-auto text-lg"
          >
            From boardroom to breakout talent, our services span every level of your organisation.
          </motion.p>
        </div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`group relative p-7 rounded-2xl cursor-pointer transition-all duration-300 ${
                  service.accent
                    ? "glow-gold"
                    : ""
                } gradient-border`}
                style={{
                  background: service.accent
                    ? "linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(14,21,37,0.9) 60%)"
                    : "rgba(14,21,37,0.6)",
                }}
              >
                {service.tag && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: "linear-gradient(135deg, #C9A84C, #F5D080)", color: "#000" }}
                  >
                    {service.tag}
                  </div>
                )}

                <div className="mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${
                    service.accent ? "bg-gradient-to-br from-[#C9A84C] to-[#A07A2E]" : "bg-[rgba(201,168,76,0.1)] group-hover:bg-[rgba(201,168,76,0.15)]"
                  }`}>
                    <Icon size={22} className={service.accent ? "text-black" : "text-[#C9A84C]"} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {service.title}
                  </h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed group-hover:text-[#9CA3AF] transition-colors">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[#C9A84C] text-sm font-semibold group-hover:gap-2 transition-all">
                  Learn more
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
