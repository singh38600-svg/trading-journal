"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const industries = [
  {
    name: "SaaS Startups",
    subtitle: "Series A–C",
    roles: ["Backend Engineers", "Full Stack Devs", "Platform Engineers", "Product Engineers"],
    count: "180+",
    icon: "⚡",
  },
  {
    name: "Fintech",
    subtitle: "Payments · Lending · Wealthtech",
    roles: ["Java / Python Devs", "Data Engineers", "Security Engineers", "Mobile Devs"],
    count: "110+",
    icon: "💹",
  },
  {
    name: "HealthTech",
    subtitle: "Digital Health · MedTech",
    roles: ["Backend (Node/Python)", "React Devs", "DevOps Engineers", "ML Engineers"],
    count: "70+",
    icon: "🧬",
  },
  {
    name: "EdTech",
    subtitle: "LMS · Upskilling · K-12",
    roles: ["Full Stack Engineers", "Mobile Devs", "DevOps / Infra", "QA Automation"],
    count: "55+",
    icon: "📚",
  },
  {
    name: "US / UK GCCs in India",
    subtitle: "Global Capability Centres",
    roles: ["Engineering Managers", "Architects", "Senior Engineers", "Tech Leads"],
    count: "65+",
    icon: "🌐",
  },
  {
    name: "E-commerce / D2C",
    subtitle: "Retail Tech · Marketplace",
    roles: ["Platform Engineers", "React / Next.js Devs", "Data Engineers", "DevOps"],
    count: "40+",
    icon: "🛒",
  },
];

export default function Industries() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="industries" className="py-24 md:py-32 bg-[#060B18] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full glass-light"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A84C]">Industries We Serve</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Deep Expertise in the
            <br />
            <span className="gradient-text">Sectors That Hire Most</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#9CA3AF] max-w-xl mx-auto mt-4"
          >
            We've built networks and domain fluency in the verticals where tech hiring is most competitive.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {industries.map((industry, i) => (
            <motion.div
              key={industry.name}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="group relative rounded-2xl p-6 cursor-pointer transition-all duration-300 overflow-hidden gradient-border"
              style={{ background: "rgba(14,21,37,0.7)" }}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{ opacity: hovered === i ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ background: "radial-gradient(ellipse at top left, rgba(201,168,76,0.08) 0%, transparent 70%)" }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-3xl mb-2 block">{industry.icon}</span>
                    <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
                      {industry.name}
                    </h3>
                    <p className="text-xs text-[#4B5563] mt-0.5">{industry.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <div className="gradient-text font-bold text-xl" style={{ fontFamily: "var(--font-playfair)" }}>
                      {industry.count}
                    </div>
                    <div className="text-[10px] text-[#4B5563] uppercase tracking-wide">Placements</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {industry.roles.map((role) => (
                    <span
                      key={role}
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                      style={{ background: "rgba(201,168,76,0.07)", color: "#9CA3AF" }}
                    >
                      {role}
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
