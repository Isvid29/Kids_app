export const CATEGORIES = {
  hogar:   { label: "Hogar",    color: "var(--color-brand-blueD)",   bg: "var(--color-brand-blueL)",   icon: "✨", points: 20 },
  deberes: { label: "Deberes",  color: "var(--color-brand-purple)",    bg: "var(--color-brand-purpleL)",    icon: "💻", points: 40 },
  habitos: { label: "Hábitos",  color: "var(--color-brand-cyanD)",   bg: "var(--color-brand-cyanL)",   icon: "⚡", points: 15 },
  extra:   { label: "Extra",    color: "var(--color-brand-tealD)",  bg: "var(--color-brand-tealL)",  icon: "🔥", points: 50 },
};

export const DEFAULT_TASKS = [
  { id: "t1", name: "Hacer la cama",      icon: "🛏️", cat: "habitos", fixed: true, days: [1,2,3,4,5],   points: 15, needsApproval: false },
  { id: "t2", name: "Recoger el cuarto",  icon: "🧹", cat: "hogar",   fixed: true, days: [1,3,5],        points: 30, needsApproval: true  },
  { id: "t3", name: "Poner/quitar mesa",  icon: "🍽️", cat: "hogar",   fixed: true, days: [1,2,3,4,5],   points: 10, needsApproval: false },
  { id: "t4", name: "Hacer los deberes",  icon: "📖", cat: "deberes", fixed: true, days: [1,2,3,4],      points: 40, needsApproval: true  },
  { id: "t5", name: "Ducharse",           icon: "🚿", cat: "habitos", fixed: true, days: [1,2,3,4,5,6,0],points: 15, needsApproval: false },
  { id: "t6", name: "Ordenar mochila",    icon: "🎒", cat: "habitos", fixed: true, days: [0,1,2,3,4],    points: 10, needsApproval: false },
  { id: "t7", name: "Pasar el aspirador", icon: "🧺", cat: "hogar",   fixed: false, days: [6],            points: 50, needsApproval: true  },
  { id: "t8", name: "Leer 20 minutos",    icon: "📚", cat: "deberes", fixed: false, days: [1,2,3,4,5,6,0],points: 25, needsApproval: false },
];

export const SAVINGS_GOALS_DEFAULT = [
  { id: "g1", name: "Cascos Gaming", target: 50.00, saved: 0, icon: "🎧", color: "var(--color-brand-purple)" },
  { id: "g2", name: "Zapatillas Nuevas", target: 80.00, saved: 0, icon: "👟", color: "var(--color-brand-cyan)" },
  { id: "g3", name: "Videojuego", target: 60.00, saved: 0, icon: "🎮", color: "var(--color-brand-indigo)" },
];

export const SPLIT = { spend: 40, save: 40, invest: 20 };

export const DAYS_ES = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
export const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export const emoji = {
  star: "⚡", heart: "🖤", sparkle: "✨", fire: "🔥", trophy: "🏆",
  coin: "🪙", piggy: "💳", gift: "🎁", checkmark: "✅", calendar: "📅",
  chart: "📈", home: "🛋️", book: "📓", bath: "🚿", task: "🕹️",
  lock: "🔒", unlock: "🔓", parent: "🛡️", streak: "🔥", moon: "🌙",
  sun: "☀️", rainbow: "⚡", flower: "🌵", butterfly: "🌀", cat: "🎧",
  rabbit: "📱", bear: "💻", unicorn: "☄️", cloud: "☁️", diamond: "💎",
};

export const LEVELS = [
  {min:0,    label:"🔰 Rookie",         color:"var(--color-brand-cyan)"},
  {min:150,  label:"⚡ Hustler",        color:"var(--color-brand-blue)"},
  {min:400,  label:"💫 Rising Star",    color:"var(--color-brand-indigo)"},
  {min:800,  label:"🎮 Pro Gamer",      color:"var(--color-brand-purple)"},
  {min:1500, label:"🔥 Grind Master",   color:"var(--color-brand-teal)"},
  {min:2500, label:"💠 Elite",          color:"var(--color-brand-blueD)"},
  {min:4000, label:"🔱 Legend",         color:"var(--color-brand-cyan)"},
  {min:6000, label:"🌌 Mythic",         color:"var(--color-brand-indigo)"},
];

export const PASS_MILESTONES = [
  { level: 1, req: 0,    type: "avatar", value: "😎", desc: "Avatar Base" },
  { level: 2, req: 150,  type: "avatar", value: "🦊", desc: "Avatar Zorro" },
  { level: 3, req: 400,  type: "bg",     value: "bg-gradient-to-br from-brand-purple to-brand-indigo", desc: "Fondo Morado" },
  { level: 4, req: 800,  type: "multiplier", value: 1.1, desc: "Multiplicador x1.1" },
  { level: 5, req: 1500, type: "avatar", value: "🐉", desc: "Avatar Dragón" },
  { level: 6, req: 2500, type: "bg",     value: "bg-gradient-to-r from-brand-cyan to-brand-blueD", desc: "Fondo Neón" },
  { level: 7, req: 4000, type: "multiplier", value: 1.25, desc: "Multiplicador x1.25" },
  { level: 8, req: 6000, type: "avatar", value: "👑", desc: "Avatar Leyenda" },
];
