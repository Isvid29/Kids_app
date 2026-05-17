import { useAppStore } from '../store/useAppStore';
import { LEVELS } from '../utils/constants';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';

function getLevel(points) {
  for(let i=LEVELS.length-1; i>=0; i--) {
    if(points >= LEVELS[i].min) return {...LEVELS[i], next: LEVELS[i+1]?.min ?? null, idx: i};
  }
  return LEVELS[0];
}

export default function StatsView() {
  const { completions, totalPoints, totalEuros, streak } = useAppStore();
  
  const lvl = getLevel(totalPoints);
  const pct = lvl.next ? Math.min(100, ((totalPoints - lvl.min) / (lvl.next - lvl.min)) * 100) : 100;
  const totalDone = Object.values(completions).filter(c=>c.done).length;

  const badges = [
    { icon:"🌟", label:"Primera tarea", desc:"Completa tu primera tarea", unlocked: totalDone >= 1 },
    { icon:"🔥", label:"3 días seguidos", desc:"Mantén una racha de 3 días", unlocked: streak >= 3 },
    { icon:"💎", label:"Super estrella", desc:"Consigue 100 puntos", unlocked: totalPoints >= 100 },
    { icon:"🏆", label:"Semana perfecta", desc:"Completa 20 tareas en total", unlocked: totalDone >= 20 },
    { icon:"🐷", label:"Ahorradora", desc:"Gana 5€ o más", unlocked: totalEuros >= 5 },
    { icon:"🦄", label:"Unicornio", desc:"Consigue 500 puntos", unlocked: totalPoints >= 500 },
    { icon:"👑", label:"Reina de las tareas", desc:"Consigue 1000 puntos", unlocked: totalPoints >= 1000 },
    { icon:"🌈", label:"Arcoíris", desc:"Mantén racha de 7 días", unlocked: streak >= 7 },
  ];

  return (
    <div className="animate-slide-up pb-8">
      <h2 className="text-brand-dark m-0 mb-3.5 text-lg">🏆 Mis Logros</h2>

      {/* Level card */}
      <Card className="bg-gradient-to-br from-brand-purpleL to-brand-blueL mb-4 text-center">
        <div className="text-5xl mb-1">{lvl.label.split(" ")[0]}</div>
        <div className="font-bold text-brand-dark text-lg">{lvl.label}</div>
        <div className="text-brand-gray text-[13px] my-1 mb-3">{totalPoints} puntos totales</div>
        <ProgressBar pct={pct} color="var(--color-brand-blueD)" label={lvl.next ? `Próximo nivel: ${lvl.next} pts` : "¡Nivel máximo!"} />
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <StatCard icon="✅" label="Tareas completadas" value={totalDone} color="var(--color-brand-cyan)" />
        <StatCard icon="⭐" label="Puntos totales" value={totalPoints} color="var(--color-brand-indigo)" />
        <StatCard icon="💰" label="Euros ganados" value={`${totalEuros.toFixed(2)}€`} color="var(--color-brand-blue)" />
        <StatCard icon="🔥" label="Racha actual" value={`${streak} días`} color="var(--color-brand-teal)" />
      </div>

      {/* Badges */}
      <h3 className="text-brand-dark m-0 mb-3 text-[17px]">🎖️ Medallas</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {badges.map((b,i)=>(
          <div key={i} className={`rounded-2xl p-3.5 px-3 text-center border-2 ${b.unlocked ? 'bg-white border-brand-indigo shadow-[0_4px_12px_rgba(255,209,102,0.27)]' : 'bg-brand-cream border-brand-blueL opacity-50'}`}>
            <div className={`text-4xl ${!b.unlocked ? 'grayscale' : ''}`}>{b.icon}</div>
            <div className="font-bold text-brand-dark text-[13px] mt-1">{b.label}</div>
            <div className="text-[11px] text-brand-gray mt-0.5">{b.desc}</div>
            {b.unlocked && <div className="mt-1.5 text-[11px] text-brand-indigo font-bold">✨ ¡Conseguida!</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
