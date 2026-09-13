import { useState, FormEvent } from 'react';
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
    if (confirm("Are you sure you want to delete this habit?")) {
      setHabits(habits.filter(h => h.id !== id));
    }
  };

  const addHabit = (e: FormEvent) => {
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Habits</h1>
          <p className="text-stone-400 mt-0.5 text-sm">Build good habits & track progress</p>
        </div>
        <button 
          onClick={() => setIsAddMode(!isAddMode)}
          className="flex items-center justify-center gap-2 glass-button-primary px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
        >
          {isAddMode ? 'Close' : <><Plus size={16} /> New habit</>}
        </button>
      </header>

      {isAddMode && (
        <form onSubmit={addHabit} className="glass-card p-5 md:p-6 rounded-2xl shadow-xl mb-6 md:mb-8 animate-in slide-in-from-top-4 border border-white/10">
          <h3 className="text-lg font-bold mb-4 text-white">Create new habit</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 p-2 glass-pill rounded-xl overflow-x-auto">
              {icons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setNewHabitIcon(icon)}
                  className={`w-10 h-10 flex-shrink-0 rounded-xl text-xl transition-all ${newHabitIcon === icon ? 'bg-white text-stone-950 shadow-md scale-105' : 'hover:bg-white/10'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="Habit name (e.g. Morning run)"
              value={newHabitName}
              onChange={e => setNewHabitName(e.target.value)}
              className="flex-1 glass-input rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-white transition-all text-white placeholder:text-stone-500"
              autoFocus
            />
            <button type="submit" disabled={!newHabitName.trim()} className="glass-button-primary disabled:opacity-50 px-6 py-2.5 rounded-xl font-bold text-sm transition-opacity shadow-sm">
              Save
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {habits.map(habit => {
          const isCompletedToday = (habit.completedDates || []).includes(todayStr);
          
          return (
            <div key={habit.id} className="glass-card rounded-2xl p-5 md:p-6 shadow-sm relative group overflow-hidden transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute top-4 right-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => deleteHabit(habit.id)} className="text-stone-400 hover:text-red-400 p-1.5 rounded-xl hover:bg-red-500/10 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3.5 glass-pill transition-all duration-300 ${isCompletedToday ? 'scale-110 shadow-lg ring-2 ring-white' : ''}`}>
                  {habit.icon}
                </div>
                <h3 className="text-base md:text-lg font-bold mb-1 truncate max-w-full text-white">{habit.name}</h3>
                
                <div className="flex gap-6 md:gap-8 mt-4 w-full justify-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1.5 text-stone-400 mb-0.5">
                      <Flame size={14} className={(habit.currentStreak || 0) > 0 ? "text-amber-400" : "text-stone-500"} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Streak</span>
                    </div>
                    <span className="text-base md:text-lg font-black text-white">{habit.currentStreak || 0}</span>
                  </div>
                  <div className="w-px bg-white/10"></div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1.5 text-stone-400 mb-0.5">
                      <Trophy size={14} className="text-amber-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Best</span>
                    </div>
                    <span className="text-base md:text-lg font-black text-white">{habit.bestStreak || 0}</span>
                  </div>
                </div>

                <button 
                  onClick={() => toggleHabit(habit.id)}
                  className={`mt-5 w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${
                    isCompletedToday 
                      ? 'bg-white text-stone-950 shadow-md shadow-white/10' 
                      : 'glass-pill text-stone-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {isCompletedToday ? (
                    <><Check size={18} /> Completed</>
                  ) : (
                    'Complete Today'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {habits.length === 0 && !isAddMode && (
        <div className="text-center py-16 md:py-20 glass-card rounded-2xl border-dashed">
          <Flame size={40} className="mx-auto text-stone-600 mb-3" strokeWidth={1.5} />
          <h3 className="text-lg font-bold mb-1 text-white">No habits</h3>
          <p className="text-sm text-stone-400">Add new good habits and track them.</p>
        </div>
      )}
    </div>
  );
}
