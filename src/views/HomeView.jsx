import { useAppStore } from '../store/useAppStore';
import { CATEGORIES, DAYS_ES, MONTHS_ES } from '../utils/constants';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import StatPill from '../components/StatPill';
import { WalletPill } from '../components/WalletPill';

function getLevel(points) {
  const levels = [
    {min:0,    label:"🌱 Semillita",    color:"var(--color-brand-cyan)"},
    {min:50,   label:"🌸 Florecita",    color:"var(--color-brand-blue)"},
    {min:150,  label:"⭐ Estrellita",   color:"var(--color-brand-indigo)"},
    {min:300,  label:"🦋 Mariposa",     color:"var(--color-brand-purple)"},
    {min:500,  label:"🌈 Arcoíris",     color:"var(--color-brand-sky)"},
    {min:800,  label:"🦄 Unicornio",    color:"var(--color-brand-blueD)"},
    {min:1200, label:"💎 Diamante",     color:"#A8D8EA"},
    {min:2000, label:"👑 Reina",        color:"var(--color-brand-indigo)"},
  ];
  for(let i=levels.length-1;i>=0;i--) if(points>=levels[i].min) return {...levels[i], next: levels[i+1]?.min ?? null, idx: i};
  return levels[0];
}

export default function HomeView({ fireConfetti, showToast }) {
  const { tasks, completions, completeTask, totalPoints, totalEuros, streak, wallet, savingsGoals } = useAppStore();
  
  const todayDate = new Date();
  const todayTasks = tasks.filter(t => t.days.includes(todayDate.getDay()));
  
  const getCompletion = (taskId) => {
    const key = `${taskId}_${todayDate.getFullYear()}-${todayDate.getMonth()}-${todayDate.getDate()}`;
    return completions[key];
  };

  const todayDoneCount = todayTasks.filter(t => getCompletion(t.id)?.done).length;
  const todayEarned = todayTasks.reduce((s,t) => getCompletion(t.id)?.done ? s+t.euros : s, 0);
  const todayPct = todayTasks.length ? Math.round((todayDoneCount/todayTasks.length)*100) : 0;

  const handleComplete = (task) => {
    const res = completeTask(task.id, todayDate);
    if (!res) return;
    if (res.autoApproved) {
      fireConfetti();
      showToast(`¡Tarea completada! +${task.points}⭐ +${task.euros}€`);
    } else {
      showToast("⏳ Esperando aprobación de papá/mamá", "warning");
    }
  };

  return (
    <div className="animate-slide-up">
      {/* Today summary */}
      <Card className="bg-gradient-to-br from-brand-purpleL to-brand-blueL mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="m-0 text-brand-dark text-lg">📅 Hoy</h2>
          <span className="text-[13px] text-brand-gray">{DAYS_ES[todayDate.getDay()]} {todayDate.getDate()} {MONTHS_ES[todayDate.getMonth()]}</span>
        </div>
        <div className="flex gap-3 mb-3">
          <StatPill label="Hechas" value={`${todayDoneCount}/${todayTasks.length}`} color="var(--color-brand-cyan)" />
          <StatPill label="Ganado hoy" value={`${todayEarned.toFixed(2)}€`} color="var(--color-brand-blue)" />
          <StatPill label="Racha" value={`${streak}🔥`} color="var(--color-brand-indigo)" />
        </div>
        <ProgressBar pct={todayPct} color="var(--color-brand-blueD)" label={`${todayPct}% completado`} />
      </Card>

      {/* Today's tasks */}
      <h3 className="text-brand-dark m-0 mb-2.5 text-base">✨ Tareas de hoy</h3>
      {todayTasks.length === 0 && <p className="text-brand-gray text-center p-5">¡No hay tareas hoy! 🎉</p>}
      
      {todayTasks.map(task => {
        const comp = getCompletion(task.id);
        const done = comp?.done;
        const pending = comp?.pendingApproval;
        const rejected = comp?.rejected;
        const cat = CATEGORIES[task.cat];
        
        return (
          <div key={task.id} className={`task-card rounded-2xl p-3 px-4 mb-2.5 flex items-center gap-3 border-2 shadow-sm ${done ? 'bg-brand-cyanL border-brand-cyan' : pending ? 'bg-brand-indigoL border-brand-indigo' : rejected ? 'bg-brand-blueL border-brand-blue' : 'bg-white border-brand-blueL'}`}>
            <div className="text-3xl">{cat.icon}</div>
            <div className="flex-1">
              <div className={`font-bold text-brand-dark text-[15px] ${done ? 'line-through' : ''}`}>{task.name}</div>
              <div className="text-xs text-brand-gray mt-0.5">
                <span className="px-2 py-0.5 rounded-lg font-bold mr-1.5" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
                +{task.euros.toFixed(2)}€ · +{task.points}⭐
              </div>
            </div>
            {!done && !pending && !rejected && (
              <button className="btn-primary bg-gradient-to-br from-brand-blue to-brand-blueD border-none rounded-xl text-white px-3.5 py-2 text-[13px] font-bold" onClick={() => handleComplete(task)}>
                ✓ Hecho
              </button>
            )}
            {pending && <span className="text-xs text-brand-teal font-bold">⏳ Pendiente</span>}
            {done && <span className="text-2xl">✅</span>}
            {rejected && <span className="text-xs text-brand-blueD font-bold">❌ Rechazado</span>}
          </div>
        );
      })}

      {/* Quick wallet */}
      <h3 className="text-brand-dark mt-4 mb-2.5 text-base">🏦 Mi Hucha</h3>
      <Card>
        <div className="flex gap-2.5 justify-around">
          <WalletPill label="Gastar" amount={wallet.spend} color="var(--color-brand-blueD)" icon="💸" />
          <WalletPill label="Ahorrar" amount={wallet.save} color="var(--color-brand-cyan)" icon="🏦" />
          <WalletPill label="Invertir" amount={wallet.invest} color="var(--color-brand-purple)" icon="📈" />
        </div>
        <div className="text-center mt-3 text-brand-gray text-[13px]">
          Total acumulado: <strong className="text-brand-blueD">{totalEuros.toFixed(2)}€</strong>
        </div>
      </Card>
      <div className="h-4"></div>
    </div>
  );
}
