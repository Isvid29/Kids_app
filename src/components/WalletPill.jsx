export function WalletPill({ label, amount, color, icon }) {
  return (
    <div className="text-center">
      <div className="text-xl">{icon}</div>
      <div className="font-bold text-[15px]" style={{ color }}>{amount.toFixed(2)}€</div>
      <div className="text-[11px] text-brand-gray">{label}</div>
    </div>
  );
}

export function WalletBig({ label, amount, color, bg, icon, pct }) {
  return (
    <div className="flex-1 rounded-2xl py-3 px-2 text-center border-2" style={{ backgroundColor: bg, borderColor: `${color}33` }}>
      <div className="text-2xl">{icon}</div>
      <div className="font-bold text-base my-1" style={{ color }}>{amount.toFixed(2)}€</div>
      <div className="text-[11px] text-brand-gray">{label}</div>
      <div className="text-[10px] font-bold mt-0.5" style={{ color }}>{pct}%</div>
    </div>
  );
}
