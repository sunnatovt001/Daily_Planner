import { useState } from 'react';
import { LayoutDashboard, CheckSquare, Calendar as CalendarIcon, Clock, Activity, BarChart2, Plus, Moon, Sun, Settings } from 'lucide-react';
import { ActiveTab } from './types';
import { PlannerProvider, usePlanner } from './utils/PlannerContext';

import Dashboard from './components/Dashboard';
import TasksView from './components/TasksView';
import ScheduleView from './components/ScheduleView';
import HabitsView from './components/HabitsView';
import CalendarView from './components/CalendarView';
import StatisticsView from './components/StatisticsView';
import QuickAddModal from './components/QuickAddModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const { isDarkMode, toggleTheme } = usePlanner();

  const navItems = [
    { id: 'dashboard', label: 'Asosiy', icon: <LayoutDashboard size={20} /> },
    { id: 'tasks', label: 'Vazifalar', icon: <CheckSquare size={20} /> },
    { id: 'schedule', label: 'Kun tartibi', icon: <Clock size={20} /> },
    { id: 'habits', label: 'Odatlar', icon: <Activity size={20} /> },
    { id: 'calendar', label: 'Taqvim', icon: <CalendarIcon size={20} /> },
    { id: 'statistics', label: 'Statistika', icon: <BarChart2 size={20} /> },
  ] as const;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors duration-200 font-sans text-stone-900 dark:text-stone-100 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col z-40">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-white flex items-center justify-center text-white dark:text-stone-900 font-bold text-xl leading-none">
            D
          </div>
          <h1 className="font-bold text-xl tracking-tight">Daily Planner</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-900 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            Yangi vazifa
          </button>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {isDarkMode ? 'Kunduzgi rejim' : 'Tungi rejim'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen">
        {activeTab === 'dashboard' && <Dashboard onQuickAdd={() => setIsQuickAddOpen(true)} />}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'schedule' && <ScheduleView />}
        {activeTab === 'habits' && <HabitsView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'statistics' && <StatisticsView />}
      </main>

      {/* Modals */}
      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <PlannerProvider>
      <AppContent />
    </PlannerProvider>
  );
}
