"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, ArrowRight, Trash2, FolderOpen, Search, Sparkles } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface SavedResearchItem {
  id: string;
  topic: string;
  date: string;
  factsCount: number;
  anglesCount: number;
  sourcesCount: number;
}

const DEFAULT_SAVED: SavedResearchItem[] = [
  { id: "sr1", topic: "What is ML", date: "Today", factsCount: 7, anglesCount: 6, sourcesCount: 5 },
  { id: "sr2", topic: "Why do people procrastinate", date: "Yesterday", factsCount: 8, anglesCount: 6, sourcesCount: 5 },
  { id: "sr3", topic: "Quantum computing", date: "3 days ago", factsCount: 6, anglesCount: 6, sourcesCount: 4 },
];

export default function SavedPage() {
  const [savedItems, setSavedItems] = useState<SavedResearchItem[]>(DEFAULT_SAVED);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('saved_research');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped: SavedResearchItem[] = parsed.map((item: any, idx: number) => ({
              id: item.id || `saved_${idx}`,
              topic: item.topic || "Untitled Topic",
              date: item.savedAt ? new Date(item.savedAt).toLocaleDateString() : "Recent",
              factsCount: item.facts?.length || 6,
              anglesCount: item.angles?.length || 6,
              sourcesCount: item.sources?.length || 5,
            }));
            setSavedItems(mapped);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedItems.filter(item => item.id !== id);
    setSavedItems(updated);
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('saved_research') || '[]');
      const filtered = stored.filter((s: any, idx: number) => (s.id || `saved_${idx}`) !== id);
      localStorage.setItem('saved_research', JSON.stringify(filtered));
    }
    showToast("Removed from saved library");
  };

  return (
    <div className="animate-fade-in-up max-w-4xl mx-auto px-2 sm:px-4 py-4">
      <header className="mb-6 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2 mb-1">
          <Bookmark className="w-5 h-5 text-rose-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Research
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Your saved library of topics, verified facts, viral angles, and source citations.
        </p>
      </header>

      {savedItems.length === 0 ? (
        <div className="creator-card p-12 text-center">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900 mb-1">No Saved Research Yet</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
            Search any topic in the research studio and click "Save" to build your personal creator library.
          </p>
          <Link
            href="/research"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl creator-gradient-bg text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all"
          >
            <span>Start Researching</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/research?topic=${encodeURIComponent(item.topic)}`)}
              className="creator-card p-5 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.date}
                  </span>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1 leading-snug group-hover:text-rose-600 transition-colors">
                  {item.topic}
                </h3>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>{item.factsCount} Facts</span>
                  <span>•</span>
                  <span>{item.anglesCount} Angles</span>
                  <span>•</span>
                  <span>{item.sourcesCount} Sources</span>
                </div>
                <span className="font-bold text-rose-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
