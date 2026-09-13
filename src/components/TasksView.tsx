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
    if (confirm("Rostdan ham bu vazifani o'chirmoqchimisiz?")) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const getPriorityIndicator = (priority: Priority) => {
    switch (priority) {
      case 'high': 
        return <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Yuqori</span></div>;
      case 'medium': 
        return <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> <span className="text-xs font-medium text-stone-600 dark:text-stone-400">O'rta</span></div>;
      case 'low': 
        return <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-stone-400 dark:bg-stone-500" /> <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Past</span></div>;
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
      <div className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-500 mb-4">
          <Icon size={16} /> {title}
        </h3>
        <div className="space-y-3">
          {items.map(task => (
            <div key={task.id} className={`group flex items-center p-4 rounded-xl border transition-all ${task.completed ? 'bg-transparent border-stone-200 dark:border-stone-800 opacity-60' : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md'}`}>
              <button onClick={() => toggleTask(task.id)} className="mr-4 flex-shrink-0 text-stone-300 dark:text-stone-600 hover:text-stone-900 dark:hover:text-white transition-colors">
                {task.completed ? (
                  <CheckCircle2 className="text-stone-900 dark:text-white" size={22} />
                ) : (
                  <Circle size={22} />
                )}
              </button>
              
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <div className="flex-1 truncate">
                  <p className={`font-medium truncate ${task.completed ? 'line-through text-stone-500' : 'text-stone-900 dark:text-stone-100'}`}>
                    {task.title}
                  </p>
                  {task.notes && <p className="text-sm text-stone-500 truncate mt-0.5">{task.notes}</p>}
                </div>
                
                <div className="flex items-center gap-4 flex-shrink-0">
                  {task.time && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
                      <Clock size={12} /> {task.time}
                    </div>
                  )}
                  {getPriorityIndicator(task.priority)}
                </div>
              </div>
              
              <div className="ml-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => deleteTask(task.id)} className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
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
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Vazifalar</h1>
          <p className="text-stone-500 mt-1">{formatDateDisplay(selectedDate)}</p>
        </div>
        <div className="flex bg-stone-100 dark:bg-stone-900 rounded-lg p-1">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none outline-none px-3 py-1.5 font-medium text-sm text-stone-700 dark:text-stone-300 cursor-pointer"
          />
        </div>
      </header>

      {displayTasks.length === 0 ? (
        <div className="text-center py-20 bg-transparent rounded-2xl border border-stone-200 dark:border-stone-800 border-dashed">
          <CheckCircle2 size={40} className="mx-auto text-stone-300 dark:text-stone-700 mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-bold mb-1">Vazifalar yo'q</h3>
          <p className="text-sm text-stone-500">Bu kun uchun hech qanday vazifa qo'shilmagan.</p>
        </div>
      ) : (
        <div>
          <TaskList items={groups.morning} title="Ertalab" icon={Sun} />
          <TaskList items={groups.afternoon} title="Kunduzi" icon={Sunset} />
          <TaskList items={groups.evening} title="Kechqurun" icon={Moon} />
          <TaskList items={groups.any} title="Boshqa vaqt" icon={Clock} />
        </div>
      )}
    </div>
  );
}
