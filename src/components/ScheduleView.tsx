import { useState, useMemo } from 'react';
import { usePlanner } from '../utils/PlannerContext';
import { getTodayDateString, formatDateDisplay } from '../utils/dateUtils';
import { Plus } from 'lucide-react';

export default function ScheduleView() {
  const { timeBlocks, setTimeBlocks } = usePlanner();
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 to 23:00
  
  const displayBlocks = useMemo(() => timeBlocks.filter(tb => tb.date === selectedDate), [timeBlocks, selectedDate]);

  const addBlock = () => {
    const title = prompt('Vaqt bloki nomini kiriting:');
    if (!title) return;
    const startTime = prompt('Boshlanish vaqti (Masalan 09:00):', '09:00');
    if (!startTime) return;
    const endTime = prompt('Tugash vaqti (Masalan 10:30):', '10:00');
    if (!endTime) return;

    setTimeBlocks([...timeBlocks, {
      id: Date.now().toString(),
      title,
      startTime,
      endTime,
      date: selectedDate,
      category: 'ish'
    }]);
  };

  const getPositionStyles = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    // Base 06:00 = 0px. 1 hour = 80px.
    const startOffset = (startH - 6) * 80 + (startM / 60) * 80;
    const duration = (endH - startH) * 80 + ((endM - startM) / 60) * 80;
    
    return {
      top: `${startOffset}px`,
      height: `${Math.max(duration, 30)}px` // min height 30px
    };
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Kun tartibi</h1>
          <p className="text-stone-500 mt-1">{formatDateDisplay(selectedDate)}</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-stone-100 dark:bg-stone-900 border-none outline-none px-3 py-2 rounded-lg font-medium text-sm text-stone-700 dark:text-stone-300"
          />
          <button 
            onClick={addBlock}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Qo'shish
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="relative" style={{ height: `${18 * 80}px` }}>
          {/* Grid lines */}
          {hours.map((hour, idx) => (
            <div key={hour} className="absolute w-full flex items-start border-t border-stone-100 dark:border-stone-800" style={{ top: `${idx * 80}px`, height: '80px' }}>
              <div className="w-16 p-2 text-xs font-medium text-stone-400 text-right">
                {String(hour).padStart(2, '0')}:00
              </div>
            </div>
          ))}

          {/* Time Blocks */}
          <div className="absolute top-0 bottom-0 left-16 right-4">
            {displayBlocks.map(block => (
              <div 
                key={block.id}
                className="absolute left-2 right-2 bg-blue-100 dark:bg-blue-900/40 border-l-4 border-blue-600 rounded-md p-2 text-blue-900 dark:text-blue-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                style={getPositionStyles(block.startTime, block.endTime)}
                onClick={() => {
                  if (confirm("Bu blokni o'chirmoqchimisiz?")) {
                    setTimeBlocks(timeBlocks.filter(tb => tb.id !== block.id));
                  }
                }}
              >
                <div className="text-xs font-bold mb-0.5">{block.startTime} - {block.endTime}</div>
                <div className="text-sm font-medium leading-tight truncate">{block.title}</div>
              </div>
            ))}
          </div>
          
          {/* Current Time Line (only if today) */}
          {selectedDate === todayStr && (
            <CurrentTimeLine />
          )}
        </div>
      </div>
    </div>
  );
}

function CurrentTimeLine() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  
  if (h < 6 || h > 23) return null;
  
  const top = (h - 6) * 80 + (m / 60) * 80;
  
  return (
    <div className="absolute left-16 right-0 border-t-2 border-red-500 z-10 pointer-events-none" style={{ top: `${top}px` }}>
      <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-500"></div>
    </div>
  );
}
