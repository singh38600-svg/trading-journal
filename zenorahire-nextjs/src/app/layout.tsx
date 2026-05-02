import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zenora Hire | AI-Powered Tech Recruitment | Roles Closed in 14 Days",
  description:
    "We help SaaS companies close mid-to-senior developer roles in 14 days using AI sourcing and human screening. Pay only when you hire. Based in Jaipur, India.",
  keywords: [
    "tech recruitment India",
    "developer hiring",
    "AI recruitment",
    "SaaS hiring",
    "engineering recruiter Jaipur",
    "Zenora Hire",
    "14 day hiring",
    "RPO India",
  ],
  authors: [{ name: "Zenora Hire", url: "https://zenorahire.com" }],
  openGraph: {
    type: "website",
    url: "https://zenorahire.com",
    title: "Zenora Hire | AI-Powered Tech Recruitment | Roles Closed in 14 Days",
    description:
      "We help SaaS companies close mid-to-senior developer roles in 14 days using AI sourcing and human screening. Pay only when you hire.",
    siteName: "Zenora Hire",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zenora Hire | AI-Powered Tech Recruitment",
    description: "Close your next tech hire in 14 days. AI sourcing + human screening. Pay only on hire.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://zenorahire.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
