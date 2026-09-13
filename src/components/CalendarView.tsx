import { useState, useMemo } from 'react';
import { usePlanner } from '../utils/PlannerContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export default function CalendarView() {
  const { tasks } = usePlanner();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "MMMM yyyy";
  const days = [];
  let day = startDate;

  // Generate days
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-6 md:mb-8 flex items-center justify-between glass-card p-4 rounded-2xl shadow-lg border border-white/10">
        <button onClick={prevMonth} className="p-2 rounded-xl glass-pill hover:scale-105 active:scale-95 transition-all text-white">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg md:text-xl font-extrabold tracking-tight capitalize text-white">
          {format(currentDate, dateFormat)}
        </h1>
        <button onClick={nextMonth} className="p-2 rounded-xl glass-pill hover:scale-105 active:scale-95 transition-all text-white">
          <ChevronRight size={20} />
        </button>
      </header>

      <div className="glass-card rounded-2xl shadow-xl overflow-hidden border border-white/10">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-white/10">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="p-2 md:p-4 text-center text-xs md:text-sm font-bold text-stone-400">
              {d}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((date, i) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayTasks = tasks.filter(t => t.date === dateStr);
            const isToday = isSameDay(date, new Date());
            const isCurrentMonth = isSameMonth(date, monthStart);
            
            return (
              <div 
                key={date.toString()} 
                className={`min-h-[80px] md:min-h-[120px] p-1.5 md:p-2 border-b border-r border-white/10 transition-all ${
                  !isCurrentMonth ? 'bg-white/[0.02] text-stone-600' : 'hover:bg-white/5 text-stone-200'
                } ${i % 7 === 6 ? 'border-r-0' : ''}`}
              >
                <div className="flex justify-between items-start mb-1 md:mb-2">
                  <span className={`w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs md:text-sm font-bold rounded-full ${
                    isToday ? 'bg-white text-stone-950 shadow-md shadow-white/20 scale-105 font-black' : ''
                  }`}>
                    {format(date, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="hidden md:inline text-[10px] font-bold text-stone-400">{dayTasks.length} tasks</span>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div 
                      key={task.id} 
                      className={`text-[10px] md:text-xs px-1.5 py-0.5 md:py-1 rounded-lg truncate font-semibold border ${
                        task.completed 
                          ? 'opacity-40 line-through border-transparent' 
                          : 'glass-pill text-stone-100 border-white/10'
                      }`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-[9px] md:text-xs text-stone-400 text-center font-bold mt-0.5">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
