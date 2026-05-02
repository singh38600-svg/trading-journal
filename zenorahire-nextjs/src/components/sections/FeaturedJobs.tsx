"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, ArrowUpRight } from "lucide-react";

const jobs = [
  {
    title: "Chief Financial Officer",
    company: "Series C FinTech",
    location: "London, UK",
    type: "Permanent",
    salary: "£280k–£340k + equity",
    tags: ["Finance", "IPO-ready", "SaaS"],
    urgent: true,
  },
  {
    title: "Chief Technology Officer",
    company: "Global Asset Manager",
    location: "New York / Remote",
    type: "Permanent",
    salary: "$350k–$420k + bonus",
    tags: ["Engineering", "AI/ML", "Cloud"],
    urgent: false,
  },
  {
    title: "Managing Director – APAC",
    company: "Private Equity Firm",
    location: "Singapore",
    type: "Permanent",
    salary: "SGD 550k–700k",
    tags: ["PE", "M&A", "Leadership"],
    urgent: true,
  },
  {
    title: "Chief People Officer",
    company: "FTSE 250 Retailer",
    location: "Manchester, UK",
    type: "Permanent",
    salary: "£200k–£240k",
    tags: ["HR", "Transformation", "D&I"],
    urgent: false,
  },
  {
    title: "VP of Product",
    company: "Health-Tech Scale-up",
    location: "Berlin / Hybrid",
    type: "Permanent",
    salary: "€180k–€220k + equity",
    tags: ["Product", "Health-Tech", "Growth"],
    urgent: false,
  },
  {
    title: "Interim CEO",
    company: "Confidential – Mid-Market",
    location: "Paris, France",
    type: "Interim · 12 months",
    salary: "€2,500/day",
    tags: ["Turnaround", "FMCG", "Interim"],
    urgent: true,
  },
];

export default function FeaturedJobs() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden" style={{ background: "#080E1C" }}>
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full glass-light"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A84C]">Live Searches</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Current Opportunities
              <br />
              <span className="gradient-text">Awaiting the Right Leader</span>
            </motion.h2>
          </div>
          <motion.a
            href="#contact"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#C9A84C] hover:text-[#F5D080] transition-colors group shrink-0"
          >
            View all opportunities
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job, i) => (
            <motion.div
              key={job.title + job.company}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              whileHover={{ y: -3 }}
              className="group glass-light rounded-2xl p-6 gradient-border cursor-pointer transition-all duration-300 hover:glow-gold-sm flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    {job.urgent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-black"
                        style={{ background: "linear-gradient(135deg, #C9A84C, #F5D080)" }}
                      >
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-[#F5D080] transition-colors"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {job.title}
                  </h3>
                  <p className="text-sm text-[#6B7280] mt-0.5">{job.company}</p>
                </div>
                <div className="w-9 h-9 rounded-full glass flex items-center justify-center text-[#6B7280] group-hover:text-[#C9A84C] group-hover:border-[rgba(201,168,76,0.3)] transition-all duration-200 shrink-0 ml-3">
                  <ArrowUpRight size={14} />
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-3 text-xs text-[#6B7280] mb-4">
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {job.type}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5 flex-1">
                {job.tags.map((tag) => (
                  <span key={tag}
                    className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                    style={{ background: "rgba(201,168,76,0.07)", color: "#9CA3AF" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Salary */}
              <div className="pt-4 border-t border-[rgba(201,168,76,0.08)]">
                <span className="text-sm font-bold gradient-text">{job.salary}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
