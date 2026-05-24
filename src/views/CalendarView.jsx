import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIES, DAYS_ES, MONTHS_ES } from '../utils/constants';

const NOTE_ICONS = ["📌", "⚡", "💡", "🎯", "🚀", "🎮", "📚", "🔥", "⚠️", "✅"];

function getWeekDates(anchor) {
  const d = new Date(anchor);
  const day = d.getDay();
  const monday = new Date(d); 
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({length:7}, (_,i) => { const x=new Date(monday); x.setDate(monday.getDate()+i); return x; });
}
function isSameDay(a, b) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function getWeekKey(anchor) {
  const d = new Date(anchor);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return `${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}`;
}

export default function CalendarView() {
  const { tasks, completions, weeklyNotes, addWeeklyNote, removeWeeklyNote, updateWeeklyNote } = useAppStore();
  const [calendarWeek, setCalendarWeek] = useState(new Date());
  const todayDate = new Date();
  const [selectedDay, setSelectedDay] = useState(todayDate);
  const [noteInput, setNoteInput] = useState("");
  const [noteIcon, setNoteIcon] = useState("📌");
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  
  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingIcon, setEditingIcon] = useState("📌");
  const [showEditIconDropdown, setShowEditIconDropdown] = useState(false);
  
  const weekKey = getWeekKey(calendarWeek);
  
  // Ensure legacy string notes are normalized to objects
  const rawNotes = weeklyNotes[weekKey] || [];
  const notes = rawNotes.map((n, idx) => typeof n === 'string' ? { id: "leg_" + idx, text: n, icon: "📌" } : n);

  const handleAddNote = () => {
    const txt = noteInput.trim();
    if (!txt) return;
    addWeeklyNote(weekKey, txt, noteIcon);
    setNoteInput("");
    setNoteIcon("📌");
    setShowIconDropdown(false);
  };

  const handleSaveEdit = (noteId) => {
    const txt = editingText.trim();
    if (!txt) return;
    updateWeeklyNote(weekKey, noteId, txt, editingIcon);
    setEditingId(null);
    setEditingText("");
    setEditingIcon("📌");
    setShowEditIconDropdown(false);
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setEditingText(note.text);
    setEditingIcon(note.icon || "📌");
  };

  const weekDates = getWeekDates(calendarWeek);
  const prevWeek = () => { const d=new Date(calendarWeek); d.setDate(d.getDate()-7); setCalendarWeek(d); };
  const nextWeek = () => { const d=new Date(calendarWeek); d.setDate(d.getDate()+7); setCalendarWeek(d); };

  const getCompletion = (taskId, d) => completions[`${taskId}_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`];
  const dayTasks = tasks.filter(t => t.days.includes(selectedDay.getDay()));

  return (
    <div className="animate-slide-up pb-8 font-sans">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="m-0 text-brand-dark text-lg font-bold">📅 Semana</h2>
        <div className="flex gap-2">
          <button className="btn-primary bg-brand-purpleL border-none rounded-xl px-3 py-1.5 text-brand-dark font-bold text-sm" onClick={prevWeek}>◀</button>
          <button className="btn-primary bg-brand-purpleL border-none rounded-xl px-3 py-1.5 text-brand-dark font-bold text-sm" onClick={nextWeek}>▶</button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="flex gap-1.5 mb-4 justify-between">
        {weekDates.map((d,i) => {
          const dTasks = tasks.filter(t=>t.days.includes(d.getDay()));
          const doneTasks = dTasks.filter(t=>getCompletion(t.id,d)?.done);
          const isSelected = isSameDay(d, selectedDay);
          const isToday = isSameDay(d, todayDate);
          return (
            <button key={i} className="btn-primary flex-1 rounded-xl border-none py-2.5 px-1 text-center" onClick={()=>setSelectedDay(d)} style={{
              background: isSelected ? `linear-gradient(135deg,var(--color-brand-blue),var(--color-brand-blueD))` : isToday ? 'var(--color-brand-blueL)' : "white",
              boxShadow: isSelected ? `0 4px 12px rgba(59,130,246,0.25)` : "0 2px 6px rgba(0,0,0,0.06)",
              color: isSelected ? "white" : "var(--color-brand-dark)",
            }}>
              <div className="text-[11px] font-bold opacity-80">{DAYS_ES[d.getDay()]}</div>
              <div className="text-lg font-bold my-1">{d.getDate()}</div>
              <div className="text-[10px] opacity-80 font-bold">{dTasks.length>0 ? `${doneTasks.length}/${dTasks.length}` : "–"}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Chores */}
      <h3 className="text-brand-dark text-[15px] font-bold m-0 mb-2.5">
        {DAYS_ES[selectedDay.getDay()]} {selectedDay.getDate()} de {MONTHS_ES[selectedDay.getMonth()]}
      </h3>
      {dayTasks.length === 0 && <p className="text-brand-gray text-center p-5 font-bold">¡Día libre! 🎉</p>}
      
      {dayTasks.map(task => {
        const comp = getCompletion(task.id, selectedDay);
        const cat = CATEGORIES[task.cat];
        return (
          <div key={task.id} className="task-card rounded-xl p-2.5 px-3.5 mb-2 flex items-center gap-2.5 border-2 shadow-sm" style={{
            background: comp?.done ? 'var(--color-brand-cyanL)' : comp?.pendingApproval ? 'var(--color-brand-indigoL)' : comp?.rejected ? 'var(--color-brand-blueL)' : "white",
            borderColor: comp?.done ? 'var(--color-brand-cyan)' : comp?.pendingApproval ? 'var(--color-brand-indigo)' : comp?.rejected ? 'var(--color-brand-blue)' : 'var(--color-brand-blueL)',
          }}>
            <span className="text-2xl">{cat.icon}</span>
            <div className="flex-1">
              <div className={`font-bold text-brand-dark text-[14px] ${comp?.done ? "line-through opacity-60" : ""}`}>{task.name}</div>
              <div className="text-xs text-brand-gray font-bold mt-0.5">+{task.points} 🪙</div>
            </div>
            {comp?.done && <span className="text-xl">✅</span>}
            {comp?.pendingApproval && <span className="text-[13px] text-brand-indigo font-bold">⏳ Pendiente</span>}
            {comp?.rejected && <span className="text-[13px] text-brand-blueD font-bold">❌ Rechazado</span>}
          </div>
        );
      })}

      {/* Weekly personal notes - Dynamically placed below tasks list */}
      <div className="mt-6 border-t-2 border-brand-blueL pt-5">
        <h3 className="text-brand-dark text-[15px] font-bold m-0 mb-3 flex items-center gap-2">
          <span>📝</span> Notas de la semana
        </h3>
        
        {/* Note input container */}
        <div className="bg-white rounded-2xl p-3 border-2 border-brand-blueL shadow-sm mb-4">
          <div className="flex gap-2 items-center mb-2">
            <button 
              className="btn-primary w-9 h-9 rounded-xl border-none bg-brand-purpleL text-lg flex items-center justify-center cursor-pointer"
              onClick={() => setShowIconDropdown(!showIconDropdown)}
              title="Elegir Icono"
            >
              {noteIcon}
            </button>
            <input
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddNote()}
              placeholder="Añade una nota, recordatorio o plan..."
              className="flex-1 p-1 bg-transparent border-none text-sm focus:outline-none text-brand-dark"
            />
            <button
              className="btn-primary bg-gradient-to-br from-brand-cyan to-brand-teal border-none rounded-xl text-white px-3.5 py-2 font-bold text-[13px] shadow-sm"
              onClick={handleAddNote}
            >
              Añadir
            </button>
          </div>

          {/* Emoji selector dropdown */}
          {showIconDropdown && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-brand-cream rounded-xl mt-2 border border-brand-blueL animate-pop">
              {NOTE_ICONS.map(emoji => (
                <button
                  key={emoji}
                  className="btn-primary w-8 h-8 rounded-lg text-lg flex items-center justify-center bg-white border border-brand-blueL hover:bg-brand-purpleL cursor-pointer"
                  onClick={() => { setNoteIcon(emoji); setShowIconDropdown(false); }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes list */}
        {notes.length === 0 && <p className="text-brand-gray text-center text-sm py-4">¡Sin notas esta semana! Planifica tus retos. ✍️</p>}
        
        {notes.map((note) => {
          const isEditing = editingId === note.id;
          return (
            <div key={note.id} className="bg-white rounded-2xl p-3 px-3.5 mb-2.5 shadow-sm border-2 border-brand-purpleL flex flex-col gap-2 transition-all">
              {isEditing ? (
                // Editing state
                <div className="animate-pop">
                  <div className="flex gap-2 items-center mb-2">
                    <button 
                      className="btn-primary w-9 h-9 rounded-xl border-none bg-brand-purpleL text-lg flex items-center justify-center cursor-pointer"
                      onClick={() => setShowEditIconDropdown(!showEditIconDropdown)}
                    >
                      {editingIcon}
                    </button>
                    <input
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-brand-blueL text-sm text-brand-dark focus:outline-none"
                    />
                  </div>

                  {showEditIconDropdown && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-brand-cream rounded-xl mb-2 border border-brand-blueL">
                      {NOTE_ICONS.map(emoji => (
                        <button
                          key={emoji}
                          className="btn-primary w-8 h-8 rounded-lg text-lg flex items-center justify-center bg-white border border-brand-blueL hover:bg-brand-purpleL cursor-pointer"
                          onClick={() => { setEditingIcon(emoji); setShowEditIconDropdown(false); }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-1.5 justify-end">
                    <button 
                      className="btn-primary px-3 py-1.5 bg-brand-cream rounded-lg text-brand-gray border-none text-xs font-bold"
                      onClick={() => { setEditingId(null); setShowEditIconDropdown(false); }}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="btn-primary px-3 py-1.5 bg-gradient-to-br from-brand-blue to-brand-blueD rounded-lg text-white border-none text-xs font-bold shadow-sm"
                      onClick={() => handleSaveEdit(note.id)}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                // Display state
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{note.icon || "📌"}</span>
                  <span className="flex-1 text-brand-dark text-sm font-semibold">{note.text}</span>
                  <div className="flex gap-1">
                    <button
                      className="btn-primary bg-brand-purpleL border-none rounded-lg text-brand-purple px-2 py-1.5 text-xs font-bold"
                      onClick={() => startEditing(note)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-primary bg-brand-blueL border-none rounded-lg text-brand-blueD px-2 py-1.5 text-xs font-bold"
                      onClick={() => removeWeeklyNote(weekKey, note.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

