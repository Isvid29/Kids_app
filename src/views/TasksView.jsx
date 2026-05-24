import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIES, DAYS_ES, MONTHS_ES } from '../utils/constants';

const MOCK_PHOTOS = {
  t1: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80",
  t2: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
  t3: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=400&q=80",
  t4: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80",
  t5: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80",
  t6: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
  t7: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&q=80",
  t8: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&q=80",
};

// Emoji picker options for task icons
const TASK_EMOJIS = [
  "🛏️","🧹","🍽️","📖","🚿","🎒","🧺","📚","🎮","💻",
  "🎧","📱","🏋️","🎨","🎵","🌿","🍳","🛒","🐕","🚴",
  "🏊","⚽","🎯","🔧","🧴","👕","🥗","☕","🎤","✍️",
];

// Emoji picker for notes
const NOTE_EMOJIS = ["📌","⚡","🔥","💡","📝","🎯","⚠️","✅","🚀","🌟","💎","🎵","📅","🔔","💬"];

function getWeekDates(anchor) {
  const d   = new Date(anchor);
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(mon);
    x.setDate(mon.getDate() + i);
    return x;
  });
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function TasksView({ showToast }) {
  const {
    tasks, completions, completeTask,
    weeklyNotes, addWeeklyNote, updateWeeklyNote, removeWeeklyNote,
    updateTaskIcon,
  } = useAppStore();

  const [calendarWeek, setCalendarWeek] = useState(new Date());
  const weekDates = getWeekDates(calendarWeek);
  const todayDate = new Date();

  const weekStart = weekDates[0];
  const weekEnd   = weekDates[6];
  const weekKey   = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
  const notes     = weeklyNotes[weekKey] || [];

  // Photo proof states
  const [photoTask,     setPhotoTask]     = useState(null);
  const [photoDate,     setPhotoDate]     = useState(null);
  const [cameraStream,  setCameraStream]  = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  // Emoji picker for task icon
  const [emojiPickerTaskId, setEmojiPickerTaskId] = useState(null);

  // Notes state
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteIcon, setNewNoteIcon] = useState('📌');
  const [editingNote, setEditingNote] = useState(null); // { id, text, icon }
  const [showNoteEmojiPicker, setShowNoteEmojiPicker] = useState(false);

  const prevWeek = () => { const d = new Date(calendarWeek); d.setDate(d.getDate() - 7); setCalendarWeek(d); };
  const nextWeek = () => { const d = new Date(calendarWeek); d.setDate(d.getDate() + 7); setCalendarWeek(d); };

  const getCompletion = (taskId, d) => {
    const key = `${taskId}_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    return completions[key];
  };

  const handleCompleteClick = (task, d) => {
    if (task.needsApproval) {
      setPhotoTask(task); setPhotoDate(d);
      setCapturedPhoto(null); setCameraStream(true);
    } else {
      executeTaskCompletion(task, d, null);
    }
  };

  const executeTaskCompletion = (task, d, photo = null) => {
    const res = completeTask(task.id, d, photo);
    if (!res) return;
    if (res.autoApproved) {
      showToast(`¡Tarea completada! ${task.rewardType === 'euros' ? `+${task.euros?.toFixed(2)} €` : `+${task.points} pts`}`);
    } else {
      showToast("⏳ Foto enviada para aprobación", "warning");
    }
    setPhotoTask(null); setPhotoDate(null); setCameraStream(false);
  };

  const simulatePhotoCapture = () => {
    const url = MOCK_PHOTOS[photoTask?.id] || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80";
    setCapturedPhoto(url);
    showToast("📸 Foto capturada!");
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    addWeeklyNote(weekKey, newNoteText.trim(), newNoteIcon);
    setNewNoteText('');
    setNewNoteIcon('📌');
    showToast("📝 Nota añadida");
  };

  const handleSaveEditNote = () => {
    if (!editingNote || !editingNote.text.trim()) return;
    updateWeeklyNote(weekKey, editingNote.id, editingNote.text, editingNote.icon);
    setEditingNote(null);
    showToast("✅ Nota actualizada");
  };

  return (
    <div className="animate-slide-up pb-10 font-sans">
      {/* Large Weekly Indicator Banner */}
      <div className="bg-gradient-to-r from-brand-blue to-brand-blueD rounded-2xl p-4 mb-5 text-white shadow-md relative overflow-hidden flex items-center justify-between">
        <div className="absolute -right-4 -top-4 text-6xl opacity-10 select-none">📅</div>
        <div className="relative z-10">
          <div className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-0.5">Semana Actual</div>
          <h2 className="m-0 text-lg font-black flex items-center gap-1.5">
            {weekStart.getDate()} {MONTHS_ES[weekStart.getMonth()].slice(0, 3)} 
            <span className="opacity-50 mx-1">—</span> 
            {weekEnd.getDate()} {MONTHS_ES[weekEnd.getMonth()].slice(0, 3)}
          </h2>
        </div>
        <div className="flex gap-1.5 relative z-10">
          <button className="btn-primary w-9 h-9 bg-white/20 hover:bg-white/30 border-none rounded-xl text-white font-bold flex items-center justify-center cursor-pointer transition-colors backdrop-blur-sm" onClick={prevWeek}>◀</button>
          <button className="btn-primary w-9 h-9 bg-white/20 hover:bg-white/30 border-none rounded-xl text-white font-bold flex items-center justify-center cursor-pointer transition-colors backdrop-blur-sm" onClick={nextWeek}>▶</button>
        </div>
      </div>

      <h2 className="m-0 text-brand-dark text-base font-bold mb-3 flex items-center gap-2">🎮 Mis Tareas</h2>

      {/* Task cards */}
      {tasks.map(task => {
        const cat        = CATEGORIES[task.cat];
        const activeDays = weekDates.filter(d => task.days.includes(d.getDay()));
        if (activeDays.length === 0) return null;
        const taskIcon = task.icon || cat?.icon || '⭐';

        return (
          <div key={task.id} className="task-card bg-white rounded-2xl p-3 px-3.5 mb-3 border-2 shadow-sm" style={{ borderColor: cat?.bg }}>
            <div className="flex items-center gap-2.5 mb-2.5">
              {/* Tappable icon to open emoji picker */}
              <button
                className="text-2xl bg-transparent border-none cursor-pointer p-0 leading-none relative"
                title="Cambiar icono"
                onClick={() => setEmojiPickerTaskId(emojiPickerTaskId === task.id ? null : task.id)}
              >
                {taskIcon}
                <span className="absolute -bottom-1 -right-1 text-[9px] bg-brand-purpleL rounded-full px-0.5 leading-none">✏️</span>
              </button>

              <div className="flex-1">
                <div className="font-bold text-brand-dark text-[14px]">{task.name}</div>
                <div className="text-xs text-brand-gray mt-0.5 font-bold flex items-center gap-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded-lg font-bold" style={{ background: cat?.bg, color: cat?.color }}>{cat?.label}</span>
                  {task.rewardType === 'euros' ? `+${task.euros?.toFixed(2)} € 💰` : `+${task.points} pts 🪙`}
                  {task.needsApproval && <span className="text-brand-indigo font-bold">📷 foto</span>}
                </div>
              </div>
            </div>

            {/* Inline emoji picker for this task */}
            {emojiPickerTaskId === task.id && (
              <div className="mb-2.5 p-2 bg-brand-cream rounded-xl border border-brand-blueL animate-pop">
                <div className="text-[10px] font-bold text-brand-gray uppercase mb-1.5">Elige un icono para esta tarea:</div>
                <div className="flex flex-wrap gap-1.5">
                  {TASK_EMOJIS.map(em => (
                    <button key={em}
                      className={`btn-primary w-8 h-8 rounded-lg text-lg flex items-center justify-center border-2 cursor-pointer transition-all ${taskIcon === em ? 'border-brand-blueD bg-brand-blueL' : 'border-transparent bg-white'}`}
                      onClick={() => { updateTaskIcon(task.id, em); setEmojiPickerTaskId(null); showToast("✨ Icono actualizado"); }}
                    >{em}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Day buttons */}
            <div className="flex gap-1.5 flex-wrap justify-between mb-2">
              {weekDates.map((d, i) => {
                const active  = task.days.includes(d.getDay());
                const comp    = getCompletion(task.id, d);
                const isToday = isSameDay(d, todayDate);

                const bg    = !active ? "#f0f0f0" : comp?.done ? "var(--color-brand-cyan)" : comp?.pendingApproval ? "var(--color-brand-indigo)" : comp?.rejected ? "var(--color-brand-blueL)" : isToday ? "var(--color-brand-blueL)" : "var(--color-brand-purpleL)";
                const color = !active ? "#ccc"     : comp?.done ? "white"                   : isToday ? "var(--color-brand-blueD)" : "var(--color-brand-dark)";

                return (
                  <button key={i}
                    className="btn-primary w-9 h-9 rounded-xl border-none text-xs font-bold flex items-center justify-center"
                    disabled={!active || comp?.done || comp?.pendingApproval}
                    onClick={() => { if (active && !comp?.done && !comp?.pendingApproval) handleCompleteClick(task, d); }}
                    style={{ background: bg, color, outline: isToday ? `2px solid var(--color-brand-blueD)` : "none", cursor: active && !comp?.done && !comp?.pendingApproval ? "pointer" : "default" }}
                  >
                    {comp?.done ? "✅" : comp?.pendingApproval ? "⏳" : comp?.rejected ? "❌" : active ? DAYS_ES[d.getDay()].slice(0, 1) : "·"}
                  </button>
                );
              })}
            </div>

            {/* Rejection notes */}
            {weekDates.map((d, i) => {
              const comp = getCompletion(task.id, d);
              if (task.days.includes(d.getDay()) && comp?.rejected && comp?.rejectionNote) {
                return (
                  <div key={`rn-${i}`} className="mt-1 bg-brand-blueL text-brand-blueD p-2 rounded-xl border border-brand-blue text-[11px] font-semibold animate-pop">
                    💬 <strong>{DAYS_ES[d.getDay()]}:</strong> {comp.rejectionNote}
                  </div>
                );
              }
              return null;
            })}
          </div>
        );
      })}

      {/* ─── Weekly Notes Section ─── */}
      <div className="mt-6 pt-5 border-t-2 border-brand-blueL">
        <h3 className="m-0 mb-3 text-brand-dark text-base font-bold flex items-center gap-2">
          <span>📝</span> Notas de la Semana
          <span className="text-[11px] font-normal text-brand-gray ml-1">
            ({weekStart.getDate()} {MONTHS_ES[weekStart.getMonth()].slice(0,3)} – {weekEnd.getDate()} {MONTHS_ES[weekEnd.getMonth()].slice(0,3)})
          </span>
        </h3>

        {/* Existing notes */}
        {notes.length === 0 && (
          <div className="text-center p-4 text-[11px] text-brand-gray font-semibold opacity-70 border-2 border-dashed border-brand-blueL rounded-xl mb-3">
            No hay notas para esta semana. ¡Añade una abajo!
          </div>
        )}

        {notes.map(n => (
          <div key={n.id} className="bg-white rounded-2xl p-3 px-3.5 mb-2 flex items-start gap-2.5 border border-brand-blueL shadow-sm">
            {editingNote?.id === n.id ? (
              /* Edit mode */
              <div className="flex-1">
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  {NOTE_EMOJIS.map(em => (
                    <button key={em}
                      className={`w-7 h-7 rounded-lg text-base flex items-center justify-center border cursor-pointer transition-all ${editingNote.icon === em ? 'border-brand-blueD bg-brand-blueL' : 'border-transparent bg-brand-cream'}`}
                      onClick={() => setEditingNote(en => ({ ...en, icon: em }))}
                    >{em}</button>
                  ))}
                </div>
                <input
                  className="w-full p-2 rounded-xl border-2 border-brand-blueL text-xs text-brand-dark focus:outline-none mb-2"
                  value={editingNote.text}
                  onChange={e => setEditingNote(en => ({ ...en, text: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSaveEditNote()}
                />
                <div className="flex gap-1.5">
                  <button className="btn-primary flex-1 py-1.5 bg-brand-cream border-none rounded-xl text-brand-gray font-bold text-xs cursor-pointer" onClick={() => setEditingNote(null)}>Cancelar</button>
                  <button className="btn-primary flex-1 py-1.5 bg-gradient-to-br from-brand-blue to-brand-blueD border-none rounded-xl text-white font-bold text-xs cursor-pointer" onClick={handleSaveEditNote}>Guardar</button>
                </div>
              </div>
            ) : (
              /* Display mode */
              <>
                <span className="text-xl mt-0.5 select-none">{n.icon}</span>
                <span className="flex-1 font-semibold text-brand-dark text-[13px] leading-snug pt-0.5">{n.text}</span>
                <div className="flex gap-1 flex-shrink-0">
                  <button className="btn-primary w-7 h-7 bg-brand-purpleL border-none rounded-lg text-xs cursor-pointer flex items-center justify-center" onClick={() => setEditingNote({ ...n })}>✏️</button>
                  <button className="btn-primary w-7 h-7 bg-brand-blueL border-none rounded-lg text-xs cursor-pointer flex items-center justify-center" onClick={() => { removeWeeklyNote(weekKey, n.id); showToast("🗑️ Nota eliminada"); }}>🗑️</button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add new note form */}
        <div className="bg-brand-cream rounded-2xl p-3.5 border-2 border-dashed border-brand-blueL mt-3">
          <div className="text-[11px] font-bold text-brand-gray uppercase mb-2">+ Añadir nota nueva:</div>

          {/* Emoji selector row */}
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {NOTE_EMOJIS.map(em => (
              <button key={em}
                className={`w-7 h-7 rounded-lg text-base flex items-center justify-center border cursor-pointer transition-all ${newNoteIcon === em ? 'border-brand-blueD bg-brand-blueL' : 'border-transparent bg-white'}`}
                onClick={() => setNewNoteIcon(em)}
              >{em}</button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              className="flex-1 p-2.5 rounded-xl border-2 border-brand-blueL text-xs text-brand-dark focus:outline-none bg-white"
              placeholder="Escribe tu nota aquí…"
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddNote()}
            />
            <button
              className="btn-primary px-4 py-2.5 bg-gradient-to-br from-brand-blue to-brand-blueD border-none rounded-xl text-white font-bold text-xs cursor-pointer shadow-sm flex-shrink-0"
              onClick={handleAddNote}
            >
              Añadir
            </button>
          </div>
        </div>
      </div>

      {/* Photo Capture Proof Modal */}
      {cameraStream && photoTask && photoDate && (
        <div className="fixed inset-0 bg-[#0F172ACC] flex items-center justify-center z-[2000] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full animate-pop text-center shadow-2xl">
            <h3 className="m-0 mb-2.5 text-brand-dark text-lg font-bold flex items-center justify-center gap-2">
              <span>📸</span> Prueba Gráfica ({DAYS_ES[photoDate.getDay()]})
            </h3>
            <p className="m-0 mb-4 text-xs text-brand-gray font-bold">
              Foto de: <strong>{photoTask.name}</strong>
            </p>

            <div className="bg-brand-cream aspect-video rounded-2xl border-4 border-brand-blueL mb-4 overflow-hidden flex items-center justify-center">
              {capturedPhoto
                ? <img src={capturedPhoto} alt="Captured proof" className="w-full h-full object-cover animate-fade-in" />
                : (
                  <div className="flex flex-col items-center text-brand-gray animate-pulse">
                    <span className="text-4xl mb-2">📷</span>
                    <div className="text-[10px] font-bold uppercase tracking-wider">Simulador de Cámara</div>
                  </div>
                )
              }
            </div>

            <div className="flex flex-col gap-2">
              {!capturedPhoto ? (
                <>
                  <button className="btn-primary w-full py-3 bg-gradient-to-br from-brand-purple to-brand-indigo border-none rounded-xl text-white font-bold text-sm shadow-md cursor-pointer" onClick={simulatePhotoCapture}>
                    📸 Capturar Prueba
                  </button>
                  <label className="btn-primary w-full py-2.5 bg-brand-purpleL border-none rounded-xl text-brand-purple font-bold text-xs flex items-center justify-center cursor-pointer shadow-sm">
                    📁 Subir Foto
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files[0];
                      if (file) { const r = new FileReader(); r.onloadend = () => setCapturedPhoto(r.result); r.readAsDataURL(file); }
                    }} />
                  </label>
                </>
              ) : (
                <button className="btn-primary w-full py-3 bg-gradient-to-br from-brand-cyan to-brand-teal border-none rounded-xl text-white font-bold text-sm shadow-md cursor-pointer" onClick={() => executeTaskCompletion(photoTask, photoDate, capturedPhoto)}>
                  🚀 Enviar para Aprobación
                </button>
              )}
              <button className="btn-primary w-full py-2.5 bg-brand-cream border-none rounded-xl text-brand-gray font-bold text-xs" onClick={() => { setCameraStream(false); setPhotoTask(null); setPhotoDate(null); }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
