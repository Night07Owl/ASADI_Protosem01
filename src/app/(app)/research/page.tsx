"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bookmark,
  Share2,
  Download,
  Copy,
  Search,
  ExternalLink,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileText,
  Zap,
  Lightbulb,
  Key,
  Globe,
  BookOpen,
  Layers,
  Check,
  CheckCircle2,
  ArrowRight,
  Flame,
  BookmarkCheck,
  Video,
  Clapperboard,
  Bot,
  ShieldCheck,
  MessageSquare,
  Activity
} from 'lucide-react';
import { researchTopic, saveResearch } from '@/services/researchService';
import { ResearchResult } from '@/types/research';
import { useToast } from '@/context/ToastContext';
import AIAssistantChat from '@/components/AIAssistantChat';

const QUICK_TOPICS = [
  "What is ML",
  "How does photosynthesis work",
  "Why do people procrastinate",
  "What is quantum computing",
  "CRISPR gene editing",
  "Index fund investing for beginners",
  "Creatine & muscle growth"
];

function ResearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTopic = searchParams.get('topic') || "What is ML";

  const { showToast } = useToast();
  const [topic, setTopic] = useState(initialTopic);
  const [searchInput, setSearchInput] = useState(initialTopic);
  const [data, setData] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  // AI Assistant Chat Widget state
  const [showChat, setShowChat] = useState(false);

  // Settings modal for optional Gemini API key
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Active view filter tab: 'all' | 'facts' | 'angles' | 'sources'
  const [activeTab, setActiveTab] = useState<'all' | 'facts' | 'angles' | 'sources'>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gemini_api_key') || '';
      setApiKeyInput(saved);
    }
  }, []);

  const fetchResearch = async (targetTopic: string) => {
    setLoading(true);
    setError(null);
    setIsSaved(false);

    try {
      const result = await researchTopic(targetTopic);
      setData(result);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError("Unable to search this topic right now. Please try again with another query.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearch(topic);
  }, [topic]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTopic(searchInput.trim());
      router.push(`/research?topic=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleQuickTopicClick = (newTopic: string) => {
    setSearchInput(newTopic);
    setTopic(newTopic);
    router.push(`/research?topic=${encodeURIComponent(newTopic)}`);
  };

  const copyWithFeedback = (text: string, id: string | number, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(label);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const handleCopyScript = () => {
    if (!data) return;
    const bestAngle = data.angles[0];
    const topFacts = data.facts.slice(0, 3);
    const scriptText = `🎬 SCRIPT OUTLINE: ${data.topic}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎣 HOOK (0:00 - 0:03):
"${bestAngle?.hook || `Here are 3 facts about ${data.topic} you probably didn't know:`}"

💡 INTRO (0:03 - 0:10):
"Most people misunderstand ${data.topic}. Here is the exact breakdown in 45 seconds:"

📊 CORE FACTS (0:10 - 0:35):
${topFacts.map((f, i) => `Point ${i + 1} [${f.dataMetric || 'Key Metric'}]:
"${f.fact}"
→ Context: ${f.why}`).join('\n\n')}

🎯 KEY TAKEAWAY (0:35 - 0:45):
"Angle to remember: ${bestAngle?.angle || 'The Core Rule'}. ${bestAngle?.desc || ''}"

📚 PRIMARY SOURCE:
${data.sources[0]?.title || 'Academic literature'} (${data.sources[0]?.publisher || 'Verified'})

💬 CTA (Call To Action):
"Save this post for reference, and comment below what topic you want broken down next!"
`;
    navigator.clipboard.writeText(scriptText);
    showToast("⚡ Script outline copied! Paste into Notion or Teleprompter.");
  };

  const handleSave = async () => {
    if (data) {
      await saveResearch(data);
      setIsSaved(true);
      showToast("Saved to your research library");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Research link copied to clipboard");
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', apiKeyInput.trim());
      setShowKeyModal(false);
      showToast("API Key updated. Refreshing research...");
      fetchResearch(topic);
    }
  };

  const handleExport = () => {
    if (!data) return;
    const exportContent = `# ${data.topic} — Creator Research Dossier
Topic: ${data.topic}
Inquiry: ${data.questionInquiry || data.topic}
Niche: ${data.niche}
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

## Summary
${data.summary}

## Key Takeaways
${data.takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}

---

## 📌 Key Facts (${data.facts.length})
${data.facts.map((f, i) => `### Fact ${i + 1} [${f.dataMetric || 'Verified'}]
- Fact: ${f.fact}
- Why it matters: ${f.why}
- Citation: ${f.source}`).join('\n\n')}

---

## 💡 Content Angles & Viral Hooks (${data.angles.length})
${data.angles.map((a, i) => `### Angle ${i + 1}: ${a.angle}
- Perspective: ${a.desc}
- Ready-to-Read Hook: "${a.hook}"
- Value Trigger: ${a.saveTrigger}`).join('\n\n')}

---

## 📚 Useful Sources (${data.sources.length})
${data.sources.map((s, i) => `### Source ${i + 1}: ${s.title}
- Publisher: ${s.publisher} ${s.date ? `(${s.date})` : ''} [${s.type}]
- Summary: ${s.desc}
- Link: ${s.url}`).join('\n\n')}
`;

    const blob = new Blob([exportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-research.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported as Markdown");
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4 animate-fade-in-up">
      {/* ============================================================== */}
      {/* CREATOR SEARCH BAR & QUICK TOPICS                              */}
      {/* ============================================================== */}
      <section className="mb-5">
        <form onSubmit={handleSearchSubmit} className="relative group mb-3">
          <div className="creator-dock rounded-2xl p-1.5 transition-all duration-200 focus-within:ring-4 focus-within:ring-rose-500/10 focus-within:border-rose-400">
            <div className="flex items-center gap-2 pl-3 sm:pl-4 pr-1.5 py-1">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter any topic or question (e.g. What is ML, Photosynthesis, Why do people procrastinate)..."
                className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none py-1.5 font-sans"
              />
              <button
                type="submit"
                className="shrink-0 px-5 sm:px-6 py-2.5 rounded-xl creator-gradient-bg text-white font-bold text-xs sm:text-sm tracking-wide shadow-sm hover:shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center gap-1.5"
              >
                <span>Research</span>
                <ArrowRight className="w-4 h-4 hidden sm:inline" />
              </button>
            </div>
          </div>
        </form>

        {/* Popular Creator Topics */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Popular:
          </span>
          {QUICK_TOPICS.map((t) => {
            const isSelected = t.toLowerCase() === topic.toLowerCase();
            return (
              <button
                key={t}
                type="button"
                onClick={() => handleQuickTopicClick(t)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'creator-gradient-bg text-white shadow-xs font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>


      {/* ============================================================== */}
      {/* LOADING STATE                                                  */}
      {/* ============================================================== */}
      {loading && (
        <div className="creator-card p-12 text-center my-6 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl creator-gradient-bg p-0.5 animate-spin mb-4 shadow-sm">
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-rose-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            Researching "{topic}"...
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Synthesizing key facts, creator hooks, and verified citations.
          </p>
        </div>
      )}

      {/* ============================================================== */}
      {/* ERROR STATE                                                    */}
      {/* ============================================================== */}
      {!loading && (error || !data) && (
        <div className="creator-card p-8 text-center my-6 border-rose-200 bg-rose-50/30">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            Research Interrupted
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-4 max-w-md mx-auto">
            {error || "Could not retrieve results for this query."}
          </p>
          <button
            onClick={() => fetchResearch(topic)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* MAIN RESEARCH RESULTS                                          */}
      {/* ============================================================== */}
      {!loading && data && (
        <div className="space-y-6">
          {/* ------------------------------------------------------------ */}
          {/* HEADER SUMMARY CARD & INSTANT SCRIPT TOOLBAR                 */}
          {/* ------------------------------------------------------------ */}
          <div className="creator-card p-6 sm:p-7 relative overflow-hidden">
            {/* Top row: Niche badge, Source indicator, and Creator Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900 text-white">
                  {data.niche}
                </span>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Verified Research
                </span>
              </div>

              {/* Creator Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {/* ⚡ 1-Click Copy for Script */}
                <button
                  onClick={handleCopyScript}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl creator-gradient-bg text-white text-xs font-bold shadow-xs hover:shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
                  title="Copy formatted outline with hook, facts, and sources ready for Notion or Teleprompter"
                >
                  <Clapperboard className="w-3.5 h-3.5" />
                  <span>Copy for Script</span>
                </button>

                {/* ✨ Ask AI Assistant */}
                <button
                  onClick={() => setShowChat(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer"
                  title="Open AI Research Co-Pilot"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>Ask AI</span>
                </button>

                {/* ⚡ LangSmith Traces */}
                <Link
                  href="/traceability"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50 transition-all"
                  title="View LangSmith Multi-Agent Traces"
                >
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  <span>Traces</span>
                </Link>

                {/* Save button */}
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isSaved
                      ? 'bg-rose-50 text-rose-600 border-rose-200 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="Save to Library"
                >
                  {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-rose-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                {/* Share link */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50 transition-all"
                  title="Share link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>

                {/* Export Markdown */}
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50 transition-all"
                  title="Export Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>

                {/* AI Key settings */}
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="API Key Settings"
                >
                  <Key className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Title & Inquiry */}
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-1.5">
                {data.topic}
              </h1>
              {data.questionInquiry && data.questionInquiry !== data.topic && (
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Inquiry: <span className="text-slate-700 font-semibold">"{data.questionInquiry}"</span></span>
                </div>
              )}
            </div>

            {/* Core Summary */}
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6">
              {data.summary}
            </p>

            {/* 3 Core Takeaways */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2.5">
                Quick Takeaways For Your Audience
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {data.takeaways.map((takeaway, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700 font-medium leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* TAB BAR SELECTOR                                             */}
          {/* ------------------------------------------------------------ */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl max-w-lg mx-auto border border-slate-200/80">
            {[
              { id: 'all', label: 'All Sections' },
              { id: 'facts', label: `Key Facts (${data.facts.length})` },
              { id: 'angles', label: `Angles & Hooks (${data.angles.length})` },
              { id: 'sources', label: `Sources (${data.sources.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ============================================================== */}
          {/* SECTION 1: KEY FACTS (Data & Bullet Points)                    */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'facts') && (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Key Facts
                    <span className="text-xs font-normal text-slate-500">({data.facts.length} verified points)</span>
                  </h2>
                </div>

                <button
                  onClick={() => {
                    const text = data.facts.map((f, i) => `${i + 1}. [${f.dataMetric || 'Fact'}] ${f.fact}\nWhy it matters: ${f.why}\nSource: ${f.source}`).join('\n\n');
                    copyWithFeedback(text, 'all-facts', "All facts copied to clipboard");
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  {copiedId === 'all-facts' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy All Facts</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {data.facts.map((fact, index) => {
                  const factId = fact.id || index;
                  const isCopied = copiedId === factId;

                  return (
                    <div
                      key={factId}
                      className="creator-card p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                            {fact.dataMetric || `Fact 0${index + 1}`}
                          </span>

                          <button
                            onClick={() => copyWithFeedback(`${fact.fact} (${fact.source})`, factId, "Fact copied")}
                            className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Copy fact"
                          >
                            {isCopied ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Copied
                              </span>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug mb-3">
                          {fact.fact}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
                        <span className="font-bold text-slate-500 block mb-0.5 text-[10px] uppercase tracking-wider">
                          Why It Matters:
                        </span>
                        <p className="text-slate-600 leading-relaxed mb-2">
                          {fact.why}
                        </p>
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <div className="text-slate-400 font-medium truncate">
                            Source: <span className="text-slate-600 font-semibold">{fact.source}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ============================================================== */}
          {/* SECTION 2: CONTENT ANGLES & HOOKS (For Reels/Carousels/Posts) */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'angles') && (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Content Angles & Spoken Hooks
                    <span className="text-xs font-normal text-slate-500">({data.angles.length} angles)</span>
                  </h2>
                </div>

                <button
                  onClick={() => {
                    const text = data.angles.map((a, i) => `Angle ${i + 1}: ${a.angle}\nHook: "${a.hook}"\nPerspective: ${a.desc}\nSave Trigger: ${a.saveTrigger}`).join('\n\n');
                    copyWithFeedback(text, 'all-angles', "All hooks copied to clipboard");
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  {copiedId === 'all-angles' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-rose-500" />
                      <span>Copy All Hooks</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {data.angles.map((angle, index) => {
                  const angleId = angle.id || `angle_${index}`;
                  const isCopied = copiedId === angleId;

                  return (
                    <div
                      key={angleId}
                      className="creator-card p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                            {angle.angle}
                          </span>
                          <button
                            onClick={() => copyWithFeedback(`"${angle.hook}"`, angleId, "Hook copied")}
                            className="text-xs font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Copy spoken hook"
                          >
                            {isCopied ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Copied
                              </span>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Spoken Hook Box */}
                        <div className="p-3 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border-l-2 border-rose-500 rounded-r-xl mb-3">
                          <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                            Spoken Video Hook
                          </span>
                          <p className="text-xs font-bold text-slate-900 leading-snug">
                            "{angle.hook}"
                          </p>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                          {angle.desc}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Value Trigger:</span>
                        <span className="font-semibold text-slate-700 text-right truncate ml-2">
                          {angle.saveTrigger}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ============================================================== */}
          {/* SECTION 3: USEFUL SOURCES (Wikipedia & Peer-Reviewed DOIs)      */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'sources') && (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Useful Sources & Verified Citations
                    <span className="text-xs font-normal text-slate-500">({data.sources.length} sources)</span>
                  </h2>
                </div>

                <button
                  onClick={() => {
                    const text = data.sources.map((s, i) => `${i + 1}. ${s.title} — ${s.publisher} (${s.date || '2026'})\nURL: ${s.url}`).join('\n\n');
                    copyWithFeedback(text, 'all-sources', "All citations copied to clipboard");
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  {copiedId === 'all-sources' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copy All Citations</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {data.sources.map((source, index) => {
                  const sourceId = source.id || `source_${index}`;
                  const isCopied = copiedId === sourceId;

                  return (
                    <div
                      key={sourceId}
                      className="creator-card p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {source.type}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold font-mono">
                            {source.date}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-slate-900 mb-1 leading-snug">
                          {source.title}
                        </h4>
                        <p className="text-xs text-slate-500 mb-2 font-medium">
                          Publisher: <span className="text-slate-800 font-bold">{source.publisher}</span>
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                          {source.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 hover:underline"
                        >
                          Open Source <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => copyWithFeedback(`${source.title} — ${source.publisher} (${source.date || '2026'})\n${source.url}`, sourceId, "Citation copied")}
                          className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1"
                        >
                          {isCopied ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Copied
                            </span>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy Link
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* AI ASSISTANT CHAT POPUP (Pinned Input, Zero Scrolling Friction) */}
      {/* ============================================================== */}
      <AIAssistantChat
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        currentTopic={topic}
        topicSummary={data?.summary}
      />

      {/* Persistent Floating AI Assistant Trigger (Bottom Right) */}
      {!showChat && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            onClick={() => setShowChat(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-full creator-gradient-bg text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/40 group"
            title="Open AI Assistant"
          >
            <Sparkles className="w-4 h-4 fill-white/20 group-hover:rotate-12 transition-transform" />
            <span>Ask AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* OPTIONAL GEMINI API KEY MODAL                                  */}
      {/* ============================================================== */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="creator-card p-6 sm:p-7 max-w-md w-full shadow-2xl animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl creator-gradient-bg p-0.5 flex items-center justify-center text-white">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">AI Search Grounding</h3>
                <p className="text-xs text-slate-500">Optional Google Gemini API Key</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Topic Intel automatically connects to live Wikipedia and CrossRef APIs for 100% free web search. You can optionally add a Gemini API key to enable Google AI search grounding for the LangChain agent squad.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold creator-gradient-bg text-white hover:opacity-95 transition-all shadow-sm"
                >
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResearchWorkspacePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-3 border-slate-200 border-t-rose-500 animate-spin" />
      </div>
    }>
      <ResearchContent />
    </Suspense>
  );
}
