export const CATEGORIES = {
  hogar:   { label: "Hogar",    color: "var(--color-brand-blueD)",   bg: "var(--color-brand-blueL)",   icon: "🏠", points: 10 },
  deberes: { label: "Deberes",  color: "var(--color-brand-purple)",    bg: "var(--color-brand-purpleL)",    icon: "📚", points: 15 },
  habitos: { label: "Hábitos",  color: "var(--color-brand-cyanD)",   bg: "var(--color-brand-cyanL)",   icon: "🛁", points: 8  },
  extra:   { label: "Extra",    color: "var(--color-brand-tealD)",  bg: "var(--color-brand-tealL)",  icon: "🚀", points: 20 },
};

export const DEFAULT_TASKS = [
  { id: "t1", name: "Hacer la cama", cat: "habitos", fixed: true, days: [1,2,3,4,5], euros: 0.50, points: 8, needsApproval: false },
  { id: "t2", name: "Recoger el cuarto", cat: "hogar", fixed: true, days: [1,3,5], euros: 1.00, points: 10, needsApproval: true },
  { id: "t3", name: "Poner/quitar mesa", cat: "hogar", fixed: true, days: [1,2,3,4,5], euros: 0.50, points: 10, needsApproval: false },
  { id: "t4", name: "Hacer los deberes", cat: "deberes", fixed: true, days: [1,2,3,4], euros: 1.00, points: 15, needsApproval: true },
  { id: "t5", name: "Ducharse sola", cat: "habitos", fixed: true, days: [1,2,3,4,5,6,0], euros: 0.30, points: 8, needsApproval: false },
  { id: "t6", name: "Ordenar mochila", cat: "habitos", fixed: true, days: [0,1,2,3,4], euros: 0.20, points: 8, needsApproval: false },
  { id: "t7", name: "Pasar el aspirador", cat: "hogar", fixed: false, days: [6], euros: 2.00, points: 10, needsApproval: true },
  { id: "t8", name: "Leer 20 minutos", cat: "deberes", fixed: false, days: [1,2,3,4,5,6,0], euros: 0.50, points: 15, needsApproval: false },
];

export const SAVINGS_GOALS_DEFAULT = [
  { id: "g1", name: "Patinete", target: 50, saved: 0, icon: "🛹", color: "var(--color-brand-purple)" },
  { id: "g2", name: "Videojuego", target: 40, saved: 0, icon: "🎮", color: "var(--color-brand-cyan)" },
];

export const SPLIT = { spend: 40, save: 40, invest: 20 };

export const DAYS_ES = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
export const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export const emoji = {
  star: "⭐", heart: "💙", sparkle: "✨", fire: "🔥", trophy: "🏆",
  coin: "🪙", piggy: "🏦", gift: "🎁", checkmark: "✅", calendar: "📅",
  chart: "📈", home: "🏠", book: "📚", bath: "🛁", task: "📋",
  lock: "🔒", unlock: "🔓", parent: "👨‍👩‍👧", streak: "🔥", moon: "🌙",
  sun: "☀️", rainbow: "⚡", flower: "🌱", butterfly: "🦋", cat: "🐱",
  rabbit: "🐰", bear: "🐻", unicorn: "🚀", cloud: "☁️", diamond: "💎",
};

export const LEVELS = [
  {min:0,    label:"🌱 Novato",         color:"var(--color-brand-cyan)"},
  {min:50,   label:"💡 Aprendiz",       color:"var(--color-brand-blue)"},
  {min:150,  label:"⚡ Ahorrador",      color:"var(--color-brand-indigo)"},
  {min:300,  label:"🚀 Inversor Joven", color:"var(--color-brand-purple)"},
  {min:500,  label:"📈 Analista",       color:"var(--color-brand-teal)"},
  {min:800,  label:"💼 Gestor Jefe",    color:"var(--color-brand-blueD)"},
  {min:1200, label:"💎 Visionario",     color:"var(--color-brand-cyan)"},
  {min:2000, label:"🐺 Lobo de Wall St",color:"var(--color-brand-indigo)"},
];
