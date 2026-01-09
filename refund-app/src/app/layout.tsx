import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import GlobalConcierge from "@/components/concierge/GlobalConcierge";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Ryyt - Refund Transparency Layer",
  description: "The missing middleware for e-commerce refunds.",
  icons: {
    icon: "/favicon.ico?v=2",
    apple: "/favicon.ico?v=2",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-black text-white`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          <GlobalConcierge />
        </AuthProvider>
      </body>
    </html>
  );
}
