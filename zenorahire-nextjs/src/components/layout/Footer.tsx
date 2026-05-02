"use client";

import { motion } from "framer-motion";
import { Link2, ExternalLink, Mail, Globe } from "lucide-react";

const links = {
  Services: ["Executive Search", "Board Advisory", "Contingency", "Talent Strategy", "Global Mobility", "Interim"],
  Industries: ["Financial Services", "Technology", "Private Equity", "Life Sciences", "Professional Services", "Consumer"],
  Company: ["About Us", "Our Team", "Case Studies", "Press & Media", "Careers at ZH", "Contact"],
  Resources: ["Salary Guides", "Hiring Insights", "Leadership Blog", "Market Reports", "Candidate Hub", "ESG Toolkit"],
};

const socials = [
  { icon: Link2, href: "#", label: "LinkedIn" },
  { icon: ExternalLink, href: "#", label: "X / Twitter" },
  { icon: Mail, href: "mailto:hello@zenorahire.com", label: "Email" },
  { icon: Globe, href: "#", label: "Website" },
];

export default function Footer() {
  return (
    <footer className="bg-[#040810] border-t border-[rgba(201,168,76,0.08)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-14">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A07A2E)" }}
              >
                <span className="text-black font-bold text-sm" style={{ fontFamily: "var(--font-playfair)" }}>Z</span>
              </div>
              <span className="text-white font-semibold text-lg">
                Zenora<span className="gradient-text font-bold">Hire</span>
              </span>
            </a>
            <p className="text-sm text-[#4B5563] leading-relaxed mb-6 max-w-xs">
              The premium executive search and talent advisory firm trusted by the world's most ambitious organisations.
            </p>
            <div className="flex gap-2.5 mb-6">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full glass-light border border-[rgba(201,168,76,0.1)] flex items-center justify-center text-[#6B7280] hover:text-[#C9A84C] hover:border-[rgba(201,168,76,0.3)] transition-all duration-200"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {["London", "New York", "Singapore", "Dubai"].map((city) => (
                <span key={city}
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                  style={{ background: "rgba(201,168,76,0.06)", color: "#6B7280" }}
                >
                  {city}
                </span>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#C9A84C] mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#"
                      className="text-sm text-[#4B5563] hover:text-[#9CA3AF] transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-[rgba(201,168,76,0.06)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#374151]">
            © 2026 ZenoraHire Ltd. All rights reserved. Registered in England & Wales No. 07234891.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy", "Modern Slavery Act"].map((item) => (
              <a key={item} href="#" className="text-xs text-[#374151] hover:text-[#6B7280] transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
