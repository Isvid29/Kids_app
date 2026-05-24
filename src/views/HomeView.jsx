import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIES, DAYS_ES, MONTHS_ES } from '../utils/constants';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import StatPill from '../components/StatPill';

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

export default function HomeView({ fireConfetti, showToast }) {
  const { tasks, completions, completeTask, streak, addBroPenalty, advanceChallengeProgress, familyTasks, familyPoints, equippedAvatar } = useAppStore();

  const todayDate = new Date();
  const todayTasks = tasks.filter(t => t.days.includes(todayDate.getDay()));

  const getCompletion = (taskId) => {
    const key = `${taskId}_${todayDate.getFullYear()}-${todayDate.getMonth()}-${todayDate.getDate()}`;
    return completions[key];
  };

  const todayDoneCount = todayTasks.filter(t => getCompletion(t.id)?.done).length;
  const todayPoints    = todayTasks.reduce((s, t) => getCompletion(t.id)?.done ? s + (t.points || 0) : s, 0);
  const todayPct       = todayTasks.length ? Math.round((todayDoneCount / todayTasks.length) * 100) : 0;

  // Camera / photo proof state
  const [photoTask,    setPhotoTask]    = useState(null);
  const [cameraStream, setCameraStream] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  // Lightning timer state
  const [timerActive,  setTimerActive]  = useState(false);
  const [timeLeft,     setTimeLeft]     = useState(300);
  const [timerTaskId,  setTimerTaskId]  = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setTimerTaskId(null);
      showToast("⏳ ¡Se acabó el tiempo del reto!", "error");
    }
    return () => clearTimeout(timerRef.current);
  }, [timerActive, timeLeft]);

  const startTimer = (taskId) => {
    setTimerTaskId(taskId);
    setTimeLeft(300);
    setTimerActive(true);
    showToast("⚡ ¡Reto Relámpago iniciado! Tienes 5 minutos", "warning");
  };

  const handleComplete = (task) => {
    if (task.needsApproval) {
      setPhotoTask(task);
      setCapturedPhoto(null);
      setCameraStream(true);
    } else {
      executeTaskCompletion(task, null);
    }
  };

  const executeTaskCompletion = (task, photo = null) => {
    const res = completeTask(task.id, todayDate, photo);
    if (!res) return;

    if (res.autoApproved) {
      fireConfetti();
      showToast(`¡Tarea completada! ${task.rewardType === 'euros' ? `+${task.euros?.toFixed(2)}€` : `+${task.points} pts`}`);
      if (timerActive && timerTaskId === task.id) {
        setTimerActive(false);
        setTimerTaskId(null);
        advanceChallengeProgress("timer");
        showToast("⚡ ¡Reto Relámpago superado! +1 progreso", "success");
      }
    } else {
      showToast("⏳ Foto enviada. Esperando validación", "warning");
    }
    setPhotoTask(null);
    setCameraStream(false);
  };

  const simulatePhotoCapture = () => {
    const url = MOCK_PHOTOS[photoTask?.id] || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80";
    setCapturedPhoto(url);
    showToast("📸 Foto capturada con éxito!");
  };

  return (
    <div className="animate-slide-up font-sans">

      {/* Lightning timer banner */}
      {timerActive && (
        <div className="bg-gradient-to-r from-brand-purple to-brand-blueD text-white p-3 px-4 rounded-2xl mb-4 flex items-center justify-between shadow-lg animate-pulse-slow">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <div className="text-xs">
              <div className="font-bold">OPERACIÓN RELÁMPAGO</div>
              <div className="opacity-80">Completa la tarea antes de que termine el tiempo</div>
            </div>
          </div>
          <div className="text-xl font-bold bg-white/20 px-3 py-1 rounded-xl">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
      )}

      {/* Summary + Bro button row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Daily summary card */}
        <Card className="md:col-span-2 bg-gradient-to-br from-brand-purpleL to-brand-blueL border border-brand-indigo/25">
          <div className="flex justify-between items-center mb-3">
            <h2 className="m-0 text-brand-dark text-lg font-bold flex items-center gap-2">
              <span className="flex-shrink-0">
                {equippedAvatar && (equippedAvatar.includes('.') || equippedAvatar.includes('/')) ? (
                  <img 
                    src={equippedAvatar.startsWith('http') || equippedAvatar.startsWith('data:') ? equippedAvatar : `${import.meta.env.BASE_URL}${equippedAvatar.replace(/^\//, '')}`} 
                    alt="Avatar" 
                    className="w-6 h-6 object-cover rounded-full border border-white" 
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=Lia&background=8B5CF6&color=fff&rounded=true&size=64"; }}
                  />
                ) : (
                  equippedAvatar || '📅'
                )}
              </span>
              Hoy
            </h2>
            <span className="text-[12px] font-bold text-brand-gray bg-white/60 px-2.5 py-0.5 rounded-full">
              {DAYS_ES[todayDate.getDay()]} {todayDate.getDate()} {MONTHS_ES[todayDate.getMonth()]}
            </span>
          </div>
          <div className="flex gap-2.5 mb-3">
            <StatPill label="Hechas"    value={`${todayDoneCount}/${todayTasks.length}`} color="var(--color-brand-cyan)"   />
            <StatPill label="Pts hoy"   value={`${todayPoints} 🪙`}                      color="var(--color-brand-blue)"   />
            <StatPill label="Racha"     value={`${streak} 🔥`}                           color="var(--color-brand-indigo)" />
          </div>
          <ProgressBar pct={todayPct} color="var(--color-brand-blueD)" label={`${todayPct}% completado`} />
          {streak >= 7 && (
            <div className="mt-3 bg-gradient-to-r from-brand-purple to-brand-indigo text-white p-2.5 rounded-xl text-center text-xs font-bold shadow-md animate-bounce">
              ⚡ ¡Multiplicador x1.05 activo por racha de {streak} días!
            </div>
          )}
        </Card>

        {/* Bro Penalty card */}
        <Card className="bg-brand-dark text-white flex flex-col justify-center items-center text-center p-4 border border-brand-blueD shadow-md relative overflow-hidden">
          <div className="absolute -top-3 -right-3 text-6xl opacity-10 blur-sm select-none">😎</div>
          <div className="text-3xl mb-1 relative z-10">😎</div>
          <h3 className="m-0 text-sm mb-0.5 font-bold relative z-10 tracking-wide">😎 Bro / Penalización</h3>
          <p className="text-[10px] opacity-60 mb-3 m-0 relative z-10 leading-tight px-1">
            Actitud incorrecta · descuenta 1€ de la hucha de Gastar
          </p>
          <button
            className="btn-primary w-full bg-gradient-to-br from-brand-blue to-brand-indigo py-2.5 rounded-xl text-white font-black text-sm shadow-md border-none cursor-pointer relative z-10 tracking-wide"
            onClick={() => {
              if (addBroPenalty()) {
                showToast("😎 Bro / Penalización aplicada: -1.00€", "error");
              }
            }}
          >
            Aplicar Bro · -1.00€
          </button>
        </Card>
      </div>

      {/* Today's task list */}
      <h3 className="text-brand-dark m-0 mb-2.5 text-base font-bold flex items-center gap-1.5">
        <span>✨</span> Tareas de hoy
      </h3>

      {todayTasks.length === 0 && (
        <p className="text-brand-gray text-center p-5 font-bold">¡No hay tareas asignadas para hoy! 🎉</p>
      )}

      {todayTasks.map(task => {
        const comp     = getCompletion(task.id);
        const done     = comp?.done;
        const pending  = comp?.pendingApproval;
        const rejected = comp?.rejected;
        const cat      = CATEGORIES[task.cat];
        const taskIcon = task.icon || '✨';

        return (
          <div
            key={task.id}
            className={`rounded-2xl p-3 px-4 mb-2.5 flex items-center gap-3 border-2 shadow-sm transition-all ${
              done     ? 'bg-brand-cyanL border-brand-cyan'     :
              pending  ? 'bg-brand-indigoL border-brand-indigo' :
              rejected ? 'bg-brand-blueL border-brand-blue'     :
                         'bg-white border-brand-blueL'
            }`}
          >
            <div className="text-3xl select-none">{taskIcon}</div>

            <div className="flex-1 min-w-0">
              <div className={`font-bold text-brand-dark text-[15px] truncate ${done ? 'line-through opacity-60' : ''}`}>
                {task.name}
              </div>
              <div className="text-xs text-brand-gray mt-0.5 font-bold flex flex-wrap gap-1 items-center">
                <span className="px-2 py-0.5 rounded-lg font-bold" style={{ background: cat?.bg, color: cat?.color }}>
                  {cat?.label}
                </span>
                {task.rewardType === 'euros' ? `+${task.euros?.toFixed(2)} € 💰` : `+${task.points} 🪙`}
                {task.needsApproval && <span className="text-brand-indigo">📷 foto</span>}
              </div>
              {rejected && comp.rejectionNote && (
                <div className="mt-1.5 text-[11px] bg-white/80 text-brand-blueD p-1.5 rounded-lg border border-brand-blue font-semibold">
                  💬 {comp.rejectionNote}
                </div>
              )}
            </div>

            <div className="flex gap-1.5 flex-shrink-0">
              {!done && !pending && task.needsApproval && !timerActive && (
                <button
                  className="btn-primary bg-brand-purpleL border-none rounded-xl text-brand-purple p-2 text-xs font-bold cursor-pointer"
                  onClick={() => startTimer(task.id)}
                  title="Iniciar reto relámpago"
                >⏱️</button>
              )}
              {!done && !pending && (
                <button
                  className="btn-primary bg-gradient-to-br from-brand-blue to-brand-blueD border-none rounded-xl text-white px-3.5 py-2.5 text-[13px] font-bold shadow-sm cursor-pointer"
                  onClick={() => handleComplete(task)}
                >
                  ✓ Hecho
                </button>
              )}
            </div>

            {pending  && <span className="text-xs text-brand-indigo font-bold bg-brand-indigoL px-2 py-1 rounded-lg flex-shrink-0">⏳ Validando</span>}
            {done     && <span className="text-2xl flex-shrink-0">✅</span>}
            {rejected && (
              <button
                className="btn-primary bg-brand-blue border-none rounded-xl text-white px-3 py-2 text-xs font-bold cursor-pointer flex-shrink-0"
                onClick={() => handleComplete(task)}
              >Re-intentar</button>
            )}
          </div>
        );
      })}

      {/* Photo capture modal */}
      {cameraStream && photoTask && (
        <div className="fixed inset-0 bg-[#0F172ACC] flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full animate-pop text-center shadow-2xl">
            <h3 className="m-0 mb-2.5 text-brand-dark text-lg font-bold flex items-center justify-center gap-2">
              <span>📸</span> Prueba Gráfica
            </h3>
            <p className="m-0 mb-4 text-xs text-brand-gray font-bold">
              Foto de: <strong>{photoTask.name}</strong>
            </p>

            <div className="bg-brand-cream aspect-video rounded-2xl border-4 border-brand-blueL mb-4 overflow-hidden flex items-center justify-center">
              {capturedPhoto
                ? <img src={capturedPhoto} alt="Proof" className="w-full h-full object-cover" />
                : (
                  <div className="flex flex-col items-center text-brand-gray">
                    <span className="text-4xl mb-2 animate-pulse">📷</span>
                    <div className="text-[10px] font-bold uppercase">Simulador de Cámara</div>
                  </div>
                )
              }
            </div>

            <div className="flex flex-col gap-2">
              {!capturedPhoto ? (
                <>
                  <button
                    className="btn-primary w-full py-3 bg-gradient-to-br from-brand-purple to-brand-indigo border-none rounded-xl text-white font-bold text-sm shadow-md cursor-pointer"
                    onClick={simulatePhotoCapture}
                  >📸 Capturar Prueba</button>
                  <label className="btn-primary w-full py-2.5 bg-brand-purpleL border-none rounded-xl text-brand-purple font-bold text-xs flex items-center justify-center cursor-pointer">
                    📁 Subir Archivo
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files[0];
                      if (file) { const r = new FileReader(); r.onloadend = () => setCapturedPhoto(r.result); r.readAsDataURL(file); }
                    }} />
                  </label>
                </>
              ) : (
                <button
                  className="btn-primary w-full py-3 bg-gradient-to-br from-brand-cyan to-brand-teal border-none rounded-xl text-white font-bold text-sm shadow-md cursor-pointer"
                  onClick={() => executeTaskCompletion(photoTask, capturedPhoto)}
                >🚀 Enviar para Aprobación</button>
              )}
              <button
                className="btn-primary w-full py-2.5 bg-brand-cream border-none rounded-xl text-brand-gray font-bold text-xs cursor-pointer"
                onClick={() => { setCameraStream(false); setPhotoTask(null); }}
              >Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Family Tasks Section */}
      <h3 className="text-brand-dark m-0 mt-6 mb-2.5 text-base font-bold flex items-center gap-1.5 justify-between">
        <div className="flex items-center gap-1.5">
          <span>👨‍👩‍👧</span> Tareas Familiares
        </div>
        <span className="text-xs font-bold bg-brand-cyanL text-brand-cyan px-2 py-1 rounded-lg">
          Fondo: {familyPoints} pts
        </span>
      </h3>

      {familyTasks.length === 0 && (
        <p className="text-brand-gray text-center p-4 text-sm font-bold border-2 border-dashed border-brand-blueL rounded-2xl">
          No hay tareas familiares asignadas
        </p>
      )}

      {familyTasks.map(ft => (
        <div key={ft.id} className={`rounded-2xl p-3 px-4 mb-2.5 flex items-center gap-3 border-2 shadow-sm transition-all ${ft.done ? 'bg-brand-cyanL border-brand-cyan' : 'bg-white border-brand-blueL'}`}>
          <div className="text-3xl select-none">{ft.assignedTo === 'mom' ? '👩' : ft.assignedTo === 'dad' ? '👨' : '👦'}</div>
          <div className="flex-1 min-w-0">
            <div className={`font-bold text-brand-dark text-[15px] truncate ${ft.done ? 'line-through opacity-60' : ''}`}>{ft.name}</div>
            <div className="text-xs text-brand-gray mt-0.5 font-bold">
              {ft.assignedTo === 'mom' ? 'Mamá' : ft.assignedTo === 'dad' ? 'Papá' : 'Adolescente'} · +{ft.points || 10} pts al fondo
            </div>
          </div>
          <div className="flex-shrink-0">
            {ft.done ? (
              <span className="text-2xl">✅</span>
            ) : (
              <span className="text-xs text-brand-gray font-bold bg-brand-cream px-2 py-1.5 rounded-lg border border-brand-blueL">Pendiente</span>
            )}
          </div>
        </div>
      ))}

      <div className="h-4" />
    </div>
  );
}
