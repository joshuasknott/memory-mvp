import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ConvexStoreInitializer } from "@/components/ConvexStoreInitializer";
import { StatusProvider } from "@/contexts/StatusContext";
import { PrimaryNav } from "@/components/PrimaryNav";
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
        className={`${inter.variable} antialiased bg-[var(--mv-bg)] text-[var(--mv-text)]`}
      >
        <ConvexClientProvider>
          <ConvexStoreInitializer />
          <StatusProvider>
            <div className="min-h-screen bg-[var(--mv-bg)]">
              <header className="border-b border-[var(--mv-border)] bg-[var(--mv-bg)]/95 backdrop-blur-sm">
                <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href="/"
                    className="flex items-center gap-3 text-left no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--mv-accent)]"
                    aria-label="Memvella home"
                  >
                    <div>
                      <p className="mv-logo-text text-2xl font-semibold tracking-tight">Memvella</p>
                      <p className="text-lg text-[var(--mv-text-muted)]">Calm memory companion</p>
                    </div>
                  </Link>
                  <PrimaryNav />
                </div>
              </header>
              <main className="mx-auto w-full max-w-[960px] px-6 py-12 sm:px-8 lg:px-10">
                {children}
              </main>
            </div>
          </StatusProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

