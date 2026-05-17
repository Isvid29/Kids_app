export default function StatPill({ label, value, color }) {
  return (
    <div className="flex-1 bg-white/70 rounded-xl py-2 px-2.5 text-center">
      <div className="font-bold text-[15px]" style={{ color }}>{value}</div>
      <div className="text-[11px] text-brand-gray">{label}</div>
    </div>
  );
}
