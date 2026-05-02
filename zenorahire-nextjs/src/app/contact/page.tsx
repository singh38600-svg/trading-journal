import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/ui/ContactForm";
import { Calendar, Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Zenora Hire",
  description: "Get in touch with Zenora Hire. Tell us about your role and we'll have a shortlist ready within 48 hours.",
};

const contactDetails = [
  { icon: Mail, label: "Email", value: "contact@zenorahire.com", href: "mailto:contact@zenorahire.com" },
  { icon: MapPin, label: "Location", value: "Jaipur, Rajasthan, India", href: null },
  { icon: Clock, label: "Response Time", value: "Within 24 hours", href: null },
  { icon: Calendar, label: "Book a Call", value: "15-min intro call", href: "https://calendly.com/zenorahire" },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#060B18]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%)" }}
        />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full glass-light">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A84C]">Get In Touch</span>
          </div>
          <h1
            className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Tell Us About
            <br />
            <span className="gradient-text">Your Open Role</span>
          </h1>
          <p className="text-[#9CA3AF] text-lg max-w-xl mx-auto">
            Fill in the form and we'll have a curated shortlist of 5 screened candidates ready within 48 hours.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Left — contact details */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="glass rounded-2xl p-7 gradient-border">
                <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
                  How to Reach Us
                </h2>
                <div className="flex flex-col gap-5">
                  {contactDetails.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(201,168,76,0.1)" }}
                      >
                        <Icon size={16} className="text-[#C9A84C]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#4B5563] font-medium uppercase tracking-wide mb-0.5">{label}</p>
                        {href ? (
                          <a href={href} target={href.startsWith("http") ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            className="text-sm text-white hover:text-[#C9A84C] transition-colors"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="text-sm text-white">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-7 gradient-border">
                <h3 className="text-base font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
                  What Happens Next?
                </h3>
                <ol className="flex flex-col gap-3">
                  {[
                    "We review your brief within 24 hours",
                    "AI sources 100+ matched candidates overnight",
                    "Our team screens and shortlists the top 5",
                    "You receive profiles with notes within 48 hrs",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#6B7280]">
                      <span className="gradient-text font-bold shrink-0" style={{ fontFamily: "var(--font-playfair)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Right — form */}
            <div className="lg:col-span-3">
              <div className="glass rounded-2xl p-8 md:p-10 gradient-border glow-gold">
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
                  Send Us a Brief
                </h2>
                <p className="text-[#6B7280] text-sm mb-8">
                  The more detail you share, the more targeted our search.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
