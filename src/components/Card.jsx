export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ${className}`}>
      {children}
    </div>
  );
}
