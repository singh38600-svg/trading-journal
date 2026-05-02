"use client";

import { motion } from "framer-motion";
import { Mail, Globe, MapPin, ExternalLink } from "lucide-react";

const links = {
  Services: [
    "Permanent Hiring",
    "Contract Staffing",
    "Executive Search",
    "AI-Powered Sourcing",
    "Technical Screening",
    "RPO / Embedded",
  ],
  Industries: [
    "SaaS Startups",
    "Fintech",
    "HealthTech",
    "EdTech",
    "US / UK GCCs",
    "E-commerce",
  ],
  Company: [
    "About Us",
    "How It Works",
    "Roles We Close",
    "Contact Us",
    "Careers",
    "Privacy Policy",
  ],
};

const socials = [
  { icon: ExternalLink, href: "https://linkedin.com/company/zenora-hire", label: "LinkedIn" },
  { icon: Mail, href: "mailto:contact@zenorahire.com", label: "Email" },
  { icon: Globe, href: "https://zenorahire.com", label: "Website" },
];

export default function Footer() {
  return (
    <footer className="bg-[#040810] border-t border-[rgba(201,168,76,0.08)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-14">
          {/* Brand col */}
          <div className="col-span-2 lg:col-span-2">
            <a href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A07A2E)" }}
              >
                <span className="text-black font-bold text-sm" style={{ fontFamily: "var(--font-playfair)" }}>Z</span>
              </div>
              <span className="text-white font-semibold text-lg">
                Zenora<span className="gradient-text font-bold">Hire</span>
              </span>
            </a>
            <p className="text-sm text-[#4B5563] leading-relaxed mb-5 max-w-xs">
              AI-powered tech recruitment for SaaS companies. Roles closed in 14 days. Pay only when you hire.
            </p>

            <div className="flex items-center gap-1.5 text-sm text-[#4B5563] mb-4">
              <MapPin size={13} className="text-[#C9A84C] shrink-0" />
              Jaipur, Rajasthan, India
            </div>
            <div className="flex items-center gap-1.5 text-sm mb-6">
              <Mail size={13} className="text-[#C9A84C] shrink-0" />
              <a href="mailto:contact@zenorahire.com"
                className="text-[#4B5563] hover:text-[#C9A84C] transition-colors"
              >
                contact@zenorahire.com
              </a>
            </div>

            <div className="flex gap-2.5">
              {socials.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full glass-light border border-[rgba(201,168,76,0.1)] flex items-center justify-center text-[#6B7280] hover:text-[#C9A84C] hover:border-[rgba(201,168,76,0.3)] transition-all duration-200"
                >
                  <Icon size={14} />
                </a>
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
                    <a href="#" className="text-sm text-[#4B5563] hover:text-[#9CA3AF] transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-[rgba(201,168,76,0.06)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#374151]">
            © {new Date().getFullYear()} Zenora Hire. All rights reserved. · Jaipur, India
          </p>
          <div className="flex flex-wrap items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Refund Policy"].map((item) => (
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
