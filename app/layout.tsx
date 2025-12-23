import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Navbar from "./components/Navbar"; // IMPORT ADDED
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
      <body className={inter.className}>
        {/* Google Analytics Script */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-JT14DXVSX5"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JT14DXVSX5');
          `}
        </Script>
        
        {/* NAVBAR ADDED HERE */}
        <Navbar />

        {children}
      </body>
    </html>
  );
}