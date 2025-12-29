import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TerminalDashboard from "@/components/TerminalDashboard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wircrypto Terminal - New Pools Scanner",
  description: "High-performance crypto terminal for Solana, Base, and BSC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TerminalDashboard>
          {children}
        </TerminalDashboard>
      </body>
    </html>
  );
}
