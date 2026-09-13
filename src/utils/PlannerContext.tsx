import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Habit, TimeBlock, DailyNote, DailyReview, TaskCategory } from '../types';
import { getItem, setItem } from './storage';
import { getTodayDateString } from './dateUtils';

interface PlannerContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  timeBlocks: TimeBlock[];
  setTimeBlocks: React.Dispatch<React.SetStateAction<TimeBlock[]>>;
  notes: DailyNote[];
  setNotes: React.Dispatch<React.SetStateAction<DailyNote[]>>;
  reviews: DailyReview[];
  setReviews: React.Dispatch<React.SetStateAction<DailyReview[]>>;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayStr = getTodayDateString();
  const [isInitialized, setIsInitialized] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [reviews, setReviews] = useState<DailyReview[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Load from local storage
    const loadedTasks = getItem<Task[]>('planner_tasks', [
      { id: 't1', title: 'Finish project', date: todayStr, time: '10:00', priority: 'high', category: 'work', completed: false, isTopPriority: true, createdAt: Date.now() },
      { id: 't2', title: 'Read a book', date: todayStr, time: '19:00', priority: 'medium', category: 'study', completed: false, createdAt: Date.now() },
      { id: 't3', title: 'Go to the gym', date: todayStr, time: '18:00', priority: 'high', category: 'health', completed: false, isTopPriority: true, createdAt: Date.now() }
    ]);
    const loadedHabits = getItem<Habit[]>('planner_habits', [
       { id: 'h1', name: 'Drink water', icon: '💧', frequency: ['daily'], completedDates: [], currentStreak: 0, bestStreak: 0, createdAt: Date.now() },
       { id: 'h2', name: 'Read 30 minutes', icon: '📚', frequency: ['daily'], completedDates: [], currentStreak: 0, bestStreak: 0, createdAt: Date.now() }
    ]);
    const loadedTimeBlocks = getItem<TimeBlock[]>('planner_time_blocks', [
       { id: 'tb1', date: todayStr, startTime: '09:00', endTime: '11:00', title: 'Deep work', category: 'work' },
       { id: 'tb2', date: todayStr, startTime: '13:00', endTime: '14:00', title: 'Lunch', category: 'other' }
    ]);
    const loadedNotes = getItem<DailyNote[]>('planner_notes', []);
    const loadedReviews = getItem<DailyReview[]>('planner_reviews', []);

    setTasks(loadedTasks);
    setHabits(loadedHabits);
    setTimeBlocks(loadedTimeBlocks);
    setNotes(loadedNotes);
    setReviews(loadedReviews);
    setIsDarkMode(true);
    setIsInitialized(true);
  }, [todayStr]);

  useEffect(() => {
    if (isInitialized) {
      setItem('planner_tasks', tasks);
      setItem('planner_habits', habits);
      setItem('planner_time_blocks', timeBlocks);
      setItem('planner_notes', notes);
      setItem('planner_reviews', reviews);
      setItem('planner_theme', true);
    }
  }, [tasks, habits, timeBlocks, notes, reviews, isInitialized]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  if (!isInitialized) return null; // Or loading spinner

  return (
    <PlannerContext.Provider value={{
      tasks, setTasks,
      habits, setHabits,
      timeBlocks, setTimeBlocks,
      notes, setNotes,
      reviews, setReviews,
      isDarkMode, toggleTheme
    }}>
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};
