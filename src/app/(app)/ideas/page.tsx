"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Layers,
  MessageSquare,
  Image as ImageIcon,
  ArrowRight,
  Bookmark,
  Sparkles,
  Copy,
  Check,
  Search,
  Clapperboard
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface IdeaItem {
  id: number;
  type: 'Reel' | 'Carousel' | 'Story' | 'Post';
  icon: any;
  title: string;
  topic: string;
  hook: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  length: string;
  category: 'Educational' | 'Trending' | 'Beginner';
}

const IDEAS: IdeaItem[] = [
  {
    id: 1,
    type: 'Reel',
    icon: Play,
    title: 'AI Tools Every Student Needs in 2026',
    topic: 'How AI is changing education',
    hook: 'Stop writing essays the hard way. Here are 3 tools top students use.',
    difficulty: 'Easy',
    length: '30s',
    category: 'Educational'
  },
  {
    id: 2,
    type: 'Carousel',
    icon: Layers,
    title: 'How Teachers Save 5 Hours Every Week',
    topic: 'How AI is changing education',
    hook: 'The exact prompts educators use to automate lesson planning.',
    difficulty: 'Medium',
    length: '7 Slides',
    category: 'Trending'
  },
  {
    id: 3,
    type: 'Story',
    icon: MessageSquare,
    title: 'Classroom AI Ethics Quiz & Poll',
    topic: 'How AI is changing education',
    hook: 'Is using AI for studying considered cheating? Vote below.',
    difficulty: 'Easy',
    length: '4 Cards',
    category: 'Beginner'
  },
  {
    id: 4,
    type: 'Post',
    icon: ImageIcon,
    title: 'AI in Education: By The Numbers',
    topic: 'How AI is changing education',
    hook: '73% of teachers and 20% higher test scores: the stats don\'t lie.',
    difficulty: 'Hard',
    length: '1 Graphic',
    category: 'Educational'
  },
  {
    id: 5,
    type: 'Reel',
    icon: Play,
    title: 'The Great Calculator Panic of 1975',
    topic: 'The history of modern technology and education',
    hook: 'Schools tried to ban calculators. Today we\'re repeating the exact same mistake.',
    difficulty: 'Medium',
    length: '45s',
    category: 'Trending'
  },
  {
    id: 6,
    type: 'Carousel',
    icon: Layers,
    title: 'The 5-Step Socratic Study Prompt',
    topic: 'How AI is changing education',
    hook: 'How to turn any textbook into a 24/7 personal tutor.',
    difficulty: 'Easy',
    length: '5 Slides',
    category: 'Beginner'
  }
];

export default function IdeasPage() {
  const [filter, setFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const filteredIdeas = IDEAS.filter((idea) => {
    if (filter === 'All') return true;
    if (filter === 'Reels') return idea.type === 'Reel';
    if (filter === 'Carousels') return idea.type === 'Carousel';
    if (filter === 'Stories') return idea.type === 'Story';
    if (filter === 'Educational') return idea.category === 'Educational';
    if (filter === 'Trending') return idea.category === 'Trending';
    if (filter === 'Beginner') return idea.category === 'Beginner';
    return true;
  });

  const handleCopyHook = (hook: string, id: number) => {
    navigator.clipboard.writeText(hook);
    setCopiedId(id);
    showToast("Hook copied to clipboard");
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto px-2 sm:px-4 py-4">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-rose-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Content Formats & Ideas
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Turn research topics into high-converting Reel, Carousel, and Story concepts with ready-to-record hooks.
        </p>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-4 hide-scrollbar">
        {['All', 'Reels', 'Carousels', 'Stories', 'Educational', 'Trending', 'Beginner'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              filter === f
                ? 'creator-gradient-bg text-white shadow-xs font-bold'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map((idea) => {
          const Icon = idea.icon;
          const isCopied = copiedId === idea.id;

          return (
            <div key={idea.id} className="creator-card p-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-100">
                    <Icon className="w-3.5 h-3.5" /> {idea.type}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">{idea.difficulty} • {idea.length}</span>
                </div>

                <h3 className="font-bold text-base text-slate-900 mb-2 leading-snug">{idea.title}</h3>

                {/* Hook Box */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Spoken Hook</span>
                    <button
                      onClick={() => handleCopyHook(idea.hook, idea.id)}
                      className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 font-semibold"
                      title="Copy Hook"
                    >
                      {isCopied ? (
                        <span className="text-emerald-600 flex items-center gap-1 font-bold">
                          <Check className="w-3 h-3" /> Copied
                        </span>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 italic">"{idea.hook}"</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => router.push(`/research?topic=${encodeURIComponent(idea.topic)}`)}
                  className="flex-1 py-2 rounded-xl creator-gradient-bg text-white text-xs font-bold hover:opacity-95 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Research Topic</span>
                </button>
                <button
                  onClick={() => showToast("Idea bookmarked")}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800"
                  title="Bookmark Idea"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
