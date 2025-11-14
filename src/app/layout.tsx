import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ConvexStoreInitializer } from "@/components/ConvexStoreInitializer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>
          <ConvexStoreInitializer />
          <div className="min-h-screen bg-slate-50">
            <nav className="border-b border-slate-200 bg-white">
              <div className="max-w-5xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center">
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent text-xl font-semibold">
                      Memvella
                    </span>
                  </Link>
                  <div className="flex gap-3">
                    <Link href="/">
                      <Button variant="secondary" className="text-base px-4 py-2 min-h-[44px]">
                        Home
                      </Button>
                    </Link>
                    <Link href="/save">
                      <Button variant="secondary" className="text-base px-4 py-2 min-h-[44px]">
                        Save Memory
                      </Button>
                    </Link>
                    <Link href="/timeline">
                      <Button variant="secondary" className="text-base px-4 py-2 min-h-[44px]">
                        Timeline
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
            <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
              {children}
            </main>
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

