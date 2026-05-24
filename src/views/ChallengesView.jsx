import { useAppStore } from '../store/useAppStore';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';

const CHALLENGE_TYPE_META = {
  timer:            { icon: "⚡", color: "var(--color-brand-purple)", bgClass: "bg-brand-purpleL", label: "Velocidad" },
  photo_consecutive:{ icon: "📸", color: "var(--color-brand-blue)",   bgClass: "bg-brand-blueL",   label: "Constancia" },
  eco:              { icon: "🌱", color: "var(--color-brand-teal)",   bgClass: "bg-brand-cyanL",   label: "Eco" },
  help:             { icon: "🤝", color: "var(--color-brand-cyan)",   bgClass: "bg-brand-cyanL",   label: "Familia" },
  hygiene:          { icon: "🚿", color: "var(--color-brand-indigo)", bgClass: "bg-brand-indigoL", label: "Hábitos" },
};

export default function ChallengesView() {
  const { challenges } = useAppStore();
  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <div className="animate-slide-up pb-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="m-0 text-brand-dark text-lg font-bold flex items-center gap-2">
          <span>🏆</span> Retos Semanales
        </h2>
        <span className="text-xs font-bold bg-brand-purpleL text-brand-purple px-3 py-1 rounded-full">
          {completedCount}/{challenges.length} completados
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="bg-white rounded-2xl p-4 mb-5 border border-brand-blueL shadow-sm">
        <div className="flex justify-between items-center mb-2 text-xs font-bold text-brand-gray">
          <span>Progreso general de la semana</span>
          <span className="text-brand-indigo">{Math.round((completedCount / challenges.length) * 100)}%</span>
        </div>
        <ProgressBar
          pct={Math.round((completedCount / challenges.length) * 100)}
          color="var(--color-brand-indigo)"
        />
      </div>

      {/* Challenge cards */}
      <div className="flex flex-col gap-3">
        {challenges.map(c => {
          const pct = Math.round((c.progress / c.target) * 100);
          const meta = CHALLENGE_TYPE_META[c.type] || CHALLENGE_TYPE_META.timer;

          return (
            <Card
              key={c.id}
              className={`border-2 transition-all ${
                c.completed
                  ? 'bg-gradient-to-br from-white to-brand-cyanL border-brand-cyan shadow-md'
                  : 'bg-white border-brand-blueL'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${meta.bgClass}`}
                  style={{ color: meta.color }}
                >
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="m-0 text-brand-dark font-bold text-[14px] leading-tight">{c.name}</h3>
                    <span
                      className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                      style={{ background: meta.bgClass.replace('bg-',''), color: meta.color }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="m-0 text-[11px] text-brand-gray mt-1 leading-relaxed">{c.desc}</p>
                </div>
                {/* Progress badge */}
                <div className="text-right flex-shrink-0">
                  <span
                    className="text-sm font-black block"
                    style={{ color: c.completed ? 'var(--color-brand-teal)' : meta.color }}
                  >
                    {c.progress}/{c.target}
                  </span>
                  <span className="text-[9px] text-brand-gray font-bold uppercase">progreso</span>
                </div>
              </div>

              {/* Progress bar */}
              <ProgressBar
                pct={pct}
                color={c.completed ? 'var(--color-brand-teal)' : meta.color}
              />

              {/* Reward footer */}
              <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-brand-blueL/40">
                <div className="text-[10px] text-brand-gray font-bold">
                  🎁 Recompensa: <span className="text-brand-indigo">{c.reward}</span>
                </div>
                {c.completed ? (
                  <span className="text-[11px] font-black text-brand-teal flex items-center gap-1">
                    ✅ ¡Conseguido!
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-brand-gray opacity-60">
                    En progreso…
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
