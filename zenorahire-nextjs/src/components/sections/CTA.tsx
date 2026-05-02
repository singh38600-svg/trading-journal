"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone } from "lucide-react";

export default function CTA() {
  return (
    <section id="contact" className="py-24 md:py-32 bg-[#060B18] relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 65%)", filter: "blur(40px)" }}
        />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="glass rounded-3xl p-10 md:p-16 gradient-border glow-gold text-center relative overflow-hidden">
          {/* Corner accents */}
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
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A84C]">Start Your Search Today</span>
            </div>

            <h2
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Ready to Find Your
              <br />
              <span className="gradient-text text-glow">Next Great Leader?</span>
            </h2>

            <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Whether you have an urgent vacancy or want to build a long-term talent pipeline,
              our team is ready to move. Let's talk — confidentially and without obligation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <a
                href="mailto:hello@zenorahire.com"
                className="group inline-flex items-center gap-2.5 font-semibold text-black px-8 py-4 rounded-full transition-all duration-300 hover:scale-[1.02] glow-gold text-base"
                style={{ background: "linear-gradient(135deg, #C9A84C 0%, #F5D080 50%, #C9A84C 100%)" }}
              >
                <Mail size={18} />
                Email Our Team
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="tel:+442071234567"
                className="inline-flex items-center gap-2.5 font-semibold text-white px-8 py-4 rounded-full glass-light transition-all duration-300 hover:border-[rgba(201,168,76,0.4)] text-base"
              >
                <Phone size={18} className="text-[#C9A84C]" />
                +44 207 123 4567
              </a>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#4B5563]">
              {[
                "No upfront commitment",
                "Confidential process",
                "Response within 24 hours",
                "Global reach",
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
