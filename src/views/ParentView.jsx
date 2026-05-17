import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIES, SPLIT, DAYS_ES } from '../utils/constants';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';

const DAYS_LABELS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

export default function ParentView({ showToast }) {
  const { tasks, completions, approveTask, rejectTask, childName, setChildName, setParentPin, wallet, totalEuros, addTask, deleteTask, transactions } = useAppStore();
  const [tab, setTab] = useState("pending");
  const [newPin, setNewPin] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ name:"", cat:"hogar", fixed:false, days:[1,2,3,4,5], euros:1, points:10, needsApproval:false });

  const getPending = () => {
    const pending = [];
    Object.entries(completions).forEach(([key, val]) => {
      if (val.pendingApproval) {
        const [taskId, ...rest] = key.split("_");
        const dateStr = rest.join("_");
        const task = tasks.find(t=>t.id===taskId);
        if (task) pending.push({ taskId, dateStr, task, key });
      }
    });
    return pending;
  };

  const pending = getPending();
  const totalDone = Object.values(completions).filter(c=>c.done).length;

  const handleAddTask = () => {
    if (!newTask.name.trim()) return;
    addTask(newTask);
    setShowAddTask(false);
    setNewTask({ name:"", cat:"hogar", fixed:false, days:[1,2,3,4,5], euros:1, points:10, needsApproval:false });
    showToast("✅ Tarea añadida");
  };

  const tabs = [
    {id:"pending",label:"Pendientes"},
    {id:"tasks",label:"Tareas"},
    {id:"summary",label:"Resumen"},
    {id:"settings",label:"Config"}
  ];

  return (
    <div className="animate-slide-up pb-8">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-3xl">👨‍👩‍👦</span>
        <div>
          <h2 className="m-0 text-brand-dark text-lg">Panel de Padres</h2>
          <p className="m-0 text-[13px] text-brand-gray">Modo administrador activo 🔓</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 bg-brand-cream rounded-xl p-1">
        {tabs.map(t=>(
          <button key={t.id} className={`btn-primary flex-1 p-2 border-none rounded-lg text-xs font-bold ${tab===t.id ? 'bg-gradient-to-br from-brand-blue to-brand-blueD text-white' : 'bg-transparent text-brand-gray'}`} onClick={()=>setTab(t.id)}>
            {t.label}{t.id==="pending"&&pending.length>0?` (${pending.length})`:""}
          </button>
        ))}
      </div>

      {/* Pending approvals */}
      {tab==="pending" && (
        <>
          <h3 className="text-brand-dark m-0 mb-2.5 text-base">⏳ Tareas pendientes de aprobación</h3>
          {pending.length===0 && <p className="text-brand-gray text-center p-5">¡No hay nada pendiente! 🎉</p>}
          {pending.map(({taskId, dateStr, task, key})=>(
            <Card key={key} className="mb-2.5 border-l-4 border-brand-indigo">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="text-2xl">{CATEGORIES[task.cat].icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-brand-dark">{task.name}</div>
                  <div className="text-xs text-brand-gray">+{task.euros.toFixed(2)}€ · +{task.points}pts · {dateStr}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary flex-1 p-2 bg-brand-blueL border-none rounded-xl text-brand-blueD font-bold" onClick={() => { rejectTask(taskId, dateStr); showToast("❌ Tarea rechazada"); }}>❌ Rechazar</button>
                <button className="btn-primary flex-1 p-2 bg-brand-cyanL border-none rounded-xl text-[#2d8a60] font-bold" onClick={() => { approveTask(taskId, dateStr); showToast("✅ Tarea aprobada"); }}>✅ Aprobar</button>
              </div>
            </Card>
          ))}
        </>
      )}

      {/* Task management */}
      {tab==="tasks" && (
        <>
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="m-0 text-brand-dark text-base">📋 Gestionar tareas</h3>
            <button className="btn-primary bg-gradient-to-br from-brand-cyan to-[#5eb888] border-none rounded-xl text-white px-3.5 py-1.5 font-bold text-[13px]" onClick={()=>setShowAddTask(true)}>
              + Añadir
            </button>
          </div>

          {showAddTask && (
            <Card className="mb-3.5 bg-brand-cyanL">
              <h4 className="m-0 mb-3 text-brand-dark">Nueva tarea</h4>
              <input placeholder="Nombre de la tarea" value={newTask.name} onChange={e=>setNewTask(t=>({...t,name:e.target.value}))}
                className="w-full p-2 px-3 rounded-xl border-2 border-brand-blueL mb-2 text-sm box-border" />
              <div className="flex gap-2 mb-2">
                <select value={newTask.cat} onChange={e=>setNewTask(t=>({...t,cat:e.target.value}))}
                  className="flex-1 p-2 rounded-xl border-2 border-brand-blueL text-[13px] bg-white">
                  {Object.entries(CATEGORIES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2 mb-2">
                <input type="number" placeholder="€" value={newTask.euros} onChange={e=>setNewTask(t=>({...t,euros:parseFloat(e.target.value)||0}))}
                  className="flex-1 p-2 rounded-xl border-2 border-brand-blueL text-[13px]" />
                <input type="number" placeholder="Puntos" value={newTask.points} onChange={e=>setNewTask(t=>({...t,points:parseInt(e.target.value)||0}))}
                  className="flex-1 p-2 rounded-xl border-2 border-brand-blueL text-[13px]" />
              </div>
              <p className="m-0 mb-1.5 text-xs text-brand-gray">Días activos:</p>
              <div className="flex gap-1 mb-2.5">
                {DAYS_LABELS.map((d,i)=>(
                  <button key={i} className={`btn-primary flex-1 py-1.5 px-0.5 border-none rounded-lg text-[11px] font-bold ${newTask.days.includes(i) ? 'bg-brand-blueD text-white' : 'bg-brand-cream text-brand-gray'}`}
                    onClick={()=>setNewTask(t=>({...t,days:t.days.includes(i)?t.days.filter(x=>x!==i):[...t.days,i]}))}>
                    {d}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-[13px] text-brand-dark mb-3 cursor-pointer">
                <input type="checkbox" checked={newTask.needsApproval} onChange={e=>setNewTask(t=>({...t,needsApproval:e.target.checked}))} className="w-4 h-4 accent-brand-blueD" />
                Requiere aprobación de padres
              </label>
              <div className="flex gap-2">
                <button className="btn-primary flex-1 p-2 bg-brand-cream border-none rounded-xl text-brand-gray" onClick={()=>setShowAddTask(false)}>Cancelar</button>
                <button className="btn-primary flex-1 p-2 bg-gradient-to-br from-brand-cyan to-[#5eb888] border-none rounded-xl text-white font-bold" onClick={handleAddTask}>Guardar</button>
              </div>
            </Card>
          )}

          {tasks.map(task => {
            const cat = CATEGORIES[task.cat];
            return (
              <div key={task.id} className="bg-white rounded-xl p-2.5 px-3.5 mb-2 flex items-center gap-2.5 shadow-sm">
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-brand-dark text-sm">{task.name}</div>
                  <div className="text-[11px] text-brand-gray">{task.euros.toFixed(2)}€ · {task.points}pts · {task.days.map(d=>DAYS_LABELS[d]).join(", ")}</div>
                </div>
                {!task.fixed && (
                  <button className="btn-primary bg-brand-blueL border-none rounded-lg text-brand-blueD px-2.5 py-1.5 text-[13px]" onClick={()=>{ deleteTask(task.id); showToast("🗑️ Tarea eliminada"); }}>🗑️</button>
                )}
                {task.fixed && <span className="text-[11px] text-brand-gray">🔒 fija</span>}
              </div>
            );
          })}
        </>
      )}

      {/* Summary */}
      {tab==="summary" && (
        <>
          <h3 className="text-brand-dark m-0 mb-3 text-base">📊 Resumen</h3>
          <div className="grid grid-cols-2 gap-2.5 mb-3.5">
            <StatCard icon="✅" label="Total completadas" value={totalDone} color="var(--color-brand-cyan)" />
            <StatCard icon="💰" label="Total ganado" value={`${totalEuros.toFixed(2)}€`} color="var(--color-brand-blue)" />
          </div>
          <Card className="mb-3">
            <h4 className="m-0 mb-3 text-brand-dark">🏦 Distribución hucha</h4>
            <div className="flex flex-col gap-2">
              {[
                {label:"Para gastar",amt:wallet.spend,color:"var(--color-brand-blue)",pct:SPLIT.spend},
                {label:"Para ahorrar",amt:wallet.save,color:"var(--color-brand-cyan)",pct:SPLIT.save},
                {label:"Para invertir",amt:wallet.invest,color:"var(--color-brand-purple)",pct:SPLIT.invest}
              ].map(w=>(
                <div key={w.label}>
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="text-brand-dark font-bold">{w.label} ({w.pct}%)</span>
                    <span className="font-bold" style={{color:w.color}}>{w.amt.toFixed(2)}€</span>
                  </div>
                  <ProgressBar pct={(w.amt/Math.max(totalEuros,0.01))*100} color={w.color} />
                </div>
              ))}
            </div>
          </Card>
          <h4 className="text-brand-dark m-0 mb-2 text-[15px]">📜 Últimas transacciones</h4>
          {transactions.slice(0,10).map(tx=>(
            <div key={tx.id} className="bg-white rounded-xl p-2 px-3 mb-1.5 flex justify-between shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div>
                <div className="font-bold text-brand-dark text-[13px]">{tx.desc}</div>
                <div className="text-[11px] text-brand-gray">{new Date(tx.date).toLocaleDateString("es-ES")}</div>
              </div>
              <span className={`font-bold ${tx.euros>0 ? 'text-brand-cyan' : 'text-brand-blueD'}`}>{tx.euros>0?"+":""}{tx.euros.toFixed(2)}€</span>
            </div>
          ))}
        </>
      )}

      {/* Settings */}
      {tab==="settings" && (
        <>
          <h3 className="text-brand-dark m-0 mb-3 text-base">⚙️ Configuración</h3>
          <Card className="mb-3">
            <label className="block text-[13px] text-brand-gray mb-1.5">Nombre de la niña/o</label>
            <input value={childName} onChange={e=>setChildName(e.target.value)}
              className="w-full p-2 px-3 rounded-xl border-2 border-brand-blueL text-sm box-border" />
          </Card>
          <Card>
            <label className="block text-[13px] text-brand-gray mb-1.5">Cambiar PIN (4 dígitos)</label>
            <div className="flex gap-2">
              <input type="password" maxLength={4} placeholder="Nuevo PIN" value={newPin} onChange={e=>setNewPin(e.target.value)}
                className="flex-1 p-2 px-3 rounded-xl border-2 border-brand-blueL text-sm" />
              <button className="btn-primary p-2 px-3.5 bg-gradient-to-br from-brand-blue to-brand-blueD border-none rounded-xl text-white font-bold" 
                onClick={()=>{ if(newPin.length===4){setParentPin(newPin);setNewPin("");showToast("✅ PIN actualizado");}else showToast("❌ El PIN debe tener 4 dígitos","error");}}>
                Guardar
              </button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
