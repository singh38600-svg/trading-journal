"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "ZenoraHire placed our new CFO in 28 days. Their understanding of our culture and the precision of their brief was unlike anything we'd experienced. The quality of candidates was simply on another level.",
    author: "James Whitfield",
    role: "CEO",
    company: "Meridian Capital Partners",
    avatar: "JW",
    rating: 5,
  },
  {
    quote: "We'd worked with the top-four consultancies before. ZenoraHire's network is deeper, their process faster, and the cultural fit of their placements is consistently extraordinary. They're our exclusive partner now.",
    author: "Priya Nair",
    role: "Chief People Officer",
    company: "NexGen Technologies",
    avatar: "PN",
    rating: 5,
  },
  {
    quote: "Finding a Chief Medical Officer with the right clinical authority AND commercial acumen is notoriously difficult. ZenoraHire delivered three exceptional candidates within three weeks. Remarkable.",
    author: "Dr. Sebastian Möller",
    role: "Chairman",
    company: "EuroGen Biotech AG",
    avatar: "SM",
    rating: 5,
  },
  {
    quote: "Our portfolio companies trust ZenoraHire unconditionally. Their speed, discretion, and accuracy in understanding private equity talent needs sets them apart from every other firm in the market.",
    author: "Charlotte Davies",
    role: "Partner",
    company: "Apex Growth Equity",
    avatar: "CD",
    rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDir(1);
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const go = (direction: number) => {
    setDir(direction);
    setCurrent((c) => (c + direction + testimonials.length) % testimonials.length);
  };

  const t = testimonials[current];

  return (
    <section id="testimonials" className="py-24 md:py-32 relative overflow-hidden" style={{ background: "#080E1C" }}>
      {/* Gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)" }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full glass-light"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A84C]">Client Stories</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Heard from Those
            <br />
            <span className="gradient-text">Who Know Best</span>
          </motion.h2>
        </div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="glass rounded-3xl p-10 md:p-14 gradient-border glow-gold relative overflow-hidden">
            {/* Quote icon */}
            <Quote size={64} className="absolute top-6 right-8 opacity-5 text-[#C9A84C]" />

            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={current}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-full" style={{ background: "linear-gradient(135deg, #C9A84C, #F5D080)" }} />
                  ))}
                </div>

                <p className="text-xl md:text-2xl text-white leading-relaxed font-medium mb-10"
                  style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}
                >
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-black shrink-0"
                    style={{ background: "linear-gradient(135deg, #C9A84C, #F5D080)" }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white">{t.author}</div>
                    <div className="text-sm text-[#6B7280]">{t.role} · {t.company}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDir(i > current ? 1 : -1); setCurrent(i); }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === current ? "w-8 bg-[#C9A84C]" : "w-2 bg-[rgba(201,168,76,0.2)]"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => go(-1)}
                className="w-10 h-10 rounded-full glass-light border border-[rgba(201,168,76,0.15)] flex items-center justify-center text-[#9CA3AF] hover:text-[#C9A84C] hover:border-[rgba(201,168,76,0.4)] transition-all duration-200"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => go(1)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-black transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #C9A84C, #F5D080)" }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
