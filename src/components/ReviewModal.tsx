import React, { useState } from 'react';
import { X } from 'lucide-react';
import { usePlanner } from '../utils/PlannerContext';
import { getTodayDateString } from '../utils/dateUtils';
import confetti from 'canvas-confetti';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
  const { tasks, habits, timeBlocks, reviews, setReviews } = usePlanner();
  const todayStr = getTodayDateString();

  const [achievements, setAchievements] = useState('');
  const [improvements, setImprovements] = useState('');
  const [tomorrowPriority, setTomorrowPriority] = useState('');

  const todayTasks = tasks.filter(t => t.date === todayStr);
  const completedTasks = todayTasks.filter(t => t.completed).length;
  const completionPercentage = todayTasks.length > 0 ? Math.round((completedTasks / todayTasks.length) * 100) : 0;
  
  const completedHabits = habits.filter(h => (h.completedDates || []).includes(todayStr)).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviews([...reviews, {
      date: todayStr,
      achievements,
      improvements,
      tomorrowPriority
    }]);
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    onClose();
  };

  if (!isOpen) return null;

  const existingReview = reviews.find(r => r.date === todayStr);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col border border-white/10">
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-white/10 flex-shrink-0">
          <h2 className="text-xl font-extrabold text-white">End of Day Review</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="glass-pill p-3.5 md:p-4 rounded-2xl text-center">
              <p className="text-2xl md:text-3xl font-black text-white">{completionPercentage}%</p>
              <p className="text-[10px] font-extrabold text-stone-400 uppercase mt-0.5 tracking-wider">Tasks</p>
            </div>
            <div className="glass-pill p-3.5 md:p-4 rounded-2xl text-center">
              <p className="text-2xl md:text-3xl font-black text-white">{completedHabits}</p>
              <p className="text-[10px] font-extrabold text-stone-400 uppercase mt-0.5 tracking-wider">Habits</p>
            </div>
            <div className="glass-pill p-3.5 md:p-4 rounded-2xl text-center">
              <p className="text-2xl md:text-3xl font-black text-white">{timeBlocks.filter(tb => tb.date === todayStr).length}</p>
              <p className="text-[10px] font-extrabold text-stone-400 uppercase mt-0.5 tracking-wider">Blocks</p>
            </div>
          </div>

          {existingReview ? (
            <div className="space-y-4 md:space-y-5">
              <div className="glass-pill p-4 md:p-5 rounded-2xl">
                <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-1.5 tracking-wider">Today's Achievements</h4>
                <p className="font-semibold text-sm text-white">{existingReview.achievements || "Not provided"}</p>
              </div>
              <div className="glass-pill p-4 md:p-5 rounded-2xl">
                <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-1.5 tracking-wider">Areas for Improvement</h4>
                <p className="font-semibold text-sm text-white">{existingReview.improvements || "Not provided"}</p>
              </div>
              <div className="glass-pill p-4 md:p-5 rounded-2xl border-l-4 border-l-white">
                <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-1.5 tracking-wider">Top Priority for Tomorrow</h4>
                <p className="font-bold text-sm md:text-base text-white">{existingReview.tomorrowPriority || "Not provided"}</p>
              </div>
            </div>
          ) : (
            <form id="review-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400">What did you achieve today?</label>
                <textarea 
                  rows={3}
                  value={achievements}
                  onChange={e => setAchievements(e.target.value)}
                  className="w-full glass-input rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-white transition-all resize-none text-white placeholder:text-stone-500"
                  placeholder="Today's successes..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400">What could be done better?</label>
                <textarea 
                  rows={3}
                  value={improvements}
                  onChange={e => setImprovements(e.target.value)}
                  className="w-full glass-input rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-white transition-all resize-none text-white placeholder:text-stone-500"
                  placeholder="Shortcomings and mistakes..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400">What is the top priority for tomorrow?</label>
                <input 
                  type="text"
                  value={tomorrowPriority}
                  onChange={e => setTomorrowPriority(e.target.value)}
                  className="w-full glass-input rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-white transition-all text-white placeholder:text-stone-500"
                  placeholder="Write one main goal..."
                />
              </div>
            </form>
          )}
        </div>
        
        {!existingReview && (
          <div className="p-5 md:p-6 border-t border-white/10 flex-shrink-0">
            <button 
              type="submit" 
              form="review-form"
              className="w-full glass-button-primary font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-98"
            >
              Save and end day
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
