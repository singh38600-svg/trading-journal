"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", role: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-28 px-6 relative overflow-hidden">
      {/* bg glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-600/8 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* left */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-medium">Get Started</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Ready to hire<br /><span className="grad">exceptional talent?</span>
            </h2>
            <p className="mt-5 text-slate-400 leading-relaxed">
              Tell us about your hiring needs and we'll get back to you within 4 business hours with a tailored plan.
            </p>

            <div className="mt-10 space-y-5">
              {[
                { icon: "⚡", text: "First shortlist in 5–7 business days" },
                { icon: "🔒", text: "100% confidential search process" },
                { icon: "🎯", text: "90-day replacement guarantee" },
                { icon: "🌍", text: "Global reach, local expertise" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>

            {/* contact info */}
            <div className="mt-10 pt-8 border-t border-white/6 space-y-3">
              <a href="mailto:hello@zenorahire.com" className="flex items-center gap-3 text-sm text-slate-400 hover:text-indigo-300 transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">✉</span>
                hello@zenorahire.com
              </a>
              <a href="tel:+919999999999" className="flex items-center gap-3 text-sm text-slate-400 hover:text-indigo-300 transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">📞</span>
                +91 99999 99999
              </a>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">📍</span>
                Mumbai · Delhi · Bangalore · Dubai
              </div>
            </div>
          </motion.div>

          {/* right — form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="rounded-3xl glass border border-white/8 p-8">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold text-white mb-2">We'll be in touch!</h3>
                  <p className="text-slate-400 text-sm">
                    Expect a response from our team within 4 business hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Name</label>
                      <input
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="you@company.com"
                        className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Company</label>
                    <input
                      value={form.company}
                      onChange={e => setForm({ ...form, company: e.target.value })}
                      placeholder="Your company name"
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Role you're hiring for</label>
                    <input
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      placeholder="e.g. CTO, Senior Engineer, VP Sales"
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Message</label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your hiring challenge..."
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all resize-none"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                  >
                    Send Enquiry →
                  </motion.button>
                  <p className="text-center text-xs text-slate-600">
                    No spam. We'll respond within 4 business hours.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
