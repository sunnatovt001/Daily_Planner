import { useMemo, useState } from 'react';
import { usePlanner } from '../utils/PlannerContext';
import { getTodayDateString, getGreeting, getDayOfWeek, formatDateDisplay } from '../utils/dateUtils';
import { CheckCircle2, Circle, Star, ArrowRight, Play } from 'lucide-react';
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
        }
        return { ...t, completed: newlyCompleted };
      }
      return t;
    }));
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6 md:space-y-8">
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-stone-400 font-medium tracking-wide text-xs md:text-sm mb-1 uppercase">
            {getDayOfWeek(todayStr)}, {formatDateDisplay(todayStr)}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            {getGreeting()}
          </h1>
        </div>
        
        <div className="flex items-center gap-4 glass-card p-4 rounded-2xl">
          <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-stone-800/80"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-white transition-all duration-1000 ease-out"
                strokeWidth="3"
                strokeDasharray={`${completionPercentage}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-bold text-white">{completionPercentage}%</span>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-400">Today's Progress</p>
            <p className="font-bold text-base md:text-lg text-white">{completedTasks.length} / {todayTasks.length} tasks</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Top Priorities */}
          <section className="glass-card rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-white">
                Top Priorities
              </h2>
            </div>
            
            {topPriorities.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <p className="text-sm">No top priorities set for today.</p>
                <button onClick={onQuickAdd} className="text-white font-semibold text-sm mt-2 hover:underline">Add task</button>
              </div>
            ) : (
              <div className="space-y-3">
                {topPriorities.map(task => (
                  <div key={task.id} className={`flex items-center p-3.5 md:p-4 rounded-xl border transition-all ${task.completed ? 'bg-white/5 border-white/5' : 'glass-pill border-white/10'}`}>
                    <button onClick={() => toggleTask(task.id)} className="mr-3 md:mr-4 flex-shrink-0">
                      {task.completed ? (
                        <CheckCircle2 className="text-white" size={24} />
                      ) : (
                        <Circle className="text-stone-500 hover:text-white transition-colors" size={24} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm md:text-base truncate ${task.completed ? 'line-through text-stone-500' : 'text-white'}`}>
                        {task.title}
                      </p>
                      {task.time && <p className="text-xs text-stone-400 mt-0.5">{task.time}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Tasks Overview */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg md:text-xl font-bold text-white">All Tasks for Today</h2>
            </div>
            <div className="glass-card rounded-2xl p-5 md:p-6">
               {todayTasks.filter(t => !t.isTopPriority).length === 0 ? (
                 <p className="text-stone-400 text-center py-4 text-sm">No other tasks</p>
               ) : (
                 <div className="space-y-2">
                   {todayTasks.filter(t => !t.isTopPriority).slice(0, 5).map(task => (
                     <div key={task.id} className="flex items-center justify-between py-2.5 border-b border-white/10 last:border-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                            {task.completed ? <CheckCircle2 size={18} className="text-white" /> : <Circle size={18} className="text-stone-500 hover:text-white" />}
                          </button>
                          <span className={`text-sm truncate ${task.completed ? 'line-through text-stone-500' : 'text-stone-200'}`}>{task.title}</span>
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
          <section className="glass-card rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-bold mb-4 text-white">Schedule</h2>
            {timeBlocks.filter(tb => tb.date === todayStr).length === 0 ? (
              <p className="text-stone-400 text-sm">No time blocks scheduled.</p>
            ) : (
              <div className="space-y-3">
                {timeBlocks.filter(tb => tb.date === todayStr).sort((a,b) => a.startTime.localeCompare(b.startTime)).slice(0,4).map(block => (
                  <div key={block.id} className="flex items-start gap-3">
                    <div className="w-12 text-xs font-semibold text-stone-400 pt-1 flex-shrink-0">{block.startTime}</div>
                    <div className="flex-1 glass-pill p-2.5 rounded-xl">
                      <p className="font-semibold text-xs md:text-sm leading-tight text-white">{block.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <button 
            onClick={() => setIsReviewOpen(true)}
            className="w-full glass-button-primary py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 text-sm md:text-base"
          >
            End of Day Review <ArrowRight size={18} />
          </button>
        </div>
      </div>
      
      <ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
    </div>
  );
}
