import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../store/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voicy — AI-Powered Invoicing & Payroll Automation",
  description: "Streamline your financial operations with Voicy. Your ultimate command center for smart invoicing, payroll management, and business growth.",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Voicy — AI-Powered Invoicing & Payroll Automation",
    description: "Your ultimate command center for smart invoicing, payroll management, and business growth.",
    type: "website",
    siteName: "Voicy",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="bg-background text-on-background font-body-md overflow-x-hidden min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
