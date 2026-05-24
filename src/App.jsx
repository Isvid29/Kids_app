import { useState, useEffect } from "react";
import { useAppStore } from "./store/useAppStore";
import Confetti from "./components/Confetti";
import HomeView from "./views/HomeView";
import TasksView from "./views/TasksView";
import ChallengesView from "./views/ChallengesView";
import MoneyView from "./views/MoneyView";
import StatsView from "./views/StatsView";
import ParentView from "./views/ParentView";

export default function App() {
  const [view, setView] = useState("home");
  const [parentMode, setParentMode] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [toast, setToast] = useState(null);

  const { childName, streak, totalPoints, parentPin, equippedAvatar, equippedBg } = useAppStore();

  const [loaded, setLoaded] = useState(false);
  useEffect(() => { 
    if (equippedAvatar === "😎") {
      useAppStore.setState({ equippedAvatar: "/avatar_lia.png" });
    }
    setLoaded(true); 
  }, [equippedAvatar]);

  const showToast = (msg, type="success") => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 2500);
  };

  const fireConfetti = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2000);
  };

  // ── PIN modal ─────────────────────────────────────────────────────────────────
  const tryPin = (n) => {
    if (pinInput.length < 4) {
      const p = pinInput + n;
      setPinInput(p);
      if (p.length === 4) {
        setTimeout(() => {
          if (p === parentPin) {
            setParentMode(true);
            setShowPinModal(false);
            setPinInput("");
            setView("parent");
          } else {
            setPinError(true);
            setPinInput("");
            setTimeout(() => setPinError(false), 1500);
          }
        }, 100);
      }
    }
  };

  if (!loaded) return (
    <div className="flex items-center justify-center h-screen bg-brand-cream text-3xl">🌸 Cargando...</div>
  );

  return (
    <div className="min-h-screen pb-20 relative font-sans">
      <Confetti active={confetti} />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 text-white px-6 py-2.5 rounded-full font-bold text-sm z-[9998] animate-pop shadow-lg whitespace-nowrap ${toast.type === 'error' ? 'bg-brand-blueD' : toast.type === 'warning' ? 'bg-brand-indigo' : 'bg-brand-cyan'}`}>
          {toast.msg}
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-[#3D2B4E99] flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-3xl p-8 min-w-[300px] text-center animate-pop shadow-2xl">
            <div className="text-5xl mb-2">🔒</div>
            <h3 className="text-brand-dark m-0 mb-2 text-xl">Zona Padres</h3>
            <p className="text-brand-gray text-sm m-0 mb-5">Introduce el PIN de 4 dígitos</p>
            <div className="flex gap-2 justify-center mb-4">
              {[0,1,2,3].map(i=>(
                <div key={i} className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center text-xl transition-all ${pinError ? 'border-brand-blueD' : 'border-brand-purple'} ${pinInput.length > i ? 'bg-brand-dark' : 'bg-transparent'}`}>
                  {pinInput.length > i ? "●" : ""}
                </div>
              ))}
            </div>
            {pinError && <p className="text-brand-blueD text-[13px] m-0 mb-2 animate-wiggle">❌ PIN incorrecto</p>}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[1,2,3,4,5,6,7,8,9].map(n=>(
                <button key={n} className="btn-primary p-3 bg-brand-purpleL border-none rounded-xl text-lg font-bold text-brand-dark" onClick={()=>tryPin(n.toString())}>{n}</button>
              ))}
              <button className="btn-primary p-3 bg-brand-blueL border-none rounded-xl text-sm text-brand-dark" onClick={()=>setPinInput(p=>p.slice(0,-1))}>⌫</button>
              <button className="btn-primary p-3 bg-brand-purpleL border-none rounded-xl text-lg font-bold text-brand-dark" onClick={()=>tryPin("0")}>0</button>
              <button className="btn-primary p-3 bg-brand-cream border-none rounded-xl text-sm text-brand-gray" onClick={()=>{setShowPinModal(false);setPinInput("");}}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className="max-w-[480px] mx-auto px-4 pt-4">
        
        {/* Header - Only hide on Parent View */}
        {view !== "parent" && (
          <div className={`${equippedBg} rounded-3xl p-5 mb-5 shadow-[0_8px_24px_rgba(59,130,246,0.4)] text-white relative overflow-hidden transition-all duration-500`}>
            <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none select-none">
              {equippedAvatar && (equippedAvatar.includes('.') || equippedAvatar.includes('/')) ? (
                <img 
                  src={equippedAvatar.startsWith('http') || equippedAvatar.startsWith('data:') ? equippedAvatar : `${import.meta.env.BASE_URL}${equippedAvatar.replace(/^\//, '')}`} 
                  alt="Avatar" 
                  className="w-24 h-24 object-cover rounded-full" 
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=Lia&background=8B5CF6&color=fff&rounded=true&size=128"; }}
                />
              ) : (
                <span className="text-6xl">{equippedAvatar || '😎'}</span>
              )}
            </div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="m-0 text-[13px] opacity-85">
                  {new Date().getHours() < 12 ? "¡Buenos días" : new Date().getHours() < 20 ? "¡Buenas tardes" : "¡Buenas noches"}, {childName}! 👋
                </p>
                <h1 className="m-0 mt-0.5 text-[22px] font-bold flex items-center gap-2">
                  <span className="flex-shrink-0">
                    {equippedAvatar && (equippedAvatar.includes('.') || equippedAvatar.includes('/')) ? (
                      <img 
                        src={equippedAvatar.startsWith('http') || equippedAvatar.startsWith('data:') ? equippedAvatar : `${import.meta.env.BASE_URL}${equippedAvatar.replace(/^\//, '')}`} 
                        alt="Avatar" 
                        className="w-8 h-8 object-cover rounded-full border-2 border-white bg-white/20" 
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=Lia&background=8B5CF6&color=fff&rounded=true&size=64"; }}
                      />
                    ) : (
                      equippedAvatar || '😎'
                    )}
                  </span>
                  Tareas de {childName}
                </h1>
              </div>
              <div className="text-right">
                <div className={`bg-white/25 rounded-2xl px-3.5 py-1.5 text-[13px] font-bold ${streak >= 3 ? 'animate-pulse-slow' : ''}`}>
                  🔥 {streak} días seguidos
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between mb-1.5 text-[13px]">
                <span className="font-bold">Mis puntos acumulados:</span>
                <span className="font-black text-base">{totalPoints} 🪙</span>
              </div>
            </div>
          </div>
        )}

        {/* Views */}
        {view === "home" && <HomeView fireConfetti={fireConfetti} showToast={showToast} />}
        {view === "tasks"      && <TasksView showToast={showToast} />}
        {view === "challenges" && <ChallengesView />}
        {view === "money"      && <MoneyView fireConfetti={fireConfetti} showToast={showToast} />}
        {view === "stats" && <StatsView />}
        {view === "parent" && parentMode && <ParentView showToast={showToast} />}

      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-[3px] border-brand-blueL flex justify-around py-1.5 pb-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {[
          {id:"home",       icon:"🏠",  label:"Inicio"},
          {id:"tasks",      icon:"📋",  label:"Tareas"},
          {id:"challenges", icon:"🏆",  label:"Retos"},
          {id:"money",      icon:"🪙",  label:"Dinero"},
          {id:"stats",      icon:"📊",  label:"Logros"},
          {id:"parent",     icon:"🔒",  label:"Padres"},
        ].map(n=>(
          <button key={n.id} className="nav-btn bg-transparent border-none flex flex-col items-center gap-0.5 px-2 cursor-pointer"
            style={{ opacity: view===n.id ? 1 : 0.5 }}
            onClick={()=>{
              if(n.id==="parent" && !parentMode) { setShowPinModal(true); }
              else if(n.id==="parent" && parentMode) { setParentMode(false); setView("home"); }
              else setView(n.id);
            }}>
            <span className="transition-all" style={{fontSize:n.id===view?26:22}}>{n.id==="parent" ? (parentMode?"🔓":"🔒") : n.icon}</span>
            <span className={`text-[10px] ${view===n.id?'text-brand-blueD font-bold':'text-brand-gray'}`}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
