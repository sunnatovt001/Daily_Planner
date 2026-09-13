import { useState } from 'react';
import { LayoutDashboard, CheckSquare, Calendar as CalendarIcon, Clock, Activity, BarChart2, Plus, Moon, Sun, Menu, X, Sparkles } from 'lucide-react';
import { ActiveTab } from './types';
import { PlannerProvider, usePlanner } from './utils/PlannerContext';

import Dashboard from './components/Dashboard';
import TasksView from './components/TasksView';
import ScheduleView from './components/ScheduleView';
import HabitsView from './components/HabitsView';
import CalendarView from './components/CalendarView';
import StatisticsView from './components/StatisticsView';
import QuickAddModal from './components/QuickAddModal';
import UserProfileWidget from './components/UserProfileWidget';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={20} /> },
    { id: 'schedule', label: 'Schedule', icon: <Clock size={20} /> },
    { id: 'habits', label: 'Habits', icon: <Activity size={20} /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon size={20} /> },
    { id: 'statistics', label: 'Statistics', icon: <BarChart2 size={20} /> },
  ] as const;

  return (
    <div className="relative min-h-screen bg-[#09090b] font-sans text-stone-100 flex flex-col overflow-x-hidden selection:bg-white/20 selection:text-white">
      
      {/* Liquid Glass Background Orbs & Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute top-1/3 -right-28 w-[28rem] h-[28rem] bg-purple-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-[32rem] h-[32rem] bg-amber-500/15 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
        <div className="absolute top-2/3 left-10 w-80 h-80 bg-cyan-600/15 rounded-full blur-[100px] animate-blob"></div>
      </div>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 z-30 glass-card px-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white text-stone-950 flex items-center justify-center font-black shadow-md shadow-white/10">
            D
          </div>
          <span className="font-extrabold text-lg tracking-tight">Daily Planner</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="p-2 rounded-xl glass-button-primary active:scale-95 transition-transform"
            aria-label="New Task"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl glass-pill text-stone-300 active:scale-95 transition-transform"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Floating Glass Sidebar (Desktop + Mobile Drawer) */}
      <aside className={`fixed left-0 top-0 h-screen w-64 glass-card z-40 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-white/10 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-stone-950 font-extrabold text-xl leading-none shadow-md shadow-white/10">
              D
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight leading-tight text-white">Daily Planner</h1>
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
                <Sparkles size={10} className="text-amber-400" /> Liquid Glass
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-stone-400 hover:text-white rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3.5 py-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-white text-stone-950 shadow-lg shadow-white/15 backdrop-blur-md scale-[1.02] font-bold'
                  : 'text-stone-400 hover:bg-white/10 hover:text-stone-100'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <UserProfileWidget />
          <button
            onClick={() => {
              setIsQuickAddOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 glass-button-primary py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
          >
            <Plus size={18} />
            New Task
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 min-h-screen pt-20 md:pt-0 pb-24 md:pb-8 relative z-10 transition-all">
        {activeTab === 'dashboard' && <Dashboard onQuickAdd={() => setIsQuickAddOpen(true)} />}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'schedule' && <ScheduleView />}
        {activeTab === 'habits' && <HabitsView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'statistics' && <StatisticsView />}
      </main>

      {/* Mobile Bottom Navigation Bar (Liquid Glass Mode) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-card z-30 border-t border-white/10 flex items-center justify-around px-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === item.id
                ? 'text-white font-bold scale-110'
                : 'text-stone-400 font-medium opacity-70 hover:opacity-100'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
          </button>
        ))}
      </div>

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

