"use client";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">Z</span>
              <span className="font-bold text-base">Zenora<span className="grad">Hire</span></span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              World-class recruitment consultancy connecting exceptional talent with forward-thinking companies.
            </p>
            <div className="flex gap-3">
              {["in", "tw", "gh"].map((s) => (
                <a key={s} href="#" className="w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-xs text-slate-400 hover:text-white hover:border-indigo-500/30 transition-all">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* services */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Services</h4>
            <ul className="space-y-2.5">
              {["Executive Search", "IT Recruitment", "Startup Hiring", "Global Placements", "RPO Solutions"].map(l => (
                <li key={l}><a href="#services" className="text-sm text-slate-400 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* company */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Company</h4>
            <ul className="space-y-2.5">
              {["About Us", "Our Process", "Case Studies", "Careers", "Blog"].map(l => (
                <li key={l}><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Contact</h4>
            <ul className="space-y-2.5">
              <li><a href="mailto:hello@zenorahire.com" className="text-sm text-slate-400 hover:text-white transition-colors">hello@zenorahire.com</a></li>
              <li><span className="text-sm text-slate-500">Mumbai · Delhi · Bangalore</span></li>
              <li><span className="text-sm text-slate-500">Dubai · Singapore</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">© 2025 ZenoraHire. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => (
              <a key={l} href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
