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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-stone-200 dark:border-stone-800 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800 flex-shrink-0">
          <h2 className="text-xl font-bold">Kun yakuni</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors rounded-full hover:bg-stone-100 dark:hover:bg-stone-800">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="border border-stone-200 dark:border-stone-800 p-4 rounded-xl text-center">
              <p className="text-3xl font-black text-stone-900 dark:text-white">{completionPercentage}%</p>
              <p className="text-[10px] font-bold text-stone-500 uppercase mt-1 tracking-wider">Vazifalar</p>
            </div>
            <div className="border border-stone-200 dark:border-stone-800 p-4 rounded-xl text-center">
              <p className="text-3xl font-black text-stone-900 dark:text-white">{completedHabits}</p>
              <p className="text-[10px] font-bold text-stone-500 uppercase mt-1 tracking-wider">Odatlar</p>
            </div>
            <div className="border border-stone-200 dark:border-stone-800 p-4 rounded-xl text-center">
              <p className="text-3xl font-black text-stone-900 dark:text-white">{timeBlocks.filter(tb => tb.date === todayStr).length}</p>
              <p className="text-[10px] font-bold text-stone-500 uppercase mt-1 tracking-wider">Vaqt bloklari</p>
            </div>
          </div>

          {existingReview ? (
            <div className="space-y-6">
              <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-xl border border-stone-100 dark:border-stone-800">
                <h4 className="text-[10px] font-bold text-stone-500 uppercase mb-2 tracking-wider">Bugun erishilgan yutuqlar</h4>
                <p className="font-medium text-sm text-stone-900 dark:text-stone-100">{existingReview.achievements || "Kiritilmagan"}</p>
              </div>
              <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-xl border border-stone-100 dark:border-stone-800">
                <h4 className="text-[10px] font-bold text-stone-500 uppercase mb-2 tracking-wider">Yaxshilash mumkin bo'lgan jihatlar</h4>
                <p className="font-medium text-sm text-stone-900 dark:text-stone-100">{existingReview.improvements || "Kiritilmagan"}</p>
              </div>
              <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-xl border border-stone-100 dark:border-stone-800 border-l-4 border-l-stone-900 dark:border-l-white">
                <h4 className="text-[10px] font-bold text-stone-500 uppercase mb-2 tracking-wider">Ertangi kun uchun eng muhim vazifa</h4>
                <p className="font-bold text-sm text-stone-900 dark:text-white">{existingReview.tomorrowPriority || "Kiritilmagan"}</p>
              </div>
            </div>
          ) : (
            <form id="review-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Bugun nimalarga erishdingiz?</label>
                <textarea 
                  rows={3}
                  value={achievements}
                  onChange={e => setAchievements(e.target.value)}
                  className="w-full bg-transparent border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-sm outline-none focus:border-stone-900 dark:focus:border-white focus:ring-1 focus:ring-stone-900 dark:focus:ring-white transition-shadow resize-none"
                  placeholder="Bugungi muvaffaqiyatlar..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Bugun nimani yaxshiroq qilish mumkin edi?</label>
                <textarea 
                  rows={3}
                  value={improvements}
                  onChange={e => setImprovements(e.target.value)}
                  className="w-full bg-transparent border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-sm outline-none focus:border-stone-900 dark:focus:border-white focus:ring-1 focus:ring-stone-900 dark:focus:ring-white transition-shadow resize-none"
                  placeholder="Kamchiliklar va xatolar..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Ertangi kun uchun eng muhim vazifa nima?</label>
                <input 
                  type="text"
                  value={tomorrowPriority}
                  onChange={e => setTomorrowPriority(e.target.value)}
                  className="w-full bg-transparent border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-sm outline-none focus:border-stone-900 dark:focus:border-white focus:ring-1 focus:ring-stone-900 dark:focus:ring-white transition-shadow"
                  placeholder="Bitta asosiy maqsadni yozing..."
                />
              </div>
            </form>
          )}
        </div>
        
        {!existingReview && (
          <div className="p-6 border-t border-stone-100 dark:border-stone-800 flex-shrink-0">
            <button 
              type="submit" 
              form="review-form"
              className="w-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Saqlash va kunni yakunlash
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
