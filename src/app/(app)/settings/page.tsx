"use client";

import { useState, useEffect } from 'react';
import { Key, Globe, Sparkles, Check, Settings, Shield } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function SettingsPage() {
  const { showToast } = useToast();

  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [enginePreference, setEnginePreference] = useState<"auto" | "web" | "gemini">("auto");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('gemini_api_key') || '';
      setGeminiApiKey(savedKey);
      const savedEngine = (localStorage.getItem('search_engine_pref') as any) || 'auto';
      setEnginePreference(savedEngine);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', geminiApiKey.trim());
      localStorage.setItem('search_engine_pref', enginePreference);
      showToast("Settings saved successfully");
    }
  };

  return (
    <div className="animate-fade-in-up max-w-3xl pb-16 mx-auto px-2 sm:px-4 py-4">
      <header className="mb-6 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-rose-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Settings & AI Configuration
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure search retrieval preferences and optional AI grounding.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Search Engine Mode */}
        <section className="creator-card p-6">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
            <Globe className="w-5 h-5 text-rose-500" />
            <h2 className="font-extrabold text-lg text-slate-900">Search & Retrieval Engine</h2>
          </div>

          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Topic Intel automatically connects to live Wikipedia knowledge and CrossRef peer-reviewed scientific papers for all queries with zero setup.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div
                onClick={() => setEnginePreference("auto")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  enginePreference === "auto"
                    ? "bg-rose-50/40 border-rose-400 ring-2 ring-rose-500/10 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-slate-900">Auto (Recommended)</h4>
                  {enginePreference === "auto" && <Check className="w-4 h-4 text-rose-600" />}
                </div>
                <p className="text-xs text-slate-500">
                  Instant Wikipedia & CrossRef search. If an AI key is set, enables Google AI search grounding.
                </p>
              </div>

              <div
                onClick={() => setEnginePreference("web")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  enginePreference === "web"
                    ? "bg-rose-50/40 border-rose-400 ring-2 ring-rose-500/10 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-slate-900">Pure Web & CrossRef</h4>
                  {enginePreference === "web" && <Check className="w-4 h-4 text-rose-600" />}
                </div>
                <p className="text-xs text-slate-500">
                  Direct Wikipedia & CrossRef extraction only. 100% free forever, zero API keys required.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Optional Gemini AI Key */}
        <section className="creator-card p-6">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
            <Key className="w-5 h-5 text-amber-500" />
            <h2 className="font-extrabold text-lg text-slate-900">Gemini AI Key (Optional)</h2>
          </div>

          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Add your Google Gemini API key to enable live Google Search Grounding with Gemini 2.5 Flash for customized reasoning.
            </p>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl creator-gradient-bg text-white font-bold text-xs tracking-wide shadow-sm hover:opacity-95 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
