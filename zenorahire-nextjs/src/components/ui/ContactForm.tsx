"use client";

import { useActionState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { submitContact, type ContactState } from "@/app/actions/contact";

const initial: ContactState = { status: "idle" };

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-[#9CA3AF]">
        {label} {required && <span className="text-[#C9A84C]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#4B5563] outline-none transition-all duration-200
          focus:border-[rgba(201,168,76,0.5)] focus:ring-1 focus:ring-[rgba(201,168,76,0.3)]"
        style={{ background: "rgba(19,29,53,0.8)", border: "1px solid rgba(201,168,76,0.12)" }}
      />
    </div>
  );
}

export default function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <AnimatePresence mode="wait">
      {state.status === "success" ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ background: "linear-gradient(135deg, #C9A84C, #F5D080)" }}
          >
            <CheckCircle size={32} className="text-black" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
            Message Sent!
          </h3>
          <p className="text-[#9CA3AF] max-w-xs">
            Thanks for reaching out. We'll be in touch within 24 hours.
          </p>
          <a
            href="https://calendly.com/zenorahire"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-black px-6 py-3 rounded-full"
            style={{ background: "linear-gradient(135deg, #C9A84C, #F5D080)" }}
          >
            Or book a call now
            <ArrowRight size={14} />
          </a>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          ref={formRef}
          action={action}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-5"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Your Name" name="name" placeholder="Alex Kumar" required />
            <Field label="Company" name="company" placeholder="Acme SaaS Inc." />
          </div>
          <Field
            label="Role You're Hiring For"
            name="role"
            placeholder="e.g. Senior Backend Engineer (Python)"
            required
          />
          <Field label="Work Email" name="email" type="email" placeholder="alex@company.com" required />

          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-sm font-medium text-[#9CA3AF]">
              Message <span className="text-[#C9A84C]">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              placeholder="Tell us about the role, team size, timeline, and any must-haves..."
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#4B5563] outline-none resize-none transition-all duration-200
                focus:border-[rgba(201,168,76,0.5)] focus:ring-1 focus:ring-[rgba(201,168,76,0.3)]"
              style={{ background: "rgba(19,29,53,0.8)", border: "1px solid rgba(201,168,76,0.12)" }}
            />
          </div>

          {/* Error */}
          {state.status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-red-400 px-4 py-3 rounded-xl"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              <AlertCircle size={15} />
              {state.message}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="group inline-flex items-center justify-center gap-2.5 font-semibold text-black px-8 py-4 rounded-full transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            style={{ background: "linear-gradient(135deg, #C9A84C 0%, #F5D080 50%, #C9A84C 100%)" }}
          >
            {pending ? (
              <>
                <Loader size={16} className="animate-spin" />
                Sending…
              </>
            ) : (
              <>
                Send Message
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-xs text-[#4B5563] text-center">
            Or{" "}
            <a href="https://calendly.com/zenorahire" target="_blank" rel="noopener noreferrer"
              className="text-[#C9A84C] hover:text-[#F5D080] transition-colors"
            >
              book a 15-min call directly
            </a>{" "}
            — no forms, no friction.
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
