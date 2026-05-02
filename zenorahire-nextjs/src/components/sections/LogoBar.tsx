"use client";

import { motion } from "framer-motion";

const clients = [
  "Razorpay", "Groww", "Cred", "Meesho", "PhonePe", "Zepto",
  "Browserstack", "Postman", "Freshworks", "Chargebee", "Druva", "Whatfix",
  "Razorpay", "Groww", "Cred", "Meesho", "PhonePe", "Zepto",
  "Browserstack", "Postman", "Freshworks", "Chargebee", "Druva", "Whatfix",
];

export default function LogoBar() {
  return (
    <section className="py-14 border-y border-[rgba(201,168,76,0.08)] bg-[#060B18] overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-[#4B5563] font-semibold">
          Developers placed at fast-growing tech companies
        </p>
      </motion.div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-[#060B18] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-[#060B18] to-transparent pointer-events-none" />

        <div className="flex gap-10 animate-marquee whitespace-nowrap">
          {clients.map((client, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-light border border-[rgba(201,168,76,0.08)] shrink-0"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] opacity-60" />
              <span className="text-sm font-medium text-[#6B7280] whitespace-nowrap">{client}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
