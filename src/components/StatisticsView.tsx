import { useMemo } from 'react';
import { usePlanner } from '../utils/PlannerContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function StatisticsView() {
  const { tasks, habits } = usePlanner();

  // Task Category Stats
  const categoryData = useMemo(() => {
    const categories = {
      ish: { name: 'Ish', count: 0, color: '#3b82f6' },
      oqish: { name: 'O\'qish', count: 0, color: '#a855f7' },
      shaxsiy: { name: 'Shaxsiy', count: 0, color: '#10b981' },
      salomatlik: { name: 'Salomatlik', count: 0, color: '#f43f5e' },
      moliya: { name: 'Moliya', count: 0, color: '#f59e0b' },
      boshqa: { name: 'Boshqa', count: 0, color: '#78716c' },
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
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500 space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Statistika</h1>
        <p className="text-stone-500 mt-1">Sizning mahsuldorlik ko'rsatkichlaringiz</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm text-center">
          <p className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Bajarilgan vazifalar</p>
          <p className="text-4xl font-black text-stone-900 dark:text-white">{totalCompleted}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm text-center">
          <p className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Mahsuldorlik</p>
          <p className="text-4xl font-black text-stone-900 dark:text-white">{completionRate}%</p>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm text-center">
          <p className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Faol odatlar</p>
          <p className="text-4xl font-black text-stone-900 dark:text-white">{habits.filter(h => (h.currentStreak || 0) > 0).length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
        <h3 className="text-lg font-bold mb-6">Toifalar bo'yicha bajarilgan vazifalar</h3>
        
        {categoryData.length === 0 ? (
          <div className="text-center py-10 text-stone-500">
            Hozircha ma'lumotlar yo'q
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#78716c' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c' }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
