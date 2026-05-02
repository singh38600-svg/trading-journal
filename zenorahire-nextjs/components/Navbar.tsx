"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

const links = ["Services", "Process", "Stats", "Testimonials", "Team"];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (v) => setScrolled(v > 60));
  }, [scrollY]);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "glass border-b border-white/5 py-3" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* logo */}
        <a href="#" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30">
            Z
          </span>
          <span className="font-bold text-lg tracking-tight">
            Zenora<span className="grad">Hire</span>
          </span>
        </a>

        {/* desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-sm text-slate-400 hover:text-white transition-colors duration-200 relative group"
            >
              {l}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-indigo-400 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* cta */}
        <div className="hidden md:flex items-center gap-3">
          <a href="#contact" className="text-sm text-slate-400 hover:text-white transition-colors">
            Login
          </a>
          <a
            href="#contact"
            className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
          >
            Hire Now
          </a>
        </div>

        {/* mobile burger */}
        <button
          className="md:hidden p-2 text-slate-400"
          onClick={() => setOpen(!open)}
        >
          <span className="block w-5 h-0.5 bg-current mb-1.5 transition-all" />
          <span className="block w-5 h-0.5 bg-current mb-1.5 transition-all" />
          <span className="block w-3 h-0.5 bg-current transition-all" />
        </button>
      </div>

      {/* mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass border-t border-white/5 px-6 py-4 flex flex-col gap-4"
        >
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-sm text-slate-300 hover:text-white"
              onClick={() => setOpen(false)}
            >
              {l}
            </a>
          ))}
          <a
            href="#contact"
            className="mt-2 px-5 py-2.5 rounded-full bg-indigo-600 text-sm font-medium text-white text-center"
            onClick={() => setOpen(false)}
          >
            Hire Now
          </a>
        </motion.div>
      )}
    </motion.nav>
  );
}
