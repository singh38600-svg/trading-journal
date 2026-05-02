"use client";
import { motion } from "framer-motion";

const items = [
  "Executive Search", "IT Recruitment", "Leadership Hiring", "Tech Talent",
  "Fast Placements", "Global Network", "Top 1% Candidates", "Trusted by 200+ Firms",
  "Executive Search", "IT Recruitment", "Leadership Hiring", "Tech Talent",
  "Fast Placements", "Global Network", "Top 1% Candidates", "Trusted by 200+ Firms",
];

export default function MarqueeBanner() {
  return (
    <div className="relative overflow-hidden py-4 border-y border-white/5 bg-gradient-to-r from-indigo-950/30 via-transparent to-indigo-950/30">
      <div className="flex whitespace-nowrap marquee-track">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center mx-8 text-sm font-medium text-slate-400">
            <span className="mr-8 text-indigo-500">◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
