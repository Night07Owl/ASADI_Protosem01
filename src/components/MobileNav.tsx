"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bot, Lightbulb, Bookmark, History, Settings } from 'lucide-react';

const mobileNavItems = [
  { name: 'Research', href: '/research', icon: Search },
  { name: 'Agents', href: '/agents', icon: Bot },
  { name: 'Ideas', href: '/ideas', icon: Lightbulb },
  { name: 'Saved', href: '/saved', icon: Bookmark },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full backdrop-blur-xl bg-white/90 border-t border-slate-200/90 flex justify-around items-center py-2 px-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/research' && pathname.startsWith(item.href));
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              isActive ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-rose-50 text-rose-600' : ''}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
