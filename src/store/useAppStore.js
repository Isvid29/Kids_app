import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_TASKS, SAVINGS_GOALS_DEFAULT, SPLIT } from '../utils/constants';

function dateKey(d) { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
function today() { return new Date(); }

export const useAppStore = create(
  persist(
    (set, get) => ({
      // State
      tasks: DEFAULT_TASKS,
      completions: {},
      totalPoints: 0,
      totalEuros: 0,
      streak: 0,
      lastStreakDate: null,
      savingsGoals: SAVINGS_GOALS_DEFAULT,
      transactions: [],
      wallet: { spend: 0, save: 0, invest: 0 },
      parentPin: "1234",
      childName: "Lia",

      // Actions
      setChildName: (name) => set({ childName: name }),
      setParentPin: (pin) => set({ parentPin: pin }),
      
      addTask: (task) => set(state => ({ tasks: [...state.tasks, { ...task, id: "t"+Date.now(), fixed: false }] })),
      deleteTask: (id) => set(state => ({ tasks: state.tasks.filter(t => t.id !== id) })),

      addGoal: (goal) => set(state => ({ savingsGoals: [...state.savingsGoals, { ...goal, id: "g"+Date.now(), saved: 0 }] })),
      
      fundGoal: (goalId, amount) => {
        const { wallet, savingsGoals } = get();
        if (wallet.save < amount) return false;
        
        const newGoals = savingsGoals.map(g => g.id === goalId ? { ...g, saved: Math.min(g.saved + amount, g.target) } : g);
        const newWallet = { ...wallet, save: wallet.save - amount };
        
        set({ savingsGoals: newGoals, wallet: newWallet });
        return true;
      },

      recordSpend: (amount, note) => {
        const { wallet, transactions } = get();
        if (amount <= 0 || amount > wallet.spend) return false;
        
        const newWallet = { ...wallet, spend: wallet.spend - amount };
        const tx = { id: Date.now(), date: new Date().toISOString(), desc: note || "Gasto", euros: -amount, type: "spend" };
        
        set({
          wallet: newWallet,
          transactions: [tx, ...transactions].slice(0, 100)
        });
        return true;
      },

      awardTask: (task, date) => {
        const state = get();
        const newPoints = state.totalPoints + task.points;
        const newEuros = state.totalEuros + task.euros;
        const split = {
          spend: state.wallet.spend + task.euros * SPLIT.spend / 100,
          save:  state.wallet.save  + task.euros * SPLIT.save  / 100,
          invest: state.wallet.invest + task.euros * SPLIT.invest / 100,
        };
        
        const tx = { id: Date.now(), date: new Date().toISOString(), desc: task.name, euros: task.euros, points: task.points, type: "income" };
        
        // Streak logic
        let newStreak = state.streak;
        let newLastStreakDate = state.lastStreakDate;
        const todayStr = dateKey(today());
        
        if (state.lastStreakDate !== todayStr) {
          const yesterday = new Date(); 
          yesterday.setDate(yesterday.getDate() - 1);
          newStreak = state.lastStreakDate === dateKey(yesterday) ? state.streak + 1 : 1;
          newLastStreakDate = todayStr;
        }

        set({
          totalPoints: newPoints,
          totalEuros: newEuros,
          wallet: split,
          transactions: [tx, ...state.transactions].slice(0, 100),
          streak: newStreak,
          lastStreakDate: newLastStreakDate
        });
      },

      completeTask: (taskId, date) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        const key = `${taskId}_${dateKey(date)}`;
        const existing = state.completions[key];
        if (existing?.done) return false;

        const newComp = task.needsApproval
          ? { done: false, pendingApproval: true, approved: false }
          : { done: true, pendingApproval: false, approved: true };

        set({ completions: { ...state.completions, [key]: newComp } });

        if (!task.needsApproval) {
          get().awardTask(task, date);
          return { autoApproved: true, task };
        }
        return { autoApproved: false };
      },

      approveTask: (taskId, dateStr) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const key = `${taskId}_${dateStr}`;
        set({ completions: { ...state.completions, [key]: { done: true, pendingApproval: false, approved: true } } });
        
        const d = new Date(dateStr.replace(/-/g, '/') + " 00:00:00");
        get().awardTask(task, d);
      },

      rejectTask: (taskId, dateStr) => {
        const key = `${taskId}_${dateStr}`;
        set(state => ({
          completions: { ...state.completions, [key]: { done: false, pendingApproval: false, approved: false, rejected: true } }
        }));
      }

    }),
    {
      name: 'kids-app-storage', // key in localStorage
    }
  )
);
