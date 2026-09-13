import React from 'react';
import { usePlanner } from '../utils/PlannerContext';
import { CloudCheck, Cloud } from 'lucide-react';

export default function UserProfileWidget() {
  const { isSynced } = usePlanner();

  return (
    <div className="glass-card p-2.5 rounded-2xl border border-white/10 flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        {isSynced ? (
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <CloudCheck size={15} />
            <span>Firebase: Auto-Save Faol</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
            <Cloud size={15} />
            <span>Bog'lanmoqda...</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] text-stone-400 font-medium">Jonli</span>
      </div>
    </div>
  );
}

