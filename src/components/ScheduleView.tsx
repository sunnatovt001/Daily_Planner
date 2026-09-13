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
    const title = prompt('Enter time block name:');
    if (!title) return;
    const startTime = prompt('Start time (e.g. 09:00):', '09:00');
    if (!startTime) return;
    const endTime = prompt('End time (e.g. 10:30):', '10:00');
    if (!endTime) return;

    setTimeBlocks([...timeBlocks, {
      id: Date.now().toString(),
      title,
      startTime,
      endTime,
      date: selectedDate,
      category: 'work'
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Schedule</h1>
          <p className="text-stone-400 mt-0.5 text-sm">{formatDateDisplay(selectedDate)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-pill p-1">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none px-3 py-1.5 font-semibold text-sm text-stone-200 cursor-pointer"
            />
          </div>
          <button 
            onClick={addBlock}
            className="flex items-center gap-2 glass-button-primary px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 flex-shrink-0"
          >
            <Plus size={16} /> Add block
          </button>
        </div>
      </header>

      <div className="glass-card rounded-2xl shadow-xl overflow-hidden border border-white/10">
        <div className="relative overflow-x-auto" style={{ height: `${18 * 80}px` }}>
          {/* Grid lines */}
          {hours.map((hour, idx) => (
            <div key={hour} className="absolute w-full flex items-start border-t border-white/10" style={{ top: `${idx * 80}px`, height: '80px' }}>
              <div className="w-14 md:w-16 p-2 text-[11px] md:text-xs font-semibold text-stone-400 text-right flex-shrink-0">
                {String(hour).padStart(2, '0')}:00
              </div>
            </div>
          ))}

          {/* Time Blocks */}
          <div className="absolute top-0 bottom-0 left-14 md:left-16 right-2 md:right-4">
            {displayBlocks.map(block => (
              <div 
                key={block.id}
                className="absolute left-1 md:left-2 right-1 md:right-2 glass-pill border-l-4 border-l-white rounded-xl p-2 md:p-2.5 text-white overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.01]"
                style={getPositionStyles(block.startTime, block.endTime)}
                onClick={() => {
                  if (confirm("Are you sure you want to delete this block?")) {
                    setTimeBlocks(timeBlocks.filter(tb => tb.id !== block.id));
                  }
                }}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-0.5">{block.startTime} - {block.endTime}</div>
                <div className="text-xs md:text-sm font-bold leading-tight truncate text-white">{block.title}</div>
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
    <div className="absolute left-16 right-0 border-t border-red-500 z-10 pointer-events-none" style={{ top: `${top}px` }}>
      <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-500"></div>
    </div>
  );
}
