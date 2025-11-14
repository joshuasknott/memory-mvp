import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <nav className="border-b-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
              <div className="flex justify-between items-center h-20">
                <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Memory MVP
                </Link>
                <div className="flex gap-4">
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
      </body>
    </html>
  );
}

