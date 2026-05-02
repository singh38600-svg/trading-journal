"use client";

import { motion } from "framer-motion";

const roles = [
  {
    title: "Senior Backend Developer",
    stacks: ["Java", "Python", "Go"],
    experience: "4–8 years",
    ctcRange: "₹18L – ₹40L",
    icon: "🖥️",
  },
  {
    title: "Full Stack Engineer",
    stacks: ["Node.js", "React", "TypeScript"],
    experience: "3–7 years",
    ctcRange: "₹15L – ₹35L",
    icon: "⚡",
  },
  {
    title: "DevOps / SRE",
    stacks: ["AWS", "Kubernetes", "Terraform"],
    experience: "4–9 years",
    ctcRange: "₹20L – ₹45L",
    icon: "🔧",
  },
  {
    title: "Data Engineer",
    stacks: ["Spark", "Airflow", "dbt"],
    experience: "3–7 years",
    ctcRange: "₹18L – ₹38L",
    icon: "📊",
  },
  {
    title: "Engineering Manager",
    stacks: ["Team Leadership", "System Design", "Roadmapping"],
    experience: "7–12 years",
    ctcRange: "₹35L – ₹80L",
    icon: "🎯",
  },
  {
    title: "Mobile Developer",
    stacks: ["React Native", "Flutter", "iOS/Android"],
    experience: "3–7 years",
    ctcRange: "₹14L – ₹32L",
    icon: "📱",
  },
];

export default function RolesWeClose() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden" style={{ background: "#080E1C" }}>
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full glass-light"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A84C]">Roles We Typically Close</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            The Profiles We Know
            <br />
            <span className="gradient-text">Inside and Out</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#9CA3AF] max-w-xl mx-auto mt-4"
          >
            These are the role types we've closed most — with deep talent networks, calibrated
            question banks, and a shortlist ready in 48 hours.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              whileHover={{ y: -3 }}
              className="group glass-light rounded-2xl p-6 gradient-border transition-all duration-300 flex flex-col"
            >
              {/* Icon + Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: "rgba(201,168,76,0.1)" }}
                >
                  {role.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-[#F5D080] transition-colors"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {role.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">{role.experience} experience</p>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-5 flex-1">
                {role.stacks.map((s) => (
                  <span key={s}
                    className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                    style={{ background: "rgba(201,168,76,0.07)", color: "#9CA3AF" }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* CTC */}
              <div className="pt-4 border-t border-[rgba(201,168,76,0.08)] flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#4B5563] uppercase tracking-wider mb-0.5">Typical CTC</p>
                  <span className="text-sm font-bold gradient-text">{role.ctcRange}</span>
                </div>
                <a href="/contact"
                  className="text-xs font-semibold text-[#C9A84C] hover:text-[#F5D080] transition-colors flex items-center gap-1"
                >
                  Hire this role
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-[#4B5563] mt-10"
        >
          Don't see your role?{" "}
          <a href="/contact" className="text-[#C9A84C] hover:text-[#F5D080] transition-colors font-medium">
            Tell us what you need →
          </a>
        </motion.p>
      </div>
    </section>
  );
}
