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
  title: "ZenoraHire — Premium Executive Recruitment",
  description: "ZenoraHire connects visionary companies with exceptional talent. World-class executive search and recruitment consulting for leading organisations.",
  keywords: "executive recruitment, talent acquisition, headhunting, leadership hiring, ZenoraHire",
  openGraph: {
    title: "ZenoraHire — Premium Executive Recruitment",
    description: "Connecting visionary companies with exceptional talent.",
    type: "website",
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
