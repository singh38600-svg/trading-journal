"use client";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

const testimonials = [
  {
    quote: "ZenoraHire found us a CTO in 11 days who has since built a 40-person engineering team. Genuinely the best recruitment experience I've had.",
    name: "Arjun Mehta",
    role: "CEO, FinEdge Technologies",
    avatar: "AM",
    color: "from-indigo-500 to-purple-600",
  },
  {
    quote: "We were struggling to hire senior data engineers for 6 months. ZenoraHire delivered three exceptional candidates within a week. Two are still with us 2 years later.",
    name: "Priya Sharma",
    role: "Head of Engineering, DataScale",
    avatar: "PS",
    color: "from-cyan-500 to-blue-600",
  },
  {
    quote: "Unlike typical recruiters, they actually understood our culture. The VP of Sales they placed has grown our revenue 3x in 18 months.",
    name: "Rahul Gupta",
    role: "Founder, GrowthLoop",
    avatar: "RG",
    color: "from-emerald-500 to-teal-600",
  },
  {
    quote: "Incredible attention to detail. They sent us exactly 4 candidates, and we hired 3 of them. No wasted time, no mismatches.",
    name: "Sarah Chen",
    role: "CHRO, Nexus Capital",
    avatar: "SC",
    color: "from-pink-500 to-rose-600",
  },
  {
    quote: "Their global reach is unmatched. We hired top talent from 3 countries through ZenoraHire. The whole process was seamless.",
    name: "David Williams",
    role: "MD, Apex Ventures",
    avatar: "DW",
    color: "from-amber-500 to-orange-600",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const t = testimonials[active];

  return (
    <section id="testimonials" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-medium">Client Stories</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Loved by the <span className="grad">world's best teams</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative rounded-3xl glass border border-white/8 p-10 md:p-14 overflow-hidden"
        >
          {/* bg glow */}
          <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br ${t.color} opacity-10 blur-[60px] transition-all duration-500`} />

          {/* quote mark */}
          <div className="text-7xl text-indigo-500/20 font-serif leading-none mb-6">"</div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-xl md:text-2xl text-slate-200 leading-relaxed mb-8 font-light">
                {t.quote}
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-slate-400">{t.role}</div>
                </div>
                {/* stars */}
                <div className="ml-auto flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* dots */}
        <div className="flex justify-center gap-3 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`transition-all duration-300 rounded-full ${
                i === active
                  ? "w-8 h-2.5 bg-indigo-500"
                  : "w-2.5 h-2.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
