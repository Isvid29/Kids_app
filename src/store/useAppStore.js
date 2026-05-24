import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_TASKS, SAVINGS_GOALS_DEFAULT, SPLIT } from '../utils/constants';

function dateKey(d) {
  const dateObj = new Date(d);
  return `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
}
function today() { return new Date(); }

export const useAppStore = create(
  persist(
    (set, get) => ({
      // State
      tasks: DEFAULT_TASKS,
      completions: {},
      totalPoints: 0,
      streak: 0,
      lastStreakDate: null,
      savingsGoals: SAVINGS_GOALS_DEFAULT,
      spendingGoals: [],
      transactions: [],
      wallet: { spend: 0.00, save: 0.00, invest: 0.00 },
      parentPin: "1234",
      childName: "Lia",
      weeklyNotes: {},
      monthlyTarget: 1000, // scaled points
      monthlyAllowance: 20.00, // default Euros monthly allowance
      
      // Cosmetics
      equippedAvatar: "/avatar_lia.png",
      equippedBg: "bg-gradient-to-br from-brand-blue to-brand-blueD",
      pointMultiplier: 1.0,
      multiplierExpiry: null,

      // Finance & Loans
      loans: [],

      // Family Tasks
      familyTasks: [],
      familyPoints: 0,

      // 5 Interactive Weekly Challenges
      challenges: [
        { id: "c1", name: "Operación Relámpago", desc: "Completar 3 tareas usando el temporizador visual en menos de 5 minutos cada una.", reward: "Insignia 'Velocidad de la Luz' y +100 Puntos", points: 100, progress: 0, target: 3, completed: false, badge: "⚡ Velocidad de la Luz", type: "timer" },
        { id: "c2", name: "El Guardián del Orden", desc: "Mantener la habitación recogida (validado con foto) durante 5 días de la semana.", reward: "+150 Puntos", points: 150, progress: 0, target: 5, completed: false, type: "photo_consecutive" },
        { id: "c3", name: "Misión Eco-Familia", desc: "Encargarse del reciclaje (plástico, papel, vidrio) todos los días de la semana.", reward: "Icono ecológico y +120 Puntos", points: 120, progress: 0, target: 7, completed: false, type: "eco" },
        { id: "c4", name: "Ayudante Estrella", desc: "Realizar 3 tareas de ayuda familiar que no estén en tu lista semanal original.", reward: "+200 Puntos", points: 200, progress: 0, target: 3, completed: false, type: "help" },
        { id: "c5", name: "Rutina Perfecta", desc: "Completar el 100% de tus tareas de higiene de lunes a domingo sin fallar ningún día.", reward: "+250 Puntos", points: 250, progress: 0, target: 7, completed: false, type: "hygiene" }
      ],

      // Actions
      setChildName: (name) => set({ childName: name }),
      setParentPin: (pin) => set({ parentPin: pin }),
      setMonthlyAllowance: (amt) => set({ monthlyAllowance: parseFloat(amt) || 0.00 }),
      
      equipReward: (type, value, days = 7) => set(state => {
        if (type === 'avatar') return { equippedAvatar: value };
        if (type === 'bg') return { equippedBg: value };
        if (type === 'multiplier') {
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + days);
          return { pointMultiplier: value, multiplierExpiry: expiry.toISOString() };
        }
        return {};
      }),

      addTask: (task) => set(state => ({ tasks: [...state.tasks, { icon: "⭐", rewardType: "points", points: 20, euros: 0.00, needsApproval: true, ...task, id: "t"+Date.now(), fixed: false }] })),
      deleteTask: (id) => set(state => ({ tasks: state.tasks.filter(t => t.id !== id) })),
      updateTaskIcon: (id, icon) => set(state => ({ tasks: state.tasks.map(t => t.id === id ? { ...t, icon } : t) })),
      
      updateTask: (id, updates) => set(state => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      })),

      addGoal: (goal) => set(state => ({ savingsGoals: [...state.savingsGoals, { ...goal, id: "g"+Date.now(), saved: 0.00 }] })),
      
      editGoal: (id, updates) => set(state => ({
        savingsGoals: state.savingsGoals.map(g => g.id === id ? { ...g, ...updates } : g)
      })),

      deleteGoal: (id) => set(state => ({
        savingsGoals: state.savingsGoals.filter(g => g.id !== id)
      })),

      fundGoal: (goalId, amount) => {
        const { wallet, savingsGoals } = get();
        const amt = parseFloat(amount);
        if (isNaN(amt) || wallet.save < amt) return false;
        
        const newGoals = savingsGoals.map(g => g.id === goalId ? { ...g, saved: parseFloat(Math.min(g.saved + amt, g.target).toFixed(2)) } : g);
        const newWallet = { ...wallet, save: parseFloat((wallet.save - amt).toFixed(2)) };
        
        set({ savingsGoals: newGoals, wallet: newWallet });
        return true;
      },

      // Spending Goals CRUD
      addSpendingGoal: (goal) => set(state => ({ spendingGoals: [...state.spendingGoals, { ...goal, id: "sg"+Date.now(), saved: 0.00 }] })),
      
      editSpendingGoal: (id, updates) => set(state => ({
        spendingGoals: state.spendingGoals.map(g => g.id === id ? { ...g, ...updates } : g)
      })),

      deleteSpendingGoal: (id) => set(state => ({
        spendingGoals: state.spendingGoals.filter(g => g.id !== id)
      })),

      fundSpendingGoal: (goalId, amount) => {
        const { wallet, spendingGoals } = get();
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) return false;
        // Allow negative spend wallet (as per Bro penalty behaviour)
        const newGoals = spendingGoals.map(g => g.id === goalId ? { ...g, saved: parseFloat(Math.min(g.saved + amt, g.target).toFixed(2)) } : g);
        const newWallet = { ...wallet, spend: parseFloat((wallet.spend - amt).toFixed(2)) };
        const tx = { id: Date.now(), date: new Date().toISOString(), desc: `Reserva gasto: ${spendingGoals.find(g=>g.id===goalId)?.name}`, euros: -amt, type: "spend" };
        set({ spendingGoals: newGoals, wallet: newWallet, transactions: [tx, ...get().transactions].slice(0,100) });
        return true;
      },

      applyInterestToGoal: (goalId, ratePct) => {
        const { savingsGoals, transactions } = get();
        const goal = savingsGoals.find(g => g.id === goalId);
        if (!goal || goal.saved <= 0) return false;
        
        const interestAmount = parseFloat((goal.saved * (ratePct / 100)).toFixed(2));
        if (interestAmount <= 0) return false;
        
        const newGoals = savingsGoals.map(g => g.id === goalId ? { ...g, saved: parseFloat(Math.min(g.saved + interestAmount, g.target).toFixed(2)) } : g);
        const tx = { id: Date.now(), date: new Date().toISOString(), desc: `Interés (+${ratePct}%) en ${goal.name}`, euros: interestAmount, type: "income" };
        set({ savingsGoals: newGoals, transactions: [tx, ...transactions].slice(0,100) });
        return true;
      },

      addLoan: (amount, note) => {
        const { wallet, loans, transactions } = get();
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) return false;

        const newLoan = { id: "l"+Date.now(), amount: amt, remaining: amt, note, date: new Date().toISOString() };
        const newWallet = { ...wallet, spend: parseFloat((wallet.spend + amt).toFixed(2)) };
        const tx = { id: Date.now(), date: new Date().toISOString(), desc: `Préstamo: ${note}`, euros: amt, type: "loan" };
        
        set({ loans: [...loans, newLoan], wallet: newWallet, transactions: [tx, ...transactions].slice(0,100) });
        return true;
      },

      repayLoan: (loanId, amount) => {
        const { wallet, loans, transactions } = get();
        const loan = loans.find(l => l.id === loanId);
        if (!loan) return false;
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0 || wallet.spend < amt) return false; // Needs funds in spend to repay manually

        const newRemaining = parseFloat((loan.remaining - amt).toFixed(2));
        const newLoans = newRemaining <= 0 ? loans.filter(l => l.id !== loanId) : loans.map(l => l.id === loanId ? { ...l, remaining: newRemaining } : l);
        const newWallet = { ...wallet, spend: parseFloat((wallet.spend - amt).toFixed(2)) };
        const tx = { id: Date.now(), date: new Date().toISOString(), desc: `Pago Préstamo: ${loan.note}`, euros: -amt, type: "spend" };

        set({ loans: newLoans, wallet: newWallet, transactions: [tx, ...transactions].slice(0,100) });
        return true;
      },

      // Ledger: Expenses and Incomes (Euros based)
      recordSpend: (amount, note, walletType = "spend") => {
        const { wallet, transactions } = get();
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0 || amt > wallet[walletType]) return false;
        
        const newWallet = { ...wallet, [walletType]: parseFloat((wallet[walletType] - amt).toFixed(2)) };
        const tx = { id: Date.now(), date: new Date().toISOString(), desc: `${note} (${walletType === 'spend' ? 'Gasto' : walletType === 'save' ? 'Ahorro' : 'Inversión'})`, euros: -amt, type: "spend" };
        
        set({
          wallet: newWallet,
          transactions: [tx, ...transactions].slice(0, 100)
        });
        return true;
      },

      addBroPenalty: () => {
        const { wallet, transactions } = get();
        const newWallet = { ...wallet, spend: parseFloat((wallet.spend - 1.00).toFixed(2)) };
        const tx = { id: Date.now(), date: new Date().toISOString(), desc: "Bro (Penalización)", euros: -1.00, type: "spend" };
        set({
          wallet: newWallet,
          transactions: [tx, ...transactions].slice(0, 100)
        });
        return true;
      },

      deleteTransaction: (txId) => {
        const { transactions, wallet } = get();
        const tx = transactions.find(t => t.id === txId);
        if (!tx) return false;

        let newWallet = { ...wallet };
        
        // Only revert spend transactions to the 'spend' wallet for now (like Bro penalty)
        if (tx.euros !== undefined && tx.euros < 0 && tx.type === "spend") {
          newWallet.spend = parseFloat((newWallet.spend - tx.euros).toFixed(2));
        }

        set({
          transactions: transactions.filter(t => t.id !== txId),
          wallet: newWallet
        });
        return true;
      },

      recordIncome: (amount, note, walletType = "spend") => {
        const { wallet, transactions } = get();
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) return false;
        
        let newWallet = { ...wallet };
        if (walletType === "split") {
          const sp = parseFloat((amt * SPLIT.spend / 100).toFixed(2));
          const sa = parseFloat((amt * SPLIT.save / 100).toFixed(2));
          const inv = parseFloat((amt - sp - sa).toFixed(2));
          newWallet.spend = parseFloat((newWallet.spend + sp).toFixed(2));
          newWallet.save = parseFloat((newWallet.save + sa).toFixed(2));
          newWallet.invest = parseFloat((newWallet.invest + inv).toFixed(2));
        } else {
          newWallet[walletType] = parseFloat((newWallet[walletType] + amt).toFixed(2));
        }

        const tx = { id: Date.now(), date: new Date().toISOString(), desc: note, euros: amt, type: "income" };
        
        set({
          wallet: newWallet,
          transactions: [tx, ...transactions].slice(0, 100)
        });
        return true;
      },

      // Parents Paying Allowance in Euros, resetting points
      payAllowance: (amount, note = "Paga Mensual") => {
        const { recordIncome } = get();
        const success = recordIncome(amount, note, "split");
        if (success) {
          set({ totalPoints: 0 }); // reset points monthly cycle
          return true;
        }
        return false;
      },

      ajusteManual: (amount, reason) => {
        const { wallet, transactions } = get();
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt === 0) return false;

        if (amt > 0) {
          return get().recordIncome(amt, `Ajuste: ${reason}`, "split");
        } else {
          // Negative adjustment
          const deduction = Math.abs(amt);
          const sp = parseFloat((deduction * SPLIT.spend / 100).toFixed(2));
          const sa = parseFloat((deduction * SPLIT.save / 100).toFixed(2));
          const inv = parseFloat((deduction - sp - sa).toFixed(2));

          const newWallet = {
            spend: parseFloat((wallet.spend - sp).toFixed(2)),
            save: parseFloat((wallet.save - sa).toFixed(2)),
            invest: parseFloat((wallet.invest - inv).toFixed(2))
          };

          const tx = { 
            id: Date.now(), 
            date: new Date().toISOString(), 
            desc: `Ajuste: ${reason}`, 
            euros: -deduction, 
            type: "spend" 
          };

          set({
            wallet: newWallet,
            transactions: [tx, ...transactions].slice(0, 100)
          });
          return true;
        }
      },

      // Advance specific challenges
      advanceChallengeProgress: (type, amount = 1) => {
        const { challenges } = get();
        const newChallenges = challenges.map(c => {
          if (c.type === type && !c.completed) {
            const nextProgress = Math.min(c.target, c.progress + amount);
            const isCompletedNow = nextProgress >= c.target;
            
            if (isCompletedNow) {
              // Award challenge bonus points
              setTimeout(() => {
                const { totalPoints, transactions } = get();
                const tx = { id: Date.now(), date: new Date().toISOString(), desc: `🏆 Desafío: ${c.name}`, points: c.points, type: "income" };
                set({
                  totalPoints: totalPoints + c.points,
                  transactions: [tx, ...transactions].slice(0, 100)
                });
              }, 100);
            }
            return { ...c, progress: nextProgress, completed: isCompletedNow };
          }
          return c;
        });
        set({ challenges: newChallenges });
      },

      // Verification to reset streak if missed days
      verifyStreakReset: () => {
        const { lastStreakDate, streak } = get();
        if (!lastStreakDate || streak === 0) return;
        
        const todayStr = dateKey(today());
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = dateKey(yesterday);
        
        if (lastStreakDate !== todayStr && lastStreakDate !== yesterdayStr) {
          set({ streak: 0 });
        }
      },

      checkStreak: (date) => {
        const state = get();
        const dateStr = dateKey(date);
        
        // Find tasks assigned for this day of week
        const dayOfWeek = date.getDay();
        const dayTasks = state.tasks.filter(t => t.days.includes(dayOfWeek));
        if (dayTasks.length === 0) return;

        // Check if all these tasks are finished & approved
        const allDone = dayTasks.every(t => {
          const comp = state.completions[`${t.id}_${dateStr}`];
          return comp?.done && comp?.approved;
        });

        if (allDone) {
          let newStreak = state.streak;
          let newLastStreakDate = state.lastStreakDate;
          const todayStr = dateKey(today());
          
          if (state.lastStreakDate !== todayStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = dateKey(yesterday);
            
            if (state.lastStreakDate === yesterdayStr) {
              newStreak = state.streak + 1;
            } else {
              newStreak = 1;
            }
            newLastStreakDate = todayStr;
            set({ streak: newStreak, lastStreakDate: newLastStreakDate });
          }
        }
      },

      awardTask: (task, date) => {
        const state = get();
        
        // Check reward type: Euros vs Points
        const isEurosReward = task.rewardType === "euros" || (task.euros > 0 && task.rewardType !== "points");
        
        if (isEurosReward) {
          const amt = parseFloat(task.euros) || 0.00;
          if (amt > 0) {
            const sp = parseFloat((amt * SPLIT.spend / 100).toFixed(2));
            const sa = parseFloat((amt * SPLIT.save / 100).toFixed(2));
            const inv = parseFloat((amt - sp - sa).toFixed(2));
            
            const newWallet = {
              spend: parseFloat((state.wallet.spend + sp).toFixed(2)),
              save: parseFloat((state.wallet.save + sa).toFixed(2)),
              invest: parseFloat((state.wallet.invest + inv).toFixed(2))
            };
            
            const tx = { 
              id: Date.now(), 
              date: new Date().toISOString(), 
              desc: `${task.name} 💰`, 
              euros: amt, 
              type: "income" 
            };
            
            set({
              wallet: newWallet,
              transactions: [tx, ...state.transactions].slice(0, 100)
            });
          }
        } else {
          // Points routines
          let finalPoints = task.points || 0;
          let isStreakApplied = state.streak >= 7;
          if (isStreakApplied) {
            const bonus = Math.max(1, Math.round(finalPoints * 0.05));
            finalPoints += bonus;
          }

          // Apply active point multiplier from Gamification Pass
          if (state.pointMultiplier > 1 && state.multiplierExpiry && new Date(state.multiplierExpiry) > new Date()) {
            finalPoints = Math.round(finalPoints * state.pointMultiplier);
          } else if (state.pointMultiplier > 1 && state.multiplierExpiry && new Date(state.multiplierExpiry) <= new Date()) {
            // Expired multiplier
            set({ pointMultiplier: 1.0, multiplierExpiry: null });
          }

          const newPoints = state.totalPoints + finalPoints;
          const tx = { 
            id: Date.now(), 
            date: new Date().toISOString(), 
            desc: task.name + (isStreakApplied ? " 🔥 (Racha +5%)" : ""), 
            points: finalPoints, 
            type: "income" 
          };
          
          set({
            totalPoints: newPoints,
            transactions: [tx, ...state.transactions].slice(0, 100)
          });
        }
      },

      completeTask: (taskId, date, photo = null) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        const key = `${taskId}_${dateKey(date)}`;
        const existing = state.completions[key];
        if (existing?.done) return false;

        const newComp = task.needsApproval
          ? { done: false, pendingApproval: true, approved: false, photo }
          : { done: true, pendingApproval: false, approved: true, photo };

        set({ completions: { ...state.completions, [key]: newComp } });

        if (!task.needsApproval) {
          get().awardTask(task, date);
          get().checkStreak(date);
          
          // Automated Weekly Challenges updates upon approval-free completions
          const nameLower = task.name.toLowerCase();
          if (nameLower.includes("recicla")) {
            get().advanceChallengeProgress("eco");
          }
          if (nameLower.includes("cuarto") || nameLower.includes("habitación")) {
            get().advanceChallengeProgress("photo_consecutive");
          }
          if (task.isHelperTask) {
            get().advanceChallengeProgress("help");
          }
          if (task.cat === "habitos") {
            get().advanceChallengeProgress("hygiene");
          }

          return { autoApproved: true, task };
        }
        return { autoApproved: false };
      },

      approveTask: (taskId, dateStr) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const key = `${taskId}_${dateStr}`;
        const currentComp = state.completions[key] || {};
        
        set({ completions: { ...state.completions, [key]: { ...currentComp, done: true, pendingApproval: false, approved: true } } });
        
        const d = new Date(dateStr.replace(/-/g, '/') + " 00:00:00");
        get().awardTask(task, d);
        get().checkStreak(d);

        // Automated Weekly Challenges updates upon approval
        const nameLower = task.name.toLowerCase();
        if (nameLower.includes("recicla")) {
          get().advanceChallengeProgress("eco");
        }
        if (nameLower.includes("cuarto") || nameLower.includes("habitación")) {
          get().advanceChallengeProgress("photo_consecutive");
        }
        if (task.isHelperTask) {
          get().advanceChallengeProgress("help");
        }
        if (task.cat === "habitos") {
          get().advanceChallengeProgress("hygiene");
        }
      },

      rejectTask: (taskId, dateStr, reasonNote = "") => {
        const key = `${taskId}_${dateStr}`;
        const state = get();
        const currentComp = state.completions[key] || {};
        
        set({
          completions: { 
            ...state.completions, 
            [key]: { ...currentComp, done: false, pendingApproval: false, approved: false, rejected: true, rejectionNote: reasonNote } 
          }
        });
      },

      setMonthlyTarget: (n) => set({ monthlyTarget: n }),

      // Interactive notes as objects { id, text, icon }
      addWeeklyNote: (weekKey, text, icon = "📌") => set(state => {
        const existingNotes = state.weeklyNotes[weekKey] || [];
        // Ensure legacy strings migration
        const normalized = existingNotes.map((n, i) => typeof n === 'string' ? { id: "leg_" + i, text: n, icon: "📌" } : n);
        
        const newNote = {
          id: "n_" + Date.now() + "_" + Math.floor(Math.random()*1000),
          text,
          icon
        };
        return {
          weeklyNotes: {
            ...state.weeklyNotes,
            [weekKey]: [...normalized, newNote]
          }
        };
      }),

      updateWeeklyNote: (weekKey, noteId, text, icon) => set(state => {
        const existingNotes = state.weeklyNotes[weekKey] || [];
        const normalized = existingNotes.map((n, i) => typeof n === 'string' ? { id: "leg_" + i, text: n, icon: "📌" } : n);
        
        const updated = normalized.map(n => n.id === noteId ? { ...n, text, icon } : n);
        return {
          weeklyNotes: {
            ...state.weeklyNotes,
            [weekKey]: updated
          }
        };
      }),

      removeWeeklyNote: (weekKey, noteId) => set(state => {
        const existingNotes = state.weeklyNotes[weekKey] || [];
        const normalized = existingNotes.map((n, i) => typeof n === 'string' ? { id: "leg_" + i, text: n, icon: "📌" } : n);
        
        const filtered = normalized.filter(n => n.id !== noteId);
        return {
          weeklyNotes: {
            ...state.weeklyNotes,
            [weekKey]: filtered
          }
        };
      }),

      // Family Tasks
      addFamilyTask: (task) => set(state => ({
        familyTasks: [...state.familyTasks, { ...task, id: "ft"+Date.now(), done: false }]
      })),

      deleteFamilyTask: (id) => set(state => ({
        familyTasks: state.familyTasks.filter(t => t.id !== id)
      })),

      completeFamilyTask: (id) => {
        const { familyTasks, familyPoints } = get();
        const task = familyTasks.find(t => t.id === id);
        if (!task || task.done) return false;

        const updatedTasks = familyTasks.map(t => t.id === id ? { ...t, done: true } : t);
        set({ familyTasks: updatedTasks, familyPoints: familyPoints + (task.points || 10) });
        return true;
      },

    }),
    {
      name: 'kids-app-storage', // key in localStorage
    }
  )
);

