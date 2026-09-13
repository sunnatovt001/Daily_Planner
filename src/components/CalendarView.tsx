import { useState, useMemo } from 'react';
import { usePlanner } from '../utils/PlannerContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export default function CalendarView() {
  const { tasks } = usePlanner();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStarts: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStarts: 1 });

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
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex items-center justify-between bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight capitalize">
          {format(currentDate, dateFormat)}
        </h1>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">
          <ChevronRight size={24} />
        </button>
      </header>

      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-stone-200 dark:border-stone-800">
          {['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'].map((d) => (
            <div key={d} className="p-4 text-center text-sm font-semibold text-stone-500">
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
                className={`min-h-[120px] p-2 border-b border-r border-stone-100 dark:border-stone-800 transition-colors ${
                  !isCurrentMonth ? 'bg-stone-50/50 dark:bg-stone-950/50 text-stone-400' : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'
                } ${i % 7 === 6 ? 'border-r-0' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full ${
                    isToday ? 'bg-blue-600 text-white' : ''
                  }`}>
                    {format(date, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-xs font-bold text-stone-400">{dayTasks.length} ta</span>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div 
                      key={task.id} 
                      className={`text-xs px-2 py-1 rounded truncate font-medium ${
                        task.completed 
                          ? 'bg-stone-100 dark:bg-stone-800 text-stone-500 line-through' 
                          : task.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-stone-500 text-center font-medium mt-1">
                      +{dayTasks.length - 3} ta yana
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
