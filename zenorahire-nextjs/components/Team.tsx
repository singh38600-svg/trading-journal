"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const team = [
  {
    name: "Anika Rao",
    role: "Founder & CEO",
    spec: "Executive Search",
    avatar: "AR",
    color: "from-indigo-500 to-purple-600",
    exp: "14 yrs exp",
  },
  {
    name: "Vikram Patel",
    role: "Head of Tech Recruitment",
    spec: "IT & Engineering",
    avatar: "VP",
    color: "from-cyan-500 to-blue-600",
    exp: "10 yrs exp",
  },
  {
    name: "Meera Joshi",
    role: "Senior Consultant",
    spec: "BFSI & Fintech",
    avatar: "MJ",
    color: "from-emerald-500 to-teal-600",
    exp: "8 yrs exp",
  },
  {
    name: "Rohan Singh",
    role: "Global Partnerships",
    spec: "International Hiring",
    avatar: "RS",
    color: "from-amber-500 to-orange-600",
    exp: "9 yrs exp",
  },
];

export default function Team() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="team" className="py-28 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-medium">The Team</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            People who make <span className="grad">it happen</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Seasoned recruiters who've been on both sides of the table — as hirers and as candidates.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="group relative rounded-2xl glass border border-white/6 hover:border-indigo-500/30 p-6 text-center transition-all duration-300 overflow-hidden cursor-default"
            >
              {/* bg on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* avatar */}
              <div className="relative z-10">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {member.avatar}
                </div>
                <div className="text-xs text-indigo-400 font-medium mb-1">{member.exp}</div>
                <h3 className="font-semibold text-white text-sm mb-1">{member.name}</h3>
                <p className="text-xs text-slate-400 mb-2">{member.role}</p>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/5 border border-white/8 text-xs text-slate-500">
                  {member.spec}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
