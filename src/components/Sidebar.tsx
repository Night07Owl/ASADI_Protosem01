"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Sparkles,
  Lightbulb,
  Bookmark,
  History,
  Settings,
  Plus,
  Zap,
  ArrowRight,
  Bot,
  Activity
} from 'lucide-react';

const navItems = [
  { name: 'Research Studio', href: '/research', icon: Search, badge: 'Live' },
  { name: 'AI Studio', href: '/agents', icon: Bot, badge: 'AI' },
  { name: 'LangSmith Traces', href: '/traceability', icon: Activity, badge: 'Live' },
  { name: 'Content Ideas', href: '/ideas', icon: Lightbulb, badge: null },
  { name: 'Saved Research', href: '/saved', icon: Bookmark, badge: null },
  { name: 'Recent Searches', href: '/history', icon: History, badge: null },
  { name: 'Settings', href: '/settings', icon: Settings, badge: null },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 pt-5 pb-5 px-4 z-40 bg-white/90 backdrop-blur-xl border-r border-slate-200/90 shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <Link href="/research" className="flex items-center gap-3 px-2 mb-6 group">
        <div className="w-10 h-10 rounded-2xl creator-gradient-bg p-0.5 shadow-sm group-hover:scale-105 transition-transform duration-200">
          <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-rose-600">
            <Zap className="w-5 h-5 fill-rose-500 text-rose-500" />
          </div>
        </div>
        <div>
          <span className="font-extrabold text-base text-slate-900 tracking-tight block leading-tight">
            Topic Intel
          </span>
          <span className="text-[11px] font-semibold text-slate-400 block tracking-normal">
            For Content Creators
          </span>
        </div>
      </Link>

      {/* New Research Quick Button */}
      <Link
        href="/research"
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl creator-gradient-bg text-white font-bold text-xs tracking-wide shadow-sm hover:shadow-md hover:opacity-95 active:scale-[0.98] transition-all mb-6"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>New Research</span>
      </Link>

      {/* Navigation Label */}
      <div className="px-2 mb-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Workspace
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/research' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Creator Tip & AI Assistant Card */}
      <div className="pt-3 border-t border-slate-200/80 space-y-2">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/5 via-rose-500/5 to-purple-500/5 border border-slate-200/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-rose-500" />
              AI Co-Pilot
            </span>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Multi-agent research intelligence for hooks, scripts, and verified facts.
          </p>
        </div>
      </div>
    </aside>
  );
}
