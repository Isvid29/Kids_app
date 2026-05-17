export default function ProgressBar({ pct, color, label }) {
  return (
    <div>
      <div className="rounded-lg h-2.5 overflow-hidden" style={{ backgroundColor: `${color}22` }}>
        <div 
          className="h-2.5 rounded-lg transition-all duration-500 ease-out" 
          style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color }} 
        />
      </div>
      {label && <div className="text-[11px] mt-1 text-right font-bold" style={{ color }}>{label}</div>}
    </div>
  );
}
