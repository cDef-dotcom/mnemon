import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mnemon · AI Adaptive Tutor',
  description: 'Fast mastery first, followed by lightweight spaced retention.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Navigation Bar */}
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/learn" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
                M
              </div>
              <span className="font-semibold text-lg tracking-tight group-hover:text-white transition-colors">Mnemon</span>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2 bg-slate-900/90 p-1 rounded-full border border-slate-800">
              <Link
                href="/library"
                className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                Library
              </Link>
              <Link
                href="/learn"
                className="px-4 py-1.5 rounded-full text-sm font-medium text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 hover:bg-indigo-900/60 transition-all"
              >
                Learn
              </Link>
              <Link
                href="/progress"
                className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                Progress
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
