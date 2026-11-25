"use client";

import { Navbar } from "@/components/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</main>
      <footer className="border-t border-line py-6 text-center text-xs text-muted">© {new Date().getFullYear()} PHAR / NAYA</footer>
    </div>
  );
}
