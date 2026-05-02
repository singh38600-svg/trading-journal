"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Play, Star } from "lucide-react";

const stats = [
  { value: "2,400+", label: "Placements Made" },
  { value: "98%", label: "Client Retention" },
  { value: "£2.8B", label: "Salary Value Placed" },
  { value: "40+", label: "Countries Reached" },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#060B18]">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{
            y,
            background: "radial-gradient(circle, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.05) 50%, transparent 70%)",
            filter: "blur(60px)",
          }}
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-20"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-60" />
        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, rgba(201,168,76,0.5) 0%, transparent 70%)", filter: "blur(60px)" }}
        />
      </div>

      <motion.div style={{ opacity }} className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 glass-light rounded-full px-4 py-1.5 mb-8 glow-gold-sm"
        >
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} fill="#C9A84C" stroke="none" />
            ))}
          </div>
          <span className="text-xs text-[#C9A84C] font-semibold tracking-wide uppercase">Trusted by FTSE 100 & Fortune 500</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-[80px] font-bold leading-[1.05] tracking-tight mb-6 max-w-5xl"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Where{" "}
          <span className="gradient-text text-glow">Exceptional</span>
          <br />
          Talent Meets{" "}
          <span className="relative inline-block">
            Vision
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, #C9A84C, #F5D080, #C9A84C)" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            />
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-lg md:text-xl text-[#9CA3AF] max-w-2xl leading-relaxed mb-10"
        >
          ZenoraHire is the premium executive search firm placing transformative leaders
          in roles that redefine industries. We don't just fill positions — we architect careers
          and build legacies.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center gap-4 mb-16"
        >
          <a
            href="#contact"
            className="group relative inline-flex items-center gap-2 text-sm font-semibold text-black px-7 py-3.5 rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.02] glow-gold"
            style={{ background: "linear-gradient(135deg, #C9A84C 0%, #F5D080 50%, #C9A84C 100%)", backgroundSize: "200%" }}
          >
            Find Top Talent
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#how-it-works"
            className="group inline-flex items-center gap-2.5 text-sm font-medium text-white px-6 py-3.5 rounded-full glass-light hover:border-[rgba(201,168,76,0.3)] transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[#C9A84C] to-[#A07A2E]">
              <Play size={12} fill="black" stroke="none" />
            </div>
            See How It Works
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.08 }}
              className="glass-light rounded-2xl px-5 py-4 gradient-border"
            >
              <div className="gradient-text font-bold text-2xl md:text-3xl mb-1 text-glow" style={{ fontFamily: 'var(--font-playfair)' }}>
                {stat.value}
              </div>
              <div className="text-xs text-[#6B7280] font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#060B18] to-transparent pointer-events-none" />
    </section>
  );
}
