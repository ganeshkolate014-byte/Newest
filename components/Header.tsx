
import React, { memo } from 'react';
import { BellRing } from 'lucide-react';

export const Header: React.FC = memo(() => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <header className="flex justify-between items-center mb-6 z-50 relative px-1 flex-shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full liquid-glass p-[1px] shadow-sm flex items-center justify-center">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=000000" alt="Profile" className="w-full h-full rounded-full object-cover opacity-90" />
            </div>
            <div className="flex flex-col justify-center">
                <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Today</span>
                <h1 className="text-[13px] font-bold text-white/90 uppercase tracking-widest leading-none">{today}</h1>
            </div>
        </div>
        <button className="w-11 h-11 rounded-full liquid-glass flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95">
            <BellRing size={20} />
        </button>
    </header>
  );
});
