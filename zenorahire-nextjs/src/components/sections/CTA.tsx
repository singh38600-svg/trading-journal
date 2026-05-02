"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, Mail } from "lucide-react";

export default function CTA() {
  return (
    <section id="contact" className="py-24 md:py-32 bg-[#060B18] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 65%)", filter: "blur(40px)" }}
        />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="glass rounded-3xl p-10 md:p-16 gradient-border glow-gold text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 opacity-30"
            style={{ background: "radial-gradient(circle at top left, rgba(201,168,76,0.3) 0%, transparent 70%)" }}
          />
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-30"
            style={{ background: "radial-gradient(circle at bottom right, rgba(201,168,76,0.3) 0%, transparent 70%)" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse-gold" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A84C]">No Upfront Fees · Pay Only on Hire</span>
            </div>

            <h2
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Stop Waiting 90 Days.
              <br />
              <span className="gradient-text text-glow">Close Your Next Hire in 14.</span>
            </h2>

            <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              A 15-minute call is all it takes to get started. We'll understand your role,
              brief our AI, and have a shortlist with you within 48 hours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <a
                href="https://calendly.com/zenorahire"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 font-semibold text-black px-8 py-4 rounded-full transition-all duration-300 hover:scale-[1.02] glow-gold text-base"
                style={{ background: "linear-gradient(135deg, #C9A84C 0%, #F5D080 50%, #C9A84C 100%)" }}
              >
                <Calendar size={18} />
                Book a 15-min Call
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="mailto:contact@zenorahire.com"
                className="inline-flex items-center gap-2.5 font-semibold text-white px-8 py-4 rounded-full glass-light transition-all duration-300 hover:border-[rgba(201,168,76,0.4)] text-base"
              >
                <Mail size={18} className="text-[#C9A84C]" />
                contact@zenorahire.com
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#4B5563]">
              {[
                "No upfront fees",
                "90-day replacement guarantee",
                "Response within 24 hours",
                "Based in Jaipur, India",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#C9A84C] opacity-60" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
