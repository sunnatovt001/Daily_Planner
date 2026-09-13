import { useState, useMemo } from 'react';
import { usePlanner } from '../utils/PlannerContext';
import { getTodayDateString, formatDateDisplay } from '../utils/dateUtils';
import { CheckCircle2, Circle, Clock, Tag, Trash2, Edit2, AlertCircle, Plus, Sun, Sunset, Moon } from 'lucide-react';
import { Task, TaskCategory, Priority } from '../types';
import { sounds } from '../utils/audio';

export default function TasksView() {
  const { tasks, setTasks } = usePlanner();
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const displayTasks = useMemo(() => tasks.filter(t => t.date === selectedDate), [tasks, selectedDate]);
  
  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        if (!t.completed) sounds.playCompleteSound();
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const getPriorityIndicator = (priority: Priority) => {
    switch (priority) {
      case 'high': 
        return <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400 shadow-sm shadow-red-500/50" /> <span className="text-xs font-medium text-stone-300">High</span></div>;
      case 'medium': 
        return <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50" /> <span className="text-xs font-medium text-stone-300">Medium</span></div>;
      case 'low': 
        return <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-stone-500" /> <span className="text-xs font-medium text-stone-400">Low</span></div>;
    }
  };

  const getTimeGroup = (time?: string) => {
    if (!time) return 'any';
    const hour = parseInt(time.split(':')[0], 10);
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const groups = {
    morning: displayTasks.filter(t => getTimeGroup(t.time) === 'morning'),
    afternoon: displayTasks.filter(t => getTimeGroup(t.time) === 'afternoon'),
    evening: displayTasks.filter(t => getTimeGroup(t.time) === 'evening'),
    any: displayTasks.filter(t => getTimeGroup(t.time) === 'any'),
  };

  const TaskList = ({ items, title, icon: Icon }: { items: Task[], title: string, icon: any }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-6 md:mb-8">
        <h3 className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider text-stone-400 mb-3">
          <Icon size={16} /> {title}
        </h3>
        <div className="space-y-3">
          {items.map(task => (
            <div key={task.id} className={`group flex items-center p-3.5 md:p-4 rounded-2xl border transition-all ${task.completed ? 'opacity-50 bg-white/5 border-white/5' : 'glass-card hover:shadow-xl'}`}>
              <button onClick={() => toggleTask(task.id)} className="mr-3 md:mr-4 flex-shrink-0 text-stone-500 hover:text-white transition-colors">
                {task.completed ? (
                  <CheckCircle2 className="text-white" size={22} />
                ) : (
                  <Circle size={22} />
                )}
              </button>
              
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold text-sm md:text-base truncate ${task.completed ? 'line-through text-stone-500' : 'text-white'}`}>
                    {task.title}
                  </p>
                  {task.notes && <p className="text-xs md:text-sm text-stone-400 truncate mt-0.5">{task.notes}</p>}
                </div>
                
                <div className="flex items-center gap-3 flex-shrink-0">
                  {task.time && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-stone-400">
                      <Clock size={12} /> {task.time}
                    </div>
                  )}
                  {getPriorityIndicator(task.priority)}
                </div>
              </div>
              
              <div className="ml-3 flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => deleteTask(task.id)} className="p-2 text-stone-400 hover:text-red-400 rounded-xl hover:bg-red-500/10">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Tasks</h1>
          <p className="text-stone-400 mt-0.5 text-sm">{formatDateDisplay(selectedDate)}</p>
        </div>
        <div className="flex glass-pill p-1">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none outline-none px-3 py-1.5 font-semibold text-sm text-stone-200 cursor-pointer"
          />
        </div>
      </header>

      {displayTasks.length === 0 ? (
        <div className="text-center py-16 md:py-20 glass-card rounded-2xl border-dashed">
          <CheckCircle2 size={40} className="mx-auto text-stone-600 mb-3" strokeWidth={1.5} />
          <h3 className="text-lg font-bold mb-1 text-white">No tasks</h3>
          <p className="text-sm text-stone-400">No tasks added for this day.</p>
        </div>
      ) : (
        <div>
          <TaskList items={groups.morning} title="Morning" icon={Sun} />
          <TaskList items={groups.afternoon} title="Afternoon" icon={Sunset} />
          <TaskList items={groups.evening} title="Evening" icon={Moon} />
          <TaskList items={groups.any} title="Other time" icon={Clock} />
        </div>
      )}
    </div>
  );
}
