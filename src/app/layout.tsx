import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RVS Onboarding",
  description: "User onboarding wizard exercise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="border-b border-white/10 backdrop-blur-md bg-white/5 px-6 py-4 flex items-center gap-8">
          <a href="/" className="font-bold text-lg tracking-tight text-white">
            <span className="text-indigo-400">RVS</span> Onboarding
          </a>
          <div className="flex gap-6">
            <a href="/admin" className="text-sm text-slate-300 hover:text-white transition-colors">
              Admin
            </a>
            <a href="/data" className="text-sm text-slate-300 hover:text-white transition-colors">
              Data Table
            </a>
          </div>
        </nav>
        <main className="max-w-2xl mx-auto py-12 px-4">{children}</main>
      </body>
    </html>
  );
}
