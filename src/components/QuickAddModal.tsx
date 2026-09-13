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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">New Task</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4 md:space-y-5">
          <div>
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Task name..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-lg font-semibold bg-transparent border-b border-white/10 pb-2.5 focus:border-white outline-none text-white placeholder:text-stone-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white transition-all text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Time (Optional)</label>
              <input 
                type="time" 
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white transition-all text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Priority</label>
              <select 
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full glass-input rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white transition-all text-white"
              >
                <option value="high" className="bg-stone-900 text-white">High</option>
                <option value="medium" className="bg-stone-900 text-white">Medium</option>
                <option value="low" className="bg-stone-900 text-white">Low</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
                className="w-full glass-input rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white transition-all text-white"
              >
                <option value="work" className="bg-stone-900 text-white">Work</option>
                <option value="study" className="bg-stone-900 text-white">Study</option>
                <option value="personal" className="bg-stone-900 text-white">Personal</option>
                <option value="health" className="bg-stone-900 text-white">Health</option>
                <option value="finance" className="bg-stone-900 text-white">Finance</option>
                <option value="other" className="bg-stone-900 text-white">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Notes (Optional)</label>
            <textarea 
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full glass-input rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white transition-all resize-none text-white placeholder:text-stone-500"
              placeholder="Additional information..."
            />
          </div>
          
          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input 
              type="checkbox" 
              checked={isTopPriority}
              onChange={e => setIsTopPriority(e.target.checked)}
              className="w-4 h-4 text-white bg-transparent border-stone-600 rounded focus:ring-white"
            />
            <span className="text-xs md:text-sm font-semibold text-stone-300">Add to Top Priorities (Top 3)</span>
          </label>

          <div className="pt-4 flex items-center justify-between border-t border-white/10">
            <span className="text-xs text-stone-400 hidden sm:inline-block">Press <kbd className="font-mono glass-pill px-1.5 py-0.5 rounded text-[10px] text-stone-300">Ctrl+Enter</kbd> to save</span>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-semibold text-stone-300 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!title.trim()}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-sm font-bold glass-button-primary disabled:opacity-50 shadow-md active:scale-95"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
