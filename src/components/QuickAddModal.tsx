import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { usePlanner } from '../utils/PlannerContext';
import { getTodayDateString } from '../utils/dateUtils';
import { Priority, TaskCategory } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const { tasks, setTasks } = usePlanner();
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<TaskCategory>('ish');
  const [notes, setNotes] = useState('');
  const [isTopPriority, setIsTopPriority] = useState(false);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      // reset form
      setTitle('');
      setDate(getTodayDateString());
      setTime('');
      setPriority('medium');
      setCategory('ish');
      setNotes('');
      setIsTopPriority(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSubmit(e as any);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, date, time, priority, category, notes, isTopPriority]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setTasks([...tasks, {
      id: Date.now().toString(),
      title: title.trim(),
      date,
      time: time || undefined,
      priority,
      category,
      completed: false,
      notes: notes.trim() || undefined,
      isTopPriority,
      createdAt: Date.now()
    }]);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-xl font-bold">Yangi vazifa</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors rounded-full hover:bg-stone-100 dark:hover:bg-stone-800">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Vazifa nomi..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-lg font-medium bg-transparent border-b border-stone-200 dark:border-stone-700 pb-2 focus:border-blue-500 outline-none placeholder-stone-400"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-500 uppercase">Sana</label>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-500 uppercase">Vaqt (ixtiyoriy)</label>
              <input 
                type="time" 
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-500 uppercase">Muhimlik darajasi</label>
              <select 
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="high">Yuqori</option>
                <option value="medium">O'rta</option>
                <option value="low">Past</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-500 uppercase">Toifa</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="ish">Ish</option>
                <option value="oqish">O'qish</option>
                <option value="shaxsiy">Shaxsiy</option>
                <option value="salomatlik">Salomatlik</option>
                <option value="moliya">Moliya</option>
                <option value="boshqa">Boshqa</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-500 uppercase">Qaydlar (ixtiyoriy)</label>
            <textarea 
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
              placeholder="Qo'shimcha ma'lumotlar..."
            />
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isTopPriority}
              onChange={e => setIsTopPriority(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-stone-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium">Asosiy maqsadlarga qo'shish (Top 3)</span>
          </label>

          <div className="pt-4 flex items-center justify-between">
            <span className="text-xs text-stone-400 hidden sm:inline-block">Saqlash uchun <kbd className="font-mono bg-stone-100 dark:bg-stone-800 px-1 rounded">Ctrl+Enter</kbd> bosing</span>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Bekor qilish
              </button>
              <button 
                type="submit"
                disabled={!title.trim()}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
              >
                Saqlash
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
