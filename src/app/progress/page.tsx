import { Flame, Zap, CheckCircle2, RefreshCw, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function ProgressPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Progress</h1>
        <p className="text-slate-400 text-sm mt-1">
          Your mastery & active recall performance at a glance.
        </p>
      </div>

      {/* Hero Mastery Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Overall Knowledge Mastery
          </span>
          <span className="text-2xl font-black text-indigo-300">33%</span>
        </div>
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-700"
            style={{ width: '33%' }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 pt-1">
          <span>Target: ≥80% Mastery</span>
          <span className="text-slate-300">1 of 3 Sommelier Lessons Mastered</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <Flame className="w-4 h-4" /> Streak
          </div>
          <p className="text-2xl font-bold text-white">1 Day</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
            <Zap className="w-4 h-4" /> Total XP
          </div>
          <p className="text-2xl font-bold text-white">120 XP</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" /> Mastered
          </div>
          <p className="text-2xl font-bold text-white">1 Lesson</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium">
            <BookOpen className="w-4 h-4" /> Concepts
          </div>
          <p className="text-2xl font-bold text-white">9 Learned</p>
        </div>
      </div>

      {/* Recent Activity / Spaced Review */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-indigo-400" /> Spaced Retention Schedule
        </h3>

        <div className="space-y-2.5">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-200 font-medium">1855 Bordeaux First Growths</span>
            </div>
            <span className="text-slate-400 font-mono">Review due in 1 day</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs opacity-60">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="text-slate-200 font-medium">Pinot Noir vs Nebbiolo vs Syrah</span>
            </div>
            <span className="text-slate-400 font-mono">Unlearned</span>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/learn"
            className="block text-center py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold text-xs border border-indigo-500/30 transition-all"
          >
            Continue Active Recall Session →
          </Link>
        </div>
      </div>
    </div>
  );
}
