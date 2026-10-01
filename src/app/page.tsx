"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Search,
  Sparkles,
  Zap,
  CheckCircle2,
  Bookmark,
  Share2,
  Copy,
  Layers,
  Flame,
  Globe,
  FileText
} from 'lucide-react';

const SUGGESTED_TOPICS = [
  "What is ML",
  "How does photosynthesis work",
  "Why do people procrastinate",
  "What is quantum computing",
  "CRISPR gene editing",
  "Index fund investing for beginners",
  "Creatine & muscle growth"
];

export default function LandingPage() {
  const [topicInput, setTopicInput] = useState("What is ML");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (topicInput.trim()) {
      router.push(`/research?topic=${encodeURIComponent(topicInput.trim())}`);
    }
  };

  const handleQuickTopic = (t: string) => {
    setTopicInput(t);
    router.push(`/research?topic=${encodeURIComponent(t)}`);
  };

  return (
    <div className="min-h-screen text-slate-900 selection:bg-rose-100 selection:text-rose-900">
      {/* Modern Top Header / Navbar */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl creator-gradient-bg p-0.5 shadow-sm">
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-rose-600">
              <Zap className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
                Topic Intel
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60">
                For Creators
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium block mt-0.5">
              Facts • Angles • Useful Sources
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/research"
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl creator-gradient-bg text-white font-bold text-xs sm:text-sm tracking-wide shadow-sm hover:shadow-md hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <span>Open Research Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center pt-10 sm:pt-14 pb-20 px-4 sm:px-6 relative max-w-5xl mx-auto">
        <div className="text-center max-w-3xl z-10 animate-fade-in-up">
          {/* Creator Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-700 text-xs font-bold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>The 10-Second Research Assistant for Educational Creators</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5 leading-[1.12] text-slate-900">
            Turn any topic into <br className="hidden sm:inline" />
            <span className="creator-gradient-text">facts, angles & sources in seconds.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed font-normal">
            Researching before filming or writing takes too long. Type any question or topic to get verified data points, viral hooks, and peer-reviewed sources ready for your next Reel, Carousel, or Post.
          </p>

          {/* Fast Search Dock */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group mb-4">
            <div className="creator-dock rounded-2xl p-1.5 transition-all duration-200 focus-within:ring-4 focus-within:ring-rose-500/10 focus-within:border-rose-400">
              <div className="flex items-center gap-2 pl-3 sm:pl-4 pr-1.5 py-1">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors shrink-0" />
                <input
                  type="text"
                  placeholder="Enter any topic or question (e.g. What is ML, Why do people procrastinate)..."
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none py-2"
                />
                <button
                  type="submit"
                  className="shrink-0 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl creator-gradient-bg text-white font-bold text-xs sm:text-sm tracking-wide shadow-sm hover:shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  <span>Research</span>
                  <ArrowRight className="w-4 h-4 hidden sm:inline" />
                </button>
              </div>
            </div>
          </form>

          {/* Quick Creator Topic Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Popular:
            </span>
            {SUGGESTED_TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleQuickTopic(t)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 bg-white border border-slate-200/80 hover:border-rose-300 hover:text-slate-900 hover:shadow-xs transition-all"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Core Deliverables (Key Facts • Content Angles • Useful Sources) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in-up">
          {/* Card 1: Key Facts */}
          <div className="creator-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  01
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Data & Stats
                </span>
              </div>
              <h3 className="font-extrabold text-xl text-slate-900 mb-2">
                Key Facts
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Verified, bite-sized factual bullet points with metric badges and source citations. Perfect for speaking on camera or putting in carousel slides.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 font-medium">
              ✦ Definitions • Foundations • Empirical Metrics • Citations
            </div>
          </div>

          {/* Card 2: Content Angles */}
          <div className="creator-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-9 h-9 rounded-xl creator-gradient-bg text-white flex items-center justify-center font-bold text-sm">
                  02
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60">
                  Hooks & Viral Angles
                </span>
              </div>
              <h3 className="font-extrabold text-xl text-slate-900 mb-2">
                Content Angles
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Ready-to-use hooks and perspectives (Myth vs Fact, Beginner, Authority Challenge, Storytelling) designed to stop the scroll and drive saves.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-[11px] text-rose-800 font-medium">
              ✦ Spoken Hooks • Contrarian Views • Save Triggers • Mental Models
            </div>
          </div>

          {/* Card 3: Useful Sources */}
          <div className="creator-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  03
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verified Links
                </span>
              </div>
              <h3 className="font-extrabold text-xl text-slate-900 mb-2">
                Useful Sources
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Real external publications with verified links—including live Wikipedia pages, CrossRef peer-reviewed scientific papers, and Google Scholar indexes.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px] text-emerald-800 font-medium">
              ✦ 1-Click External Links • Academic DOIs • Publisher Metadata
            </div>
          </div>
        </div>

        {/* Creator Superpower Banner */}
        <div className="w-full mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> Built For Creator Speed
            </div>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              One-Click "Copy for Script"
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              Instantly compile your research into a ready-to-record video script outline with hook, facts, angle, and citations. Paste straight into Notion or your teleprompter.
            </p>
          </div>
          <Link
            href="/research"
            className="shrink-0 px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2"
          >
            <span>Start Quick Research</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
