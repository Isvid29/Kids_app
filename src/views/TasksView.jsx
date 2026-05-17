import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIES, DAYS_ES } from '../utils/constants';

function getWeekDates(anchor) {
  const d = new Date(anchor);
  const day = d.getDay();
  const monday = new Date(d); 
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({length:7}, (_,i) => { 
    const x = new Date(monday); 
    x.setDate(monday.getDate() + i); 
    return x; 
  });
}

function isSameDay(a, b) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

export default function TasksView({ showToast }) {
  const { tasks, completions, completeTask } = useAppStore();
  const [calendarWeek, setCalendarWeek] = useState(new Date());
  
  const weekDates = getWeekDates(calendarWeek);
  const todayDate = new Date();

  const prevWeek = () => { const d = new Date(calendarWeek); d.setDate(d.getDate()-7); setCalendarWeek(d); };
  const nextWeek = () => { const d = new Date(calendarWeek); d.setDate(d.getDate()+7); setCalendarWeek(d); };

  const getCompletion = (taskId, d) => {
    const key = `${taskId}_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    return completions[key];
  };

  const handleComplete = (task, d) => {
    const res = completeTask(task.id, d);
    if (!res) return;
    if (res.autoApproved) showToast(`¡Tarea completada! +${task.points}⭐`);
    else showToast("⏳ Esperando aprobación", "warning");
  };

  return (
    <div className="animate-slide-up pb-8">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="m-0 text-brand-dark text-lg">📋 Mis Tareas</h2>
        <div className="flex gap-2">
          <button className="btn-primary bg-brand-purpleL border-none rounded-xl px-3 py-1.5 text-brand-dark" onClick={prevWeek}>◀</button>
          <button className="btn-primary bg-brand-purpleL border-none rounded-xl px-3 py-1.5 text-brand-dark" onClick={nextWeek}>▶</button>
        </div>
      </div>

      {tasks.map(task => {
        const cat = CATEGORIES[task.cat];
        const activeDays = weekDates.filter(d => task.days.includes(d.getDay()));
        if (activeDays.length === 0) return null;
        
        return (
          <div key={task.id} className="task-card bg-white rounded-2xl p-3 px-3.5 mb-2.5 border-2 shadow-sm" style={{ borderColor: cat.bg }}>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-brand-dark text-[14px]">{task.name}</div>
                <div className="text-xs text-brand-gray mt-0.5">
                  <span className="px-2 py-0.5 rounded-lg font-bold mr-1" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
                  +{task.euros.toFixed(2)}€ · +{task.points}pts
                  {task.needsApproval && <span className="ml-1.5 text-brand-teal">✓ requiere aprobación</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-between">
              {weekDates.map((d, i) => {
                const active = task.days.includes(d.getDay());
                const comp = getCompletion(task.id, d);
                const isToday = isSameDay(d, todayDate);
                
                let bg = !active ? "#f0f0f0" : comp?.done ? "var(--color-brand-cyan)" : comp?.pendingApproval ? "var(--color-brand-indigo)" : comp?.rejected ? "var(--color-brand-blueL)" : isToday ? "var(--color-brand-blueL)" : "var(--color-brand-purpleL)";
                let color = !active ? "#ccc" : comp?.done ? "white" : isToday ? "var(--color-brand-blueD)" : "var(--color-brand-dark)";
                
                return (
                  <button key={i} className="btn-primary w-9 h-9 rounded-xl border-none text-xs font-bold flex items-center justify-center"
                    disabled={!active || comp?.done || comp?.pendingApproval}
                    onClick={() => { if(active && !comp?.done && !comp?.pendingApproval) handleComplete(task, d); }}
                    style={{
                      background: bg, color,
                      outline: isToday ? `2px solid var(--color-brand-blueD)` : "none",
                      cursor: active && !comp?.done && !comp?.pendingApproval ? "pointer" : "default",
                    }}>
                    {comp?.done ? "✅" : comp?.pendingApproval ? "⏳" : comp?.rejected ? "❌" : active ? DAYS_ES[d.getDay()].slice(0,1) : "·"}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
