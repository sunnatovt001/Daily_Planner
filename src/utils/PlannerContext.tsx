import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Habit, TimeBlock, DailyNote, DailyReview } from '../types';
import { getTodayDateString } from './dateUtils';
import { auth, db, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';

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
  // Firebase Auth & Cloud Sync
  user: User | null;
  loadingAuth: boolean;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  isSynced: boolean;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayStr = getTodayDateString();
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isSynced, setIsSynced] = useState(false);

  const [tasks, setTasksState] = useState<Task[]>([]);
  const [habits, setHabitsState] = useState<Habit[]>([]);
  const [timeBlocks, setTimeBlocksState] = useState<TimeBlock[]>([]);
  const [notes, setNotesState] = useState<DailyNote[]>([]);
  const [reviews, setReviewsState] = useState<DailyReview[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Set default initial state for guest mode when user is null
  useEffect(() => {
    if (!user && !loadingAuth) {
      if (tasks.length === 0) {
        setTasksState([
          { id: 't1', title: 'Loyihani yakunlash', date: todayStr, time: '10:00', priority: 'high', category: 'work', completed: false, isTopPriority: true, createdAt: Date.now() },
          { id: 't2', title: 'Kitob mutolaa qilish', date: todayStr, time: '19:00', priority: 'medium', category: 'study', completed: false, createdAt: Date.now() },
          { id: 't3', title: 'Sport bilan shug\'ullanish', date: todayStr, time: '18:00', priority: 'high', category: 'health', completed: false, isTopPriority: true, createdAt: Date.now() }
        ]);
      }
      if (habits.length === 0) {
        setHabitsState([
          { id: 'h1', name: 'Suv ichish (2L)', icon: '💧', frequency: ['daily'], completedDates: [], currentStreak: 0, bestStreak: 0, createdAt: Date.now() },
          { id: 'h2', name: 'Kunlik kitobxonlik', icon: '📚', frequency: ['daily'], completedDates: [], currentStreak: 0, bestStreak: 0, createdAt: Date.now() }
        ]);
      }
      if (timeBlocks.length === 0) {
        setTimeBlocksState([
          { id: 'tb1', date: todayStr, startTime: '09:00', endTime: '11:00', title: 'Chuqur ish vaqti', category: 'work' },
          { id: 'tb2', date: todayStr, startTime: '13:00', endTime: '14:00', title: 'Tushlik tanaffusi', category: 'other' }
        ]);
      }
    }
  }, [user, loadingAuth, todayStr]);

  // Real-time Firestore Sync with onSnapshot when user is active
  useEffect(() => {
    if (!user) {
      setIsSynced(false);
      return;
    }

    const uid = user.uid;
    let isInitialTasks = true;
    let isInitialHabits = true;
    let isInitialBlocks = true;

    // 1. Tasks Listener
    const tasksPath = `users/${uid}/tasks`;
    const unsubTasks = onSnapshot(collection(db, 'users', uid, 'tasks'), async (snapshot) => {
      if (snapshot.empty && isInitialTasks) {
        // Seed default tasks for new user
        isInitialTasks = false;
        const seedTasks: Task[] = [
          { id: 't1', title: 'Loyihani yakunlash', date: todayStr, time: '10:00', priority: 'high', category: 'work', completed: false, isTopPriority: true, createdAt: Date.now() },
          { id: 't2', title: 'Kitob mutolaa qilish', date: todayStr, time: '19:00', priority: 'medium', category: 'study', completed: false, createdAt: Date.now() },
          { id: 't3', title: 'Sport bilan shug\'ullanish', date: todayStr, time: '18:00', priority: 'high', category: 'health', completed: false, isTopPriority: true, createdAt: Date.now() }
        ];
        for (const t of seedTasks) {
          try {
            await setDoc(doc(db, 'users', uid, 'tasks', t.id), { ...t, userId: uid });
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `${tasksPath}/${t.id}`);
          }
        }
        return;
      }
      isInitialTasks = false;

      const loadedTasks: Task[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          date: data.date || '',
          time: data.time || undefined,
          priority: data.priority || 'medium',
          category: data.category || 'other',
          completed: !!data.completed,
          notes: data.notes || undefined,
          reminder: data.reminder || undefined,
          createdAt: data.createdAt || Date.now(),
          isTopPriority: !!data.isTopPriority,
        };
      });
      setTasksState(loadedTasks);
      setIsSynced(true);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, tasksPath);
    });

    // 2. Habits Listener
    const habitsPath = `users/${uid}/habits`;
    const unsubHabits = onSnapshot(collection(db, 'users', uid, 'habits'), async (snapshot) => {
      if (snapshot.empty && isInitialHabits) {
        isInitialHabits = false;
        const seedHabits: Habit[] = [
          { id: 'h1', name: 'Suv ichish (2L)', icon: '💧', frequency: ['daily'], completedDates: [], currentStreak: 0, bestStreak: 0, createdAt: Date.now() },
          { id: 'h2', name: 'Kunlik kitobxonlik', icon: '📚', frequency: ['daily'], completedDates: [], currentStreak: 0, bestStreak: 0, createdAt: Date.now() }
        ];
        for (const h of seedHabits) {
          try {
            await setDoc(doc(db, 'users', uid, 'habits', h.id), { ...h, userId: uid });
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `${habitsPath}/${h.id}`);
          }
        }
        return;
      }
      isInitialHabits = false;

      const loadedHabits: Habit[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || '',
          icon: data.icon || '📌',
          frequency: data.frequency || ['daily'],
          completedDates: data.completedDates || [],
          currentStreak: data.currentStreak || 0,
          bestStreak: data.bestStreak || 0,
          createdAt: data.createdAt || Date.now(),
        };
      });
      setHabitsState(loadedHabits);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, habitsPath);
    });

    // 3. TimeBlocks Listener
    const blocksPath = `users/${uid}/timeBlocks`;
    const unsubBlocks = onSnapshot(collection(db, 'users', uid, 'timeBlocks'), async (snapshot) => {
      if (snapshot.empty && isInitialBlocks) {
        isInitialBlocks = false;
        const seedBlocks: TimeBlock[] = [
          { id: 'tb1', date: todayStr, startTime: '09:00', endTime: '11:00', title: 'Chuqur ish vaqti', category: 'work' },
          { id: 'tb2', date: todayStr, startTime: '13:00', endTime: '14:00', title: 'Tushlik tanaffusi', category: 'other' }
        ];
        for (const b of seedBlocks) {
          try {
            await setDoc(doc(db, 'users', uid, 'timeBlocks', b.id), { ...b, userId: uid });
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `${blocksPath}/${b.id}`);
          }
        }
        return;
      }
      isInitialBlocks = false;

      const loadedBlocks: TimeBlock[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          date: data.date || '',
          startTime: data.startTime || '09:00',
          endTime: data.endTime || '10:00',
          title: data.title || '',
          category: data.category || 'other',
          notes: data.notes || undefined,
        };
      });
      setTimeBlocksState(loadedBlocks);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, blocksPath);
    });

    // 4. Daily Notes Listener
    const notesPath = `users/${uid}/notes`;
    const unsubNotes = onSnapshot(collection(db, 'users', uid, 'notes'), (snapshot) => {
      const loadedNotes: DailyNote[] = snapshot.docs.map(d => ({
        date: d.id,
        content: d.data().content || '',
      }));
      setNotesState(loadedNotes);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, notesPath);
    });

    // 5. Daily Reviews Listener
    const reviewsPath = `users/${uid}/reviews`;
    const unsubReviews = onSnapshot(collection(db, 'users', uid, 'reviews'), (snapshot) => {
      const loadedReviews: DailyReview[] = snapshot.docs.map(d => ({
        date: d.id,
        achievements: d.data().achievements || '',
        improvements: d.data().improvements || '',
        tomorrowPriority: d.data().tomorrowPriority || '',
      }));
      setReviewsState(loadedReviews);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, reviewsPath);
    });

    return () => {
      unsubTasks();
      unsubHabits();
      unsubBlocks();
      unsubNotes();
      unsubReviews();
    };
  }, [user, todayStr]);

  // Sync helpers to perform exact diff writes/deletes to Firestore
  const syncTasksToFirestore = async (nextTasks: Task[], prevTasks: Task[]) => {
    if (!user) return;
    const uid = user.uid;
    const currentMap = new Map(prevTasks.map(t => [t.id, t]));
    const nextMap = new Map(nextTasks.map(t => [t.id, t]));

    for (const task of nextTasks) {
      const old = currentMap.get(task.id);
      if (!old || JSON.stringify(old) !== JSON.stringify(task)) {
        const path = `users/${uid}/tasks/${task.id}`;
        try {
          await setDoc(doc(db, 'users', uid, 'tasks', task.id), {
            id: task.id,
            userId: uid,
            title: task.title,
            date: task.date,
            time: task.time || '',
            priority: task.priority,
            category: task.category,
            completed: !!task.completed,
            notes: task.notes || '',
            reminder: !!task.reminder,
            createdAt: task.createdAt || Date.now(),
            isTopPriority: !!task.isTopPriority
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
    }

    for (const [id] of currentMap) {
      if (!nextMap.has(id)) {
        const path = `users/${uid}/tasks/${id}`;
        try {
          await deleteDoc(doc(db, 'users', uid, 'tasks', id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      }
    }
  };

  const syncHabitsToFirestore = async (nextHabits: Habit[], prevHabits: Habit[]) => {
    if (!user) return;
    const uid = user.uid;
    const currentMap = new Map(prevHabits.map(h => [h.id, h]));
    const nextMap = new Map(nextHabits.map(h => [h.id, h]));

    for (const habit of nextHabits) {
      const old = currentMap.get(habit.id);
      if (!old || JSON.stringify(old) !== JSON.stringify(habit)) {
        const path = `users/${uid}/habits/${habit.id}`;
        try {
          await setDoc(doc(db, 'users', uid, 'habits', habit.id), {
            id: habit.id,
            userId: uid,
            name: habit.name,
            icon: habit.icon,
            frequency: habit.frequency || ['daily'],
            completedDates: habit.completedDates || [],
            currentStreak: habit.currentStreak || 0,
            bestStreak: habit.bestStreak || 0,
            createdAt: habit.createdAt || Date.now()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
    }

    for (const [id] of currentMap) {
      if (!nextMap.has(id)) {
        const path = `users/${uid}/habits/${id}`;
        try {
          await deleteDoc(doc(db, 'users', uid, 'habits', id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      }
    }
  };

  const syncTimeBlocksToFirestore = async (nextBlocks: TimeBlock[], prevBlocks: TimeBlock[]) => {
    if (!user) return;
    const uid = user.uid;
    const currentMap = new Map(prevBlocks.map(b => [b.id, b]));
    const nextMap = new Map(nextBlocks.map(b => [b.id, b]));

    for (const block of nextBlocks) {
      const old = currentMap.get(block.id);
      if (!old || JSON.stringify(old) !== JSON.stringify(block)) {
        const path = `users/${uid}/timeBlocks/${block.id}`;
        try {
          await setDoc(doc(db, 'users', uid, 'timeBlocks', block.id), {
            id: block.id,
            userId: uid,
            date: block.date,
            startTime: block.startTime,
            endTime: block.endTime,
            title: block.title,
            category: block.category,
            notes: block.notes || ''
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
    }

    for (const [id] of currentMap) {
      if (!nextMap.has(id)) {
        const path = `users/${uid}/timeBlocks/${id}`;
        try {
          await deleteDoc(doc(db, 'users', uid, 'timeBlocks', id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      }
    }
  };

  const syncNotesToFirestore = async (nextNotes: DailyNote[], prevNotes: DailyNote[]) => {
    if (!user) return;
    const uid = user.uid;
    const currentMap = new Map(prevNotes.map(n => [n.date, n]));
    const nextMap = new Map(nextNotes.map(n => [n.date, n]));

    for (const note of nextNotes) {
      const old = currentMap.get(note.date);
      if (!old || JSON.stringify(old) !== JSON.stringify(note)) {
        const path = `users/${uid}/notes/${note.date}`;
        try {
          await setDoc(doc(db, 'users', uid, 'notes', note.date), {
            date: note.date,
            userId: uid,
            content: note.content || ''
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
    }

    for (const [date] of currentMap) {
      if (!nextMap.has(date)) {
        const path = `users/${uid}/notes/${date}`;
        try {
          await deleteDoc(doc(db, 'users', uid, 'notes', date));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      }
    }
  };

  const syncReviewsToFirestore = async (nextReviews: DailyReview[], prevReviews: DailyReview[]) => {
    if (!user) return;
    const uid = user.uid;
    const currentMap = new Map(prevReviews.map(r => [r.date, r]));
    const nextMap = new Map(nextReviews.map(r => [r.date, r]));

    for (const review of nextReviews) {
      const old = currentMap.get(review.date);
      if (!old || JSON.stringify(old) !== JSON.stringify(review)) {
        const path = `users/${uid}/reviews/${review.date}`;
        try {
          await setDoc(doc(db, 'users', uid, 'reviews', review.date), {
            date: review.date,
            userId: uid,
            achievements: review.achievements || '',
            improvements: review.improvements || '',
            tomorrowPriority: review.tomorrowPriority || ''
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
    }

    for (const [date] of currentMap) {
      if (!nextMap.has(date)) {
        const path = `users/${uid}/reviews/${date}`;
        try {
          await deleteDoc(doc(db, 'users', uid, 'reviews', date));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      }
    }
  };

  // State setters that sync to Firestore
  const setTasks: React.Dispatch<React.SetStateAction<Task[]>> = (action) => {
    setTasksState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      syncTasksToFirestore(next, prev);
      return next;
    });
  };

  const setHabits: React.Dispatch<React.SetStateAction<Habit[]>> = (action) => {
    setHabitsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      syncHabitsToFirestore(next, prev);
      return next;
    });
  };

  const setTimeBlocks: React.Dispatch<React.SetStateAction<TimeBlock[]>> = (action) => {
    setTimeBlocksState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      syncTimeBlocksToFirestore(next, prev);
      return next;
    });
  };

  const setNotes: React.Dispatch<React.SetStateAction<DailyNote[]>> = (action) => {
    setNotesState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      syncNotesToFirestore(next, prev);
      return next;
    });
  };

  const setReviews: React.Dispatch<React.SetStateAction<DailyReview[]>> = (action) => {
    setReviewsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      syncReviewsToFirestore(next, prev);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <PlannerContext.Provider value={{
      tasks, setTasks,
      habits, setHabits,
      timeBlocks, setTimeBlocks,
      notes, setNotes,
      reviews, setReviews,
      isDarkMode, toggleTheme,
      user, loadingAuth,
      loginWithGoogle,
      logout: logoutUser,
      isSynced
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
