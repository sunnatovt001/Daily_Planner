import { useState } from 'react';
import { usePlanner } from '../utils/PlannerContext';
import { getTodayDateString } from '../utils/dateUtils';
import { Check, Flame, Plus, Trophy, Trash2 } from 'lucide-react';
import { Habit } from '../types';
import { sounds } from '../utils/audio';

export default function HabitsView() {
  const { habits, setHabits } = usePlanner();
  const todayStr = getTodayDateString();
  const [isAddMode, setIsAddMode] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('⭐');

  const icons = ['⭐', '💧', '📚', '🚶‍♂️', '🏃‍♂️', '🧘‍♀️', '🍎', '💻', '📝', '💪'];

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        const isCompletedToday = (h.completedDates || []).includes(todayStr);
        let newDates;
        let streak = h.currentStreak || 0;
        
        if (isCompletedToday) {
          newDates = (h.completedDates || []).filter(d => d !== todayStr);
          streak = Math.max(0, streak - 1);
        } else {
          newDates = [...(h.completedDates || []), todayStr];
          streak += 1;
          sounds.playCompleteSound();
        }
        
        return {
          ...h,
          completedDates: newDates,
          currentStreak: streak,
          bestStreak: Math.max(h.bestStreak || 0, streak)
        };
      }
      return h;
    }));
  };

  const deleteHabit = (id: string) => {
    if (confirm("Bu odatni o'chirmoqchimisiz?")) {
      setHabits(habits.filter(h => h.id !== id));
    }
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    
    setHabits([...habits, {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      icon: newHabitIcon,
      frequency: ['daily'],
      completedDates: [],
      currentStreak: 0,
      bestStreak: 0,
      createdAt: Date.now()
    }]);
    
    setNewHabitName('');
    setIsAddMode(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Odatlar</h1>
          <p className="text-stone-500 mt-1">Yaxshi odatlarni shakllantiring</p>
        </div>
        <button 
          onClick={() => setIsAddMode(!isAddMode)}
          className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {isAddMode ? 'Yopish' : <><Plus size={16} /> Yangi odat</>}
        </button>
      </header>

      {isAddMode && (
        <form onSubmit={addHabit} className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm mb-8 animate-in slide-in-from-top-4">
          <h3 className="text-lg font-bold mb-4">Yangi odat yaratish</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 p-2 bg-stone-50 dark:bg-stone-950 rounded-xl overflow-x-auto border border-stone-200 dark:border-stone-800">
              {icons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setNewHabitIcon(icon)}
                  className={`w-10 h-10 flex-shrink-0 rounded-lg text-xl transition-colors ${newHabitIcon === icon ? 'bg-stone-200 dark:bg-stone-800 border-2 border-stone-900 dark:border-white' : 'hover:bg-stone-200 dark:hover:bg-stone-800 border-2 border-transparent'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="Odat nomi (masalan: Ertalabki yugurish)"
              value={newHabitName}
              onChange={e => setNewHabitName(e.target.value)}
              className="flex-1 bg-transparent border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2 outline-none focus:border-stone-900 dark:focus:border-white focus:ring-1 focus:ring-stone-900 dark:focus:ring-white transition-shadow"
              autoFocus
            />
            <button type="submit" disabled={!newHabitName.trim()} className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:opacity-90 disabled:opacity-50 px-6 py-2 rounded-xl font-medium transition-opacity">
              Saqlash
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map(habit => {
          const isCompletedToday = (habit.completedDates || []).includes(todayStr);
          
          return (
            <div key={habit.id} className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm relative group overflow-hidden">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => deleteHabit(habit.id)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white p-1 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4 border border-stone-200 dark:border-stone-700 transition-transform ${isCompletedToday ? 'bg-stone-100 dark:bg-stone-800 scale-110' : 'bg-transparent'}`}>
                  {habit.icon}
                </div>
                <h3 className="text-lg font-bold mb-1">{habit.name}</h3>
                
                <div className="flex gap-8 mt-4 w-full justify-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1.5 text-stone-500 mb-1">
                      <Flame size={14} className={(habit.currentStreak || 0) > 0 ? "text-stone-900 dark:text-white" : "text-stone-400"} />
                      <span className="text-xs font-semibold uppercase tracking-wider">Ketma-ket</span>
                    </div>
                    <span className="text-lg font-bold">{habit.currentStreak || 0}</span>
                  </div>
                  <div className="w-px bg-stone-200 dark:bg-stone-800"></div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1.5 text-stone-500 mb-1">
                      <Trophy size={14} className="text-stone-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Rekord</span>
                    </div>
                    <span className="text-lg font-bold">{habit.bestStreak || 0}</span>
                  </div>
                </div>

                <button 
                  onClick={() => toggleHabit(habit.id)}
                  className={`mt-6 w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    isCompletedToday 
                      ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900' 
                      : 'bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {isCompletedToday ? (
                    <><Check size={18} /> Bajarildi</>
                  ) : (
                    'Bugun bajarish'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {habits.length === 0 && !isAddMode && (
        <div className="text-center py-20 bg-transparent rounded-2xl border border-stone-200 dark:border-stone-800 border-dashed">
          <Flame size={40} className="mx-auto text-stone-300 dark:text-stone-700 mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-bold mb-1">Odatlar yo'q</h3>
          <p className="text-sm text-stone-500">Yangi foydali odatlarni qo'shing va ularni kuzatib boring.</p>
        </div>
      )}
    </div>
  );
}
