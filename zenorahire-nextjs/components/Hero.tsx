"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import MagneticButton from "./MagneticButton";

const words = ["Top Talent", "Dream Teams", "Future Leaders", "Tech Experts", "Game Changers"];

function TypeWriter() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[idx];
    let timeout: NodeJS.Timeout;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 75);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else {
      setDeleting(false);
      setIdx((i) => (i + 1) % words.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, idx]);

  return (
    <span className="grad">
      {displayed}
      <span className="blink ml-0.5 text-indigo-400">|</span>
    </span>
  );
}

function SplitText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5, delay: 0.8 + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg">
      <motion.div style={{ y, opacity }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-10"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border border-indigo-500/20 text-xs font-medium text-indigo-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            Now placing candidates in 15+ industries
          </span>
        </motion.div>

        {/* headline line 1 */}
        <h1 className="text-5xl md:text-7xl lg:text-[88px] font-bold leading-[1.04] tracking-tight mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          <SplitText text="We Place" className="block text-white" />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="block"
          >
            <TypeWriter />
          </motion.span>
        </h1>

        {/* sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12"
        >
          ZenoraHire connects exceptional professionals with forward-thinking companies.
          Executive search, IT recruitment, and leadership hiring — done right.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <MagneticButton
            href="#contact"
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-indigo-600 text-white font-semibold text-base overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/40 glow-pulse"
          >
            <span className="relative z-10">Find Top Talent</span>
            <svg className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </MagneticButton>

          <MagneticButton
            href="#services"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full glass border border-white/10 text-slate-300 font-medium text-base hover:text-white hover:border-indigo-500/40 transition-all duration-300"
          >
            View Services ↓
          </MagneticButton>
        </motion.div>

        {/* social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.2 }}
          className="mt-20 pt-10 border-t border-white/5"
        >
          <p className="text-xs text-slate-600 uppercase tracking-[0.3em] mb-8">Talent placed at</p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-25">
            {["Google", "Microsoft", "Amazon", "Goldman Sachs", "Flipkart", "Razorpay"].map((c) => (
              <span key={c} className="text-sm font-bold text-slate-300 tracking-wide">{c}</span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-indigo-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
