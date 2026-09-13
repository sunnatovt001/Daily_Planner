import { useMemo } from 'react';
import { usePlanner } from '../utils/PlannerContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function StatisticsView() {
  const { tasks, habits } = usePlanner();

  // Task Category Stats
  const categoryData = useMemo(() => {
    const categories: Record<string, { name: string, count: number, color: string }> = {
      work: { name: 'Work', count: 0, color: '#3b82f6' },
      study: { name: 'Study', count: 0, color: '#a855f7' },
      personal: { name: 'Personal', count: 0, color: '#10b981' },
      health: { name: 'Health', count: 0, color: '#f43f5e' },
      finance: { name: 'Finance', count: 0, color: '#f59e0b' },
      other: { name: 'Other', count: 0, color: '#78716c' },
    };

    tasks.forEach(t => {
      if (t.completed && categories[t.category]) {
        categories[t.category].count += 1;
      }
    });

    return Object.values(categories).filter(c => c.count > 0);
  }, [tasks]);

  const totalCompleted = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6 md:space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Statistics</h1>
        <p className="text-stone-400 mt-0.5 text-sm">Your productivity metrics & trends</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-card rounded-2xl p-5 md:p-6 text-center shadow-lg border border-white/10">
          <p className="text-[10px] uppercase tracking-wider text-stone-400 font-extrabold mb-1 md:mb-2">Completed Tasks</p>
          <p className="text-3xl md:text-4xl font-black text-white">{totalCompleted}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 md:p-6 text-center shadow-lg border border-white/10">
          <p className="text-[10px] uppercase tracking-wider text-stone-400 font-extrabold mb-1 md:mb-2">Completion Rate</p>
          <p className="text-3xl md:text-4xl font-black text-white">{completionRate}%</p>
        </div>
        <div className="glass-card rounded-2xl p-5 md:p-6 text-center shadow-lg border border-white/10">
          <p className="text-[10px] uppercase tracking-wider text-stone-400 font-extrabold mb-1 md:mb-2">Active Habits</p>
          <p className="text-3xl md:text-4xl font-black text-white">{habits.filter(h => (h.currentStreak || 0) > 0).length}</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 md:p-6 shadow-xl border border-white/10">
        <h3 className="text-base md:text-lg font-bold mb-6 text-white">Completed Tasks by Category</h3>
        
        {categoryData.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-sm">
            No data yet
          </div>
        ) : (
          <div className="h-64 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(9, 9, 11, 0.9)', color: '#fff', backdropFilter: 'blur(16px)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
