export default function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl py-3.5 px-3 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-2" style={{ borderColor: `${color}33` }}>
      <div className="text-3xl">{icon}</div>
      <div className="font-bold text-lg my-1" style={{ color }}>{value}</div>
      <div className="text-xs text-brand-gray">{label}</div>
    </div>
  );
}
