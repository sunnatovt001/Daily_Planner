import { useMemo, useState } from 'react';
import { usePlanner } from '../utils/PlannerContext';
import { getTodayDateString, getGreeting, getDayOfWeek, formatDateDisplay } from '../utils/dateUtils';
import { CheckCircle2, Circle, Star, ArrowRight, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import ReviewModal from './ReviewModal';

interface DashboardProps {
  onQuickAdd: () => void;
}

export default function Dashboard({ onQuickAdd }: DashboardProps) {
  const { tasks, setTasks, timeBlocks } = usePlanner();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const todayStr = getTodayDateString();
  
  const todayTasks = useMemo(() => tasks.filter(t => t.date === todayStr), [tasks, todayStr]);
  const completedTasks = useMemo(() => todayTasks.filter(t => t.completed), [todayTasks]);
  const topPriorities = useMemo(() => todayTasks.filter(t => t.isTopPriority), [todayTasks]);
  
  const completionPercentage = todayTasks.length > 0 
    ? Math.round((completedTasks.length / todayTasks.length) * 100) 
    : 0;

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const newlyCompleted = !t.completed;
        if (newlyCompleted) {
          sounds.playCompleteSound();
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }
        return { ...t, completed: newlyCompleted };
      }
      return t;
    }));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500 space-y-8">
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-stone-500 dark:text-stone-400 font-medium tracking-wide text-sm mb-1 uppercase">
            {getDayOfWeek(todayStr)}, {formatDateDisplay(todayStr)}
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            {getGreeting()}
          </h1>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-stone-100 dark:text-stone-800"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600 transition-all duration-1000 ease-out"
                strokeWidth="3"
                strokeDasharray={`${completionPercentage}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-bold">{completionPercentage}%</span>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Bugungi natija</p>
            <p className="font-bold text-lg">{completedTasks.length} / {todayTasks.length} vazifa</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Top Priorities */}
          <section className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-500" size={20} />
                Asosiy maqsadlar (Top 3)
              </h2>
            </div>
            
            {topPriorities.length === 0 ? (
              <div className="text-center py-8 text-stone-500">
                <p>Bugun uchun asosiy maqsadlar belgilanmagan.</p>
                <button onClick={onQuickAdd} className="text-blue-600 font-medium mt-2 hover:underline">Vazifa qo'shish</button>
              </div>
            ) : (
              <div className="space-y-3">
                {topPriorities.map(task => (
                  <div key={task.id} className={`flex items-center p-4 rounded-2xl border transition-colors ${task.completed ? 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800' : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 shadow-sm'}`}>
                    <button onClick={() => toggleTask(task.id)} className="mr-4">
                      {task.completed ? (
                        <CheckCircle2 className="text-amber-500" size={24} />
                      ) : (
                        <Circle className="text-stone-300 dark:text-stone-600 hover:text-amber-400 transition-colors" size={24} />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`font-medium ${task.completed ? 'line-through text-stone-400' : 'text-stone-900 dark:text-white'}`}>
                        {task.title}
                      </p>
                      {task.time && <p className="text-sm text-stone-500">{task.time}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Tasks Overview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Bugungi barcha vazifalar</h2>
            </div>
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
               {todayTasks.filter(t => !t.isTopPriority).length === 0 ? (
                 <p className="text-stone-500 text-center py-4">Boshqa vazifalar yo'q</p>
               ) : (
                 <div className="space-y-2">
                   {todayTasks.filter(t => !t.isTopPriority).slice(0, 5).map(task => (
                     <div key={task.id} className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleTask(task.id)}>
                            {task.completed ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} className="text-stone-300" />}
                          </button>
                          <span className={`${task.completed ? 'line-through text-stone-400' : ''}`}>{task.title}</span>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Quick Schedule Preview */}
          <section className="bg-blue-600 text-white rounded-3xl p-6 shadow-md">
            <h2 className="text-lg font-bold mb-4 opacity-90">Kun tartibi</h2>
            {timeBlocks.filter(tb => tb.date === todayStr).length === 0 ? (
              <p className="text-blue-200 text-sm">Vaqt bloklari kiritilmagan.</p>
            ) : (
              <div className="space-y-4">
                {timeBlocks.filter(tb => tb.date === todayStr).sort((a,b) => a.startTime.localeCompare(b.startTime)).slice(0,4).map(block => (
                  <div key={block.id} className="flex items-start gap-3">
                    <div className="w-12 text-sm font-medium opacity-70 pt-0.5">{block.startTime}</div>
                    <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <p className="font-medium text-sm leading-tight">{block.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <button 
            onClick={() => setIsReviewOpen(true)}
            className="w-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
          >
            Kun yakuni xulosasi <ArrowRight size={18} />
          </button>
        </div>
      </div>
      
      <ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
    </div>
  );
}
