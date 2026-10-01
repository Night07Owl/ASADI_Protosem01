"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Trash2, ArrowRight, History, Sparkles } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface HistoryItem {
  id: number;
  title: string;
  date: string;
  facts: number;
  angles: number;
  sources: number;
}

const INITIAL_HISTORY: HistoryItem[] = [
  { id: 1, title: 'What is ML', date: 'Today, 11:20 AM', facts: 7, angles: 6, sources: 5 },
  { id: 2, title: 'How does photosynthesis work', date: 'Yesterday, 3:45 PM', facts: 8, angles: 6, sources: 5 },
  { id: 3, title: 'Why do people procrastinate', date: '2 days ago', facts: 8, angles: 6, sources: 5 },
  { id: 4, title: 'What is quantum computing', date: '3 days ago', facts: 6, angles: 6, sources: 4 },
  { id: 5, title: 'CRISPR gene editing', date: 'Last week', facts: 7, angles: 6, sources: 5 },
];

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [historyList, setHistoryList] = useState<HistoryItem[]>(INITIAL_HISTORY);
  const router = useRouter();
  const { showToast } = useToast();

  const filteredHistory = historyList.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistoryList(prev => prev.filter(item => item.id !== id));
    showToast("Removed from recent searches");
  };

  return (
    <div className="animate-fade-in-up max-w-4xl mx-auto px-2 sm:px-4 py-4">
      <header className="mb-6 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2 mb-1">
          <History className="w-5 h-5 text-rose-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Recent Searches
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Quickly re-open past research and see generated facts and content angles.
        </p>
      </header>

      {/* Search Filter Dock */}
      <div className="relative mb-5 max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter recent searches..." 
          className="w-full bg-white border border-slate-200 py-2.5 pl-10 pr-4 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-rose-400 transition-all text-slate-900 shadow-2xs"
        />
      </div>

      <div className="creator-card overflow-hidden divide-y divide-slate-100">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/research?topic=${encodeURIComponent(item.title)}`)}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                  {item.date}
                </span>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-rose-600 transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {item.facts} Key Facts • {item.angles} Angles • {item.sources} Sources
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Remove from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:creator-gradient-bg group-hover:text-white transition-all shadow-2xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            No searches found matching "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
}
