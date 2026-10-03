'use client';

import { useState, useEffect } from 'react';
import { Plus, Wine, FileText, CheckCircle2, Sparkles, Upload, Loader2, Link2 } from 'lucide-react';
import Link from 'next/link';
import { getInitialSources, saveSource, StoredSource } from '@/lib/storage';
import { PresetLesson } from '@/lib/sommelier-preset';

interface ApiQuestion {
  id?: string;
  knowledgeNodeId?: string;
  type?: 'multiple_choice' | 'fill_blank' | 'typed_recall' | 'matching' | 'ordering' | 'true_false';
  prompt: string;
  expectedAnswer: string;
  acceptableVariants?: string[];
  distractors?: { text: string; misconceptionReason?: string }[];
  options?: string[];
  difficulty?: number;
  groundingChunk?: string;
}

interface ApiLesson {
  id?: string;
  title?: string;
  nodes?: { id: string; content: string; detail?: string | null; sourceChunk: string }[];
  questions?: ApiQuestion[];
}

export default function LibraryPage() {
  const [sources, setSources] = useState<StoredSource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'pdf' | 'url'>('text');
  const [pastedText, setPastedText] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    setSources(getInitialSources());
  }, []);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    setIsProcessing(true);

    try {
      const payloadContent = activeTab === 'url' ? urlInput : (pastedText || titleInput);

      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleInput,
          content: payloadContent,
          type: activeTab,
        }),
      });

      const data = await res.json();

      let createdLessons: PresetLesson[] = [];

      if (res.ok && data.lessons && Array.isArray(data.lessons)) {
        createdLessons = (data.lessons as ApiLesson[]).map((l: ApiLesson, idx: number) => ({
          id: l.id || `custom-lesson-${idx + 1}`,
          title: l.title || `Lesson ${idx + 1}: ${titleInput}`,
          nodes: (l.nodes || []).map((n) => ({
            id: n.id,
            type: 'concept',
            content: n.content,
            detail: n.detail || '',
            importance: 4,
            category: 'memorize',
            sourceChunks: [n.sourceChunk],
          })),
          questions: (l.questions || []).map((q: ApiQuestion, qIdx: number) => ({
            id: q.id || `custom-q-${idx}-${qIdx}`,
            knowledgeNodeId: q.knowledgeNodeId || `node-${qIdx}`,
            type: q.type || 'multiple_choice',
            prompt: q.prompt,
            expectedAnswer: q.expectedAnswer,
            acceptableVariants: q.acceptableVariants || [],
            distractors: q.distractors || [],
            options: q.options || undefined,
            difficulty: q.difficulty || 2,
            groundingChunk: q.groundingChunk || payloadContent.slice(0, 100),
          })),
        }));
      }

      const newSource: StoredSource = {
        id: `source-${Date.now()}`,
        name: titleInput,
        type: activeTab,
        mastery: 0,
        lessonsCount: createdLessons.length || 1,
        status: 'ready',
        lessons: createdLessons,
      };

      const updated = saveSource(newSource);
      setSources(updated);
    } catch (err) {
      console.error('Ingestion request error:', err);
    } finally {
      setIsProcessing(false);
      setTitleInput('');
      setPastedText('');
      setUrlInput('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Library</h1>
          <p className="text-slate-400 text-sm mt-1">
            Ingest learning material to build your active recall curriculum.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          Add Material
        </button>
      </div>

      {/* Preset Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-500/20 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Wine className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Sommelier Master Preset
              </span>
            </div>
            <h3 className="text-lg font-semibold text-amber-100">Wine Sommelier Fundamentals</h3>
            <p className="text-slate-300 text-sm max-w-xl">
              Includes 1855 Bordeaux First Growths, Pinot Noir vs Nebbiolo vs Syrah terroirs, Champagne traditional method, TCA faults, and food pairing science.
            </p>
            <div className="pt-3 flex items-center gap-3">
              <Link
                href="/learn?sourceId=sommelier-wine-fundamentals"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs tracking-wide uppercase transition-all shadow-md"
              >
                Learn Preset Now →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Your Knowledge Sources ({sources.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((src) => (
            <div
              key={src.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    {src.type === 'sommelier_preset' ? (
                      <Wine className="w-5 h-5 text-amber-400" />
                    ) : src.type === 'url' ? (
                      <Link2 className="w-5 h-5 text-sky-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-indigo-400" />
                    )}
                    <h3 className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {src.name}
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {src.lessonsCount} {src.lessonsCount === 1 ? 'lesson' : 'lessons'}
                  </span>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Mastery</span>
                    <span className="text-indigo-400 font-semibold">{src.mastery}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(src.mastery, 4)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for recall
                </span>
                <Link
                  href={`/learn?sourceId=${src.id}`}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all"
                >
                  Learn Now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Add Learning Source
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isProcessing}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Type selector */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'text' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Paste Text / MD
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pdf')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'pdf' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Upload PDF
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'url' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Web URL
              </button>
            </div>

            <form onSubmit={handleAddSource} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Source Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Champagne & Terroir Technical Reference"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              {activeTab === 'text' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Content
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Paste text, notes, or markdown here..."
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
              )}

              {activeTab === 'pdf' && (
                <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center space-y-2 hover:border-slate-700 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-medium text-slate-300">Drag & drop PDF here</p>
                  <p className="text-xs text-slate-500">Supports text & embedded diagrams</p>
                </div>
              )}

              {activeTab === 'url' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Webpage URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting Knowledge...
                    </>
                  ) : (
                    'Ingest & Process'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
