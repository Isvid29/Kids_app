export default function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {pieces.map(i => (
        <div key={i} className="absolute animate-confetti opacity-0" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 60}%`,
          fontSize: `${16 + Math.random() * 20}px`,
          animationDelay: `${Math.random() * 0.5}s`,
          animationDuration: `${1 + Math.random()}s`,
        }}>
          {["🌸", "⭐", "💖", "✨", "🎉", "🌈", "🦋", "🌟"][Math.floor(Math.random() * 8)]}
        </div>
      ))}
    </div>
  );
}
