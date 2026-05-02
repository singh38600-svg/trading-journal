import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZenoraHire — World-Class Recruitment Consultancy",
  description: "We connect exceptional talent with forward-thinking companies. Executive search, IT recruitment, and leadership hiring.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="noise">{children}</body>
    </html>
  );
}
