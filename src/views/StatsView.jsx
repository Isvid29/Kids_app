import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { LEVELS, PASS_MILESTONES } from '../utils/constants';
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
  const { completions, totalPoints, streak, wallet, savingsGoals, tasks, equipReward, equippedAvatar, equippedBg } = useAppStore();
  const [expandedBadge, setExpandedBadge] = useState(null);
  
  const lvl = getLevel(totalPoints);
  const pct = lvl.next ? Math.min(100, ((totalPoints - lvl.min) / (lvl.next - lvl.min)) * 100) : 100;
  const totalDone = Object.values(completions).filter(c=>c.done).length;

  // Helper to count completions for a specific category
  const getDoneByCategory = (catKey) => {
    let count = 0;
    Object.keys(completions).forEach(key => {
      const taskId = key.split('_')[0];
      const task = tasks.find(t => t.id === taskId);
      if (task && task.cat === catKey && completions[key].done) {
        count++;
      }
    });
    return count;
  };

  const completedGoals = savingsGoals.filter(g => g.saved >= g.target).length;
  const totalSaved = savingsGoals.reduce((s, g) => s + g.saved, 0);

  // Full 50-Achievement Catalog with Teen Gaming aesthetic
  const badges = [
    // --- TAREAS COMPLETADAS (1-10) ---
    { id: 1, icon: "🎯", label: "Primer Paso", desc: "Completa 1 tarea", target: 1, current: totalDone },
    { id: 2, icon: "🚀", label: "En Marcha", desc: "Completa 5 tareas", target: 5, current: totalDone },
    { id: 3, icon: "⚡", label: "Imparable", desc: "Completa 10 tareas", target: 10, current: totalDone },
    { id: 4, icon: "🔥", label: "Hype de Supervivencia", desc: "Completa 20 tareas", target: 20, current: totalDone },
    { id: 5, icon: "🎮", label: "Hardcore Player", desc: "Completa 50 tareas", target: 50, current: totalDone },
    { id: 6, icon: "🏆", label: "Gran Campeón", desc: "Completa 100 tareas", target: 100, current: totalDone },
    { id: 7, icon: "👑", label: "Leyenda del Deber", desc: "Completa 200 tareas", target: 200, current: totalDone },
    { id: 8, icon: "💫", label: "Brawler Mítico", desc: "Completa 300 tareas", target: 300, current: totalDone },
    { id: 9, icon: "🌌", label: "Maestro del Tiempo", desc: "Completa 400 tareas", target: 400, current: totalDone },
    { id: 10, icon: "👽", label: "Fuera de Este Mundo", desc: "Completa 500 tareas", target: 500, current: totalDone },

    // --- PUNTOS TOTALES (11-20) ---
    { id: 11, icon: "🪙", label: "Bolsa Inicial", desc: "Consigue 50 puntos", target: 50, current: totalPoints },
    { id: 12, icon: "💎", label: "Superestrella", desc: "Consigue 100 puntos", target: 100, current: totalPoints },
    { id: 13, icon: "💰", label: "Cofre de Oro", desc: "Consigue 250 puntos", target: 250, current: totalPoints },
    { id: 14, icon: "🔮", label: "Poder Infinito", desc: "Consigue 500 puntos", target: 500, current: totalPoints },
    { id: 15, icon: "🛡️", label: "Paladín Brillante", desc: "Consigue 1000 puntos", target: 1000, current: totalPoints },
    { id: 16, icon: "🦄", label: "Unicornio Cyber", desc: "Consigue 1500 puntos", target: 1500, current: totalPoints },
    { id: 17, icon: "🔱", label: "Titán de Oro", desc: "Consigue 2000 puntos", target: 2000, current: totalPoints },
    { id: 18, icon: "🌌", label: "Liga Estelar", desc: "Consigue 3000 puntos", target: 3000, current: totalPoints },
    { id: 19, icon: "👑", label: "Señor de la Riqueza", desc: "Consigue 5000 puntos", target: 5000, current: totalPoints },
    { id: 20, icon: "✨", label: "Deidad del Grind", desc: "Consigue 10000 puntos", target: 10000, current: totalPoints },

    // --- RACHAS (21-30) ---
    { id: 21, icon: "🌱", label: "Día Uno", desc: "Mantén 1 día de racha", target: 1, current: streak },
    { id: 22, icon: "🔥", label: "Calentando", desc: "Mantén 2 días de racha", target: 2, current: streak },
    { id: 23, icon: "💥", label: "On Fire", desc: "Mantén 3 días de racha", target: 3, current: streak },
    { id: 24, icon: "🏃", label: "Corredor Diario", desc: "Mantén 5 días de racha", target: 5, current: streak },
    { id: 25, icon: "🌈", label: "Semana Perfecta", desc: "Mantén 7 días de racha (+5% pts!)", target: 7, current: streak },
    { id: 26, icon: "🌋", label: "Erupción", desc: "Mantén 10 días de racha", target: 10, current: streak },
    { id: 27, icon: "☄️", label: "Meteoro", desc: "Mantén 14 días de racha", target: 14, current: streak },
    { id: 28, icon: "🪐", label: "Órbita Estable", desc: "Mantén 21 días de racha", target: 21, current: streak },
    { id: 29, icon: "☀️", label: "Sol Eterno", desc: "Mantén 30 días de racha", target: 30, current: streak },
    { id: 30, icon: "🌠", label: "Inmortal", desc: "Mantén 50 días de racha", target: 50, current: streak },

    // --- LIMPIEZA / ORDEN (31-35) ---
    { id: 31, icon: "🧹", label: "Iniciado del Orden", desc: "Completa 3 tareas de limpieza", target: 3, current: getDoneByCategory("cleaning") },
    { id: 32, icon: "🧼", label: "Brillo Supremo", desc: "Completa 10 tareas de limpieza", target: 10, current: getDoneByCategory("cleaning") },
    { id: 33, icon: "🧽", label: "Esponja de Acero", desc: "Completa 25 tareas de limpieza", target: 25, current: getDoneByCategory("cleaning") },
    { id: 34, icon: "✨", label: "Hogar Sagrado", desc: "Completa 50 tareas de limpieza", target: 50, current: getDoneByCategory("cleaning") },
    { id: 35, icon: "🎖️", label: "Comandante Limpio", desc: "Completa 100 tareas de limpieza", target: 100, current: getDoneByCategory("cleaning") },

    // --- ESTUDIOS (36-40) ---
    { id: 36, icon: "📚", label: "Mente Inquieta", desc: "Completa 3 tareas de estudio", target: 3, current: getDoneByCategory("study") },
    { id: 37, icon: "✍️", label: "Pluma de Oro", desc: "Completa 10 tareas de estudio", target: 10, current: getDoneByCategory("study") },
    { id: 38, icon: "🧠", label: "Cerebro Fuerte", desc: "Completa 25 tareas de estudio", target: 25, current: getDoneByCategory("study") },
    { id: 39, icon: "🎓", label: "Erudito Gamer", desc: "Completa 50 tareas de estudio", target: 50, current: getDoneByCategory("study") },
    { id: 40, icon: "🔬", label: "Einstein Teen", desc: "Completa 100 tareas de estudio", target: 100, current: getDoneByCategory("study") },

    // --- RUTINA / SALUD (41-45) ---
    { id: 41, icon: "🛌", label: "Hábitos Saludables", desc: "Completa 3 tareas de rutina", target: 3, current: getDoneByCategory("routine") },
    { id: 42, icon: "⏰", label: "Reloj de Precisión", desc: "Completa 10 tareas de rutina", target: 10, current: getDoneByCategory("routine") },
    { id: 43, icon: "🧘", label: "Zen Grind", desc: "Completa 25 tareas de rutina", target: 25, current: getDoneByCategory("routine") },
    { id: 44, icon: "🍎", label: "Combustible Sano", desc: "Completa 10 tareas de deporte/salud", target: 10, current: getDoneByCategory("sport") },
    { id: 45, icon: "💪", label: "Fuerza Absoluta", desc: "Completa 25 tareas de deporte/salud", target: 25, current: getDoneByCategory("sport") },

    // --- METAS Y AHORRO (46-50) ---
    { id: 46, icon: "🎯", label: "Primer Sueño", desc: "Consigue completar 1 objetivo", target: 1, current: completedGoals },
    { id: 47, icon: "🎁", label: "Meta Cumplida", desc: "Consigue completar 3 objetivos", target: 3, current: completedGoals },
    { id: 48, icon: "🎪", label: "Magnate Teen", desc: "Consigue completar 5 objetivos", target: 5, current: completedGoals },
    { id: 49, icon: "🏦", label: "Hucha Acorazada", desc: "Destina 50€ a ahorrar", target: 50, current: totalSaved },
    { id: 50, icon: "🏦", label: "Fort Knox", desc: "Destina 100€ a ahorrar", target: 100, current: totalSaved }
  ];

  const unlockedCount = badges.filter(b => b.current >= b.target).length;

  return (
    <div className="animate-slide-up pb-8 font-sans">
      <h2 className="text-brand-dark m-0 mb-3.5 text-lg font-bold flex items-center gap-2">
        <span>🏆</span> Sala de Trofeos
      </h2>

      {/* Gamification Level Pass */}
      <h3 className="text-brand-dark m-0 mb-3 text-base font-bold flex items-center gap-1.5">
        <span>🎁</span> Pase de Nivel
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-4 mb-4 snap-x hide-scrollbar">
        {PASS_MILESTONES.map((m, i) => {
          const isUnlocked = totalPoints >= m.req;
          const isNext = !isUnlocked && (i === 0 || totalPoints >= PASS_MILESTONES[i-1].req);
          const isEquipped = (m.type === 'avatar' && equippedAvatar === m.value) || 
                             (m.type === 'bg' && equippedBg === m.value);

          return (
            <div key={i} className={`flex-shrink-0 w-[120px] rounded-2xl p-3 border-2 flex flex-col items-center justify-between snap-center transition-all ${
              isUnlocked ? 'bg-gradient-to-b from-white to-brand-cyanL border-brand-cyan shadow-md' :
              isNext     ? 'bg-brand-cream border-brand-blueD shadow-inner opacity-90' :
                           'bg-brand-cream border-brand-blueL opacity-50 grayscale'
            }`}>
              <div className="text-xs font-bold text-brand-dark mb-1">Nivel {m.level}</div>
              <div className="text-[10px] text-brand-gray font-bold mb-2">{m.req} pts</div>
              
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-3 relative ${m.type === 'bg' ? m.value : 'bg-white shadow-sm'}`}>
                {m.type === 'avatar' && m.value}
                {m.type === 'multiplier' && <span className="text-xl font-black text-brand-purple">x{m.value}</span>}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🔒</span>
                  </div>
                )}
              </div>
              
              <div className="text-[9px] text-brand-dark font-bold text-center leading-tight mb-2 h-6 flex items-center justify-center">{m.desc}</div>
              
              {isUnlocked ? (
                isEquipped ? (
                  <button className="w-full py-1.5 rounded-lg text-[9px] font-bold bg-brand-cyan text-white border-none cursor-default">Equipado</button>
                ) : (
                  <button 
                    className="w-full py-1.5 rounded-lg text-[9px] font-bold bg-brand-blueD text-white border-none cursor-pointer shadow-sm hover:scale-105 transition-transform"
                    onClick={() => equipReward(m.type, m.value, 7)}
                  >Equipar</button>
                )
              ) : (
                <div className="w-full py-1.5 rounded-lg text-[9px] font-bold bg-brand-blueL text-brand-gray text-center">{isNext ? 'Siguiente' : 'Bloqueado'}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Level Card */}
      <Card className="bg-gradient-to-br from-brand-purpleL to-brand-blueL mb-4 text-center border border-brand-indigo/20 shadow-md">
        <div className="text-5xl mb-2.5 drop-shadow-md">{lvl.label.split(" ")[0]}</div>
        <div className="font-extrabold text-brand-dark text-lg tracking-tight uppercase">{lvl.label}</div>
        <div className="text-brand-gray text-[12px] font-bold my-1 mb-3">{totalPoints} Puntos Acumulados</div>
        <ProgressBar pct={pct} color="var(--color-brand-blueD)" label={lvl.next ? `Siguiente Rango: ${lvl.next} pts` : "🏆 ¡Rango Máximo Conseguido!"} />
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <StatCard icon="✅" label="Tareas Hechas" value={totalDone} color="var(--color-brand-cyan)" />
        <StatCard icon="🪙" label="Puntos Ganados" value={totalPoints} color="var(--color-brand-indigo)" />
        <StatCard icon="🎖️" label="Logros Desbloqueados" value={`${unlockedCount}/${badges.length}`} color="var(--color-brand-purple)" />
        <StatCard icon="🔥" label="Racha Actual" value={`${streak} 🔥`} color="var(--color-brand-teal)" />
      </div>

      {/* Badges Grid */}
      <h3 className="text-brand-dark m-0 mb-3 text-base font-bold flex items-center gap-1.5">
        <span>🎖️</span> Lista de Logros ({unlockedCount}/50)
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {badges.map((b, i) => {
          const unlocked = b.current >= b.target;
          const progressPct = Math.round(Math.min(100, (b.current / b.target) * 100));
          const isExpanded = expandedBadge === i;
          
          let rarityClass = "rarity-especial";
          if (b.target >= 100) rarityClass = "rarity-legendario";
          else if (b.target >= 50) rarityClass = "rarity-mitico";
          else if (b.target >= 20) rarityClass = "rarity-epico";
          
          return (
            <div
              key={b.id}
              className={`rounded-2xl p-2 text-center border-2 cursor-pointer transition-all flex flex-col justify-between ${
                unlocked
                  ? `${rarityClass} animate-shimmer`
                  : 'bg-brand-cream border-brand-blueL opacity-90'
              } ${isExpanded ? 'col-span-4' : ''}`}
              onClick={() => setExpandedBadge(isExpanded ? null : i)}
            >
              <div>
                <div className="relative inline-block">
                  <div className={`text-2xl sm:text-3xl ${!unlocked ? 'grayscale opacity-40' : ''}`}>{b.icon}</div>
                  {!unlocked && (
                    <div className="absolute -top-1 -right-1 bg-brand-blueD text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[7px] font-bold shadow-sm">🔒</div>
                  )}
                </div>
                <div className={`font-bold text-brand-dark text-[9px] sm:text-[11px] mt-1.5 leading-tight ${!unlocked ? 'opacity-70' : ''}`}>{b.label}</div>
              </div>
              
              <div>
                {/* Achievement Progress bar */}
                <div className="mt-2 mb-1">
                  <ProgressBar pct={progressPct} color={unlocked ? "var(--color-brand-indigo)" : "var(--color-brand-blue)"} />
                </div>
                
                {unlocked ? (
                  <div className="text-[8px] text-brand-indigo font-bold whitespace-nowrap">✨ Logrado</div>
                ) : (
                  <div className="text-[8px] text-brand-gray font-bold whitespace-nowrap">{progressPct}% completado</div>
                )}
              </div>
              
              {/* Detail box when clicked */}
              {isExpanded && (
                <div className={`mt-2.5 rounded-xl px-2.5 py-1.5 text-xs font-bold ${unlocked ? 'bg-brand-cyanL text-brand-teal' : 'bg-brand-blueL text-brand-blueD'} animate-pop`}>
                  {unlocked ? (
                    <span>🏅 ¡Logrado! Has alcanzado la meta de {b.target}.</span>
                  ) : (
                    <span>🎯 Progreso actual: {b.current} de {b.target} requeridos.</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

