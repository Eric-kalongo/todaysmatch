import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Today's Match | Live Football Scores & Fixtures",
  description: "Track today's football matches, live scores, and fixtures from major leagues. Real-time updates for Premier League, La Liga, Champions League, and more.",
  keywords: ["football scores", "todays match", "live soccer", "premier league live", "football fixtures"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}