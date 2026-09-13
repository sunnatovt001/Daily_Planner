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
      <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800 flex-shrink-0">
          <h2 className="text-2xl font-bold">Kun yakuni</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors rounded-full hover:bg-stone-100 dark:hover:bg-stone-800">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-center">
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{completionPercentage}%</p>
              <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mt-1">Vazifalar</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl text-center">
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{completedHabits}</p>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase mt-1">Odatlar</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl text-center">
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{timeBlocks.filter(tb => tb.date === todayStr).length}</p>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase mt-1">Vaqt bloklari</p>
            </div>
          </div>

          {existingReview ? (
            <div className="space-y-6">
              <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-2xl">
                <h4 className="text-sm font-bold text-stone-500 uppercase mb-2">Bugun erishilgan yutuqlar</h4>
                <p className="font-medium">{existingReview.achievements || "Kiritilmagan"}</p>
              </div>
              <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-2xl">
                <h4 className="text-sm font-bold text-stone-500 uppercase mb-2">Yaxshilash mumkin bo'lgan jihatlar</h4>
                <p className="font-medium">{existingReview.improvements || "Kiritilmagan"}</p>
              </div>
              <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-2xl">
                <h4 className="text-sm font-bold text-stone-500 uppercase mb-2">Ertangi kun uchun eng muhim vazifa</h4>
                <p className="font-medium text-blue-600 dark:text-blue-400">{existingReview.tomorrowPriority || "Kiritilmagan"}</p>
              </div>
            </div>
          ) : (
            <form id="review-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold">Bugun nimalarga erishdingiz?</label>
                <textarea 
                  rows={3}
                  value={achievements}
                  onChange={e => setAchievements(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 outline-none focus:border-blue-500 resize-none"
                  placeholder="Bugungi muvaffaqiyatlar..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Bugun nimani yaxshiroq qilish mumkin edi?</label>
                <textarea 
                  rows={3}
                  value={improvements}
                  onChange={e => setImprovements(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 outline-none focus:border-blue-500 resize-none"
                  placeholder="Kamchiliklar va xatolar..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Ertangi kun uchun eng muhim vazifa nima?</label>
                <input 
                  type="text"
                  value={tomorrowPriority}
                  onChange={e => setTomorrowPriority(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 outline-none focus:border-blue-500"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              Saqlash va kunni yakunlash
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
