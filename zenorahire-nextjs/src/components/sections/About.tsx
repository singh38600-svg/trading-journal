"use client";

import { motion } from "framer-motion";
import { Link2, ExternalLink } from "lucide-react";

const team = [
  {
    name: "Alexandra Voss",
    role: "Founder & CEO",
    bio: "Former Goldman Sachs VP. 18 years placing C-suite leaders across FTSE 100 and Fortune 500 companies.",
    initials: "AV",
    speciality: "Financial Services · Private Equity",
  },
  {
    name: "Marcus Chen",
    role: "Partner, Technology",
    bio: "Ex-Google talent strategist. Pioneered AI-augmented executive search methodology adopted industry-wide.",
    initials: "MC",
    speciality: "Technology · AI & Deep Tech",
  },
  {
    name: "Isabelle Fontaine",
    role: "Partner, Life Sciences",
    bio: "PhD Biochemistry. Built biotech leadership teams across Europe and North America for 14 years.",
    initials: "IF",
    speciality: "Healthcare · Biotech · Pharma",
  },
  {
    name: "Ravi Mehta",
    role: "Director, APAC",
    bio: "Singapore-based. Specialist in cross-border leadership moves and Asian market talent intelligence.",
    initials: "RM",
    speciality: "Asia-Pacific · Global Mobility",
  },
];

export default function About() {
  return (
    <section id="about" className="py-24 md:py-32 bg-[#060B18] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Split layout */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full glass-light">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A84C]">About Us</span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Fifteen Years of
              <br />
              <span className="gradient-text">Placing the Unfindable</span>
            </h2>
            <p className="text-[#9CA3AF] leading-relaxed mb-6 text-lg">
              ZenoraHire was founded on a single conviction: that the most transformative
              leaders are rarely looking. They're building, leading, and creating — and
              they need to be found, not advertised to.
            </p>
            <p className="text-[#6B7280] leading-relaxed mb-8">
              Our team of former operators, investors, and industry specialists brings
              genuine sector expertise to every search. We speak your language, understand
              your challenges, and move with the urgency your business demands.
            </p>

            <div className="flex flex-wrap gap-4">
              {[
                ["Founded", "2009"],
                ["Global Offices", "8"],
                ["Avg. Time to Fill", "32 Days"],
              ].map(([label, value]) => (
                <div key={label} className="glass-light rounded-xl px-5 py-3 gradient-border">
                  <div className="gradient-text font-bold text-lg" style={{ fontFamily: "var(--font-playfair)" }}>{value}</div>
                  <div className="text-xs text-[#6B7280] font-medium">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Decorative visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Concentric rings */}
              {[1, 0.7, 0.45, 0.25].map((scale, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border"
                  style={{
                    transform: `scale(${scale})`,
                    borderColor: `rgba(201,168,76,${0.06 + i * 0.04})`,
                    top: "50%",
                    left: "50%",
                    marginTop: `-${scale * 50}%`,
                    marginLeft: `-${scale * 50}%`,
                    width: `${scale * 100}%`,
                    height: `${scale * 100}%`,
                  }}
                  animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                  transition={{ duration: 30 + i * 10, repeat: Infinity, ease: "linear" }}
                />
              ))}
              {/* Center piece */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full flex items-center justify-center glow-gold"
                style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))" }}
              >
                <span className="text-4xl font-black gradient-text text-glow" style={{ fontFamily: "var(--font-playfair)" }}>Z</span>
              </div>
              {/* Orbiting dots */}
              {[0, 90, 180, 270].map((deg, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #C9A84C, #F5D080)",
                    top: "50%",
                    left: "50%",
                    transformOrigin: "0 0",
                  }}
                  animate={{ rotate: [deg, deg + 360] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
                  initial={{ x: "120px", y: "-6px" }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Team Grid */}
        <div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-white mb-8 text-center"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            The Team Behind Your Search
          </motion.h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group glass-light rounded-2xl p-6 gradient-border cursor-pointer transition-all duration-300"
              >
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-black mb-4 transition-transform group-hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #F5D080)" }}
                >
                  {member.initials}
                </div>
                <h4 className="font-bold text-white mb-0.5" style={{ fontFamily: "var(--font-playfair)" }}>
                  {member.name}
                </h4>
                <div className="text-xs text-[#C9A84C] font-semibold mb-3">{member.role}</div>
                <p className="text-xs text-[#6B7280] leading-relaxed mb-4 group-hover:text-[#9CA3AF] transition-colors">
                  {member.bio}
                </p>
                <div className="text-[10px] text-[#4B5563] font-medium border-t border-[rgba(201,168,76,0.08)] pt-3 mb-4">
                  {member.speciality}
                </div>
                <div className="flex gap-2">
                  {[Link2, ExternalLink].map((Icon, j) => (
                    <div key={j}
                      className="w-7 h-7 rounded-full glass flex items-center justify-center text-[#6B7280] hover:text-[#C9A84C] transition-colors cursor-pointer"
                    >
                      <Icon size={12} />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
