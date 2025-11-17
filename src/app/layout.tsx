import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ConvexStoreInitializer } from "@/components/ConvexStoreInitializer";
import { StatusProvider } from "@/contexts/StatusContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Memory MVP - Memvella",
  description: "A lightweight memory companion prototype",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased text-[var(--mv-text)]`}
      >
        <ConvexClientProvider>
          <ConvexStoreInitializer />
          <StatusProvider>
            <main className="min-h-screen w-full">
              {children}
            </main>
          </StatusProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

