import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIES, DAYS_ES, MONTHS_ES } from '../utils/constants';

function getWeekDates(anchor) {
  const d = new Date(anchor);
  const day = d.getDay();
  const monday = new Date(d); 
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({length:7}, (_,i) => { const x=new Date(monday); x.setDate(monday.getDate()+i); return x; });
}
function isSameDay(a, b) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

export default function CalendarView() {
  const { tasks, completions } = useAppStore();
  const [calendarWeek, setCalendarWeek] = useState(new Date());
  const todayDate = new Date();
  const [selectedDay, setSelectedDay] = useState(todayDate);
  
  const weekDates = getWeekDates(calendarWeek);
  const prevWeek = () => { const d=new Date(calendarWeek); d.setDate(d.getDate()-7); setCalendarWeek(d); };
  const nextWeek = () => { const d=new Date(calendarWeek); d.setDate(d.getDate()+7); setCalendarWeek(d); };

  const getCompletion = (taskId, d) => completions[`${taskId}_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`];
  const dayTasks = tasks.filter(t => t.days.includes(selectedDay.getDay()));

  return (
    <div className="animate-slide-up pb-8">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="m-0 text-brand-dark text-lg">📅 Semana</h2>
        <div className="flex gap-2">
          <button className="btn-primary bg-brand-purpleL border-none rounded-xl px-3 py-1.5 text-brand-dark" onClick={prevWeek}>◀</button>
          <button className="btn-primary bg-brand-purpleL border-none rounded-xl px-3 py-1.5 text-brand-dark" onClick={nextWeek}>▶</button>
        </div>
      </div>

      <div className="flex gap-1.5 mb-4 justify-between">
        {weekDates.map((d,i) => {
          const dTasks = tasks.filter(t=>t.days.includes(d.getDay()));
          const doneTasks = dTasks.filter(t=>getCompletion(t.id,d)?.done);
          const isSelected = isSameDay(d, selectedDay);
          const isToday = isSameDay(d, todayDate);
          return (
            <button key={i} className="btn-primary flex-1 rounded-xl border-none py-2.5 px-1 text-center" onClick={()=>setSelectedDay(d)} style={{
              background: isSelected ? `linear-gradient(135deg,var(--color-brand-blue),var(--color-brand-blueD))` : isToday ? 'var(--color-brand-blueL)' : "white",
              boxShadow: isSelected ? `0 4px 12px rgba(255,143,171,0.4)` : "0 2px 6px rgba(0,0,0,0.06)",
              color: isSelected ? "white" : "var(--color-brand-dark)",
            }}>
              <div className="text-[11px] font-bold opacity-80">{DAYS_ES[d.getDay()]}</div>
              <div className="text-lg font-bold my-1">{d.getDate()}</div>
              <div className="text-[10px] opacity-80">{dTasks.length>0 ? `${doneTasks.length}/${dTasks.length}` : "–"}</div>
            </button>
          );
        })}
      </div>

      <h3 className="text-brand-dark text-[15px] m-0 mb-2.5">
        {DAYS_ES[selectedDay.getDay()]} {selectedDay.getDate()} de {MONTHS_ES[selectedDay.getMonth()]}
      </h3>
      {dayTasks.length === 0 && <p className="text-brand-gray text-center p-5">¡Día libre! 🎉</p>}
      
      {dayTasks.map(task => {
        const comp = getCompletion(task.id, selectedDay);
        const cat = CATEGORIES[task.cat];
        return (
          <div key={task.id} className="task-card rounded-xl p-2.5 px-3.5 mb-2 flex items-center gap-2.5 border-2" style={{
            background: comp?.done ? 'var(--color-brand-cyanL)' : comp?.pendingApproval ? 'var(--color-brand-indigoL)' : "white",
            borderColor: comp?.done ? 'var(--color-brand-cyan)' : comp?.pendingApproval ? 'var(--color-brand-indigo)' : 'var(--color-brand-blueL)',
          }}>
            <span className="text-2xl">{cat.icon}</span>
            <div className="flex-1">
              <div className={`font-bold text-brand-dark text-[14px] ${comp?.done ? "line-through" : ""}`}>{task.name}</div>
              <div className="text-xs text-brand-gray">+{task.euros.toFixed(2)}€ · +{task.points}⭐</div>
            </div>
            {comp?.done && <span className="text-xl">✅</span>}
            {comp?.pendingApproval && <span className="text-[13px] text-brand-teal font-bold">⏳</span>}
          </div>
        );
      })}
    </div>
  );
}
