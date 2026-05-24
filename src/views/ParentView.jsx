import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIES, SPLIT } from '../utils/constants';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';

const DAYS_LABELS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

export default function ParentView({ showToast }) {
  const { 
    tasks, 
    completions, 
    approveTask, 
    rejectTask, 
    childName, 
    setChildName, 
    setParentPin, 
    wallet, 
    totalPoints, 
    addTask, 
    deleteTask, 
    updateTask,
    transactions,
    monthlyAllowance,
    setMonthlyAllowance,
    payAllowance,
    monthlyTarget,
    setMonthlyTarget,
    deleteTransaction,
    familyTasks,
    addFamilyTask,
    deleteFamilyTask,
    completeFamilyTask,
    addLoan,
    savingsGoals,
    applyInterestToGoal,
    ajusteManual,
    parentPin
  } = useAppStore();

  const [tab, setTab] = useState("pending");
  const [newPin, setNewPin] = useState("");
  
  // Custom allowance deduction states
  const [customAllowanceAmt, setCustomAllowanceAmt] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [showDeductionInput, setShowDeductionInput] = useState(false);

  // Security PIN states
  const [pendingAction, setPendingAction] = useState(null);
  const [actionPinInput, setActionPinInput] = useState("");
  const [actionPinError, setActionPinError] = useState(false);

  // Tasks management states
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ name:"", icon:"⭐", cat:"hogar", fixed:false, days:[1,2,3,4,5], rewardType:"points", points:20, euros:0.00, needsApproval:true });
  const [editingTask, setEditingTask] = useState(null);

  // Family task states
  const [newFamilyTask, setNewFamilyTask] = useState({ name:"", assignedTo:"mom", points: 10 });

  // Finance tool states
  const [newLoan, setNewLoan] = useState({ amount: "", note: "" });
  const [interestConfig, setInterestConfig] = useState({ goalId: "", rate: 2 });

  // Rejection note states
  const [rejectingItem, setRejectingItem] = useState(null); // stores { taskId, dateStr, taskName }
  const [rejectionNote, setRejectionNote] = useState("");

  // Photo enlargement state
  const [activePhotoUrl, setActivePhotoUrl] = useState(null);

  const getPending = () => {
    const pending = [];
    Object.entries(completions).forEach(([key, val]) => {
      if (val.pendingApproval) {
        const [taskId, ...rest] = key.split("_");
        const dateStr = rest.join("_");
        const task = tasks.find(t=>t.id===taskId);
        if (task) pending.push({ taskId, dateStr, task, key, photo: val.photo });
      }
    });
    return pending;
  };

  const pending = getPending();
  const totalDone = Object.values(completions).filter(c=>c.done).length;

  const handleAddTask = () => {
    if (!newTask.name.trim()) return;
    if (newTask.rewardType === 'points' && newTask.points <= 0) return;
    if (newTask.rewardType === 'euros' && newTask.euros <= 0) return;
    addTask(newTask);
    setShowAddTask(false);
    setNewTask({ name:"", icon:"⭐", cat:"hogar", fixed:false, days:[1,2,3,4,5], rewardType:"points", points:20, euros:0.00, needsApproval:true });
    showToast("✅ Tarea creada con éxito!");
  };

  const handleSaveEditTask = () => {
    if (!editingTask || !editingTask.name.trim()) return;
    if (editingTask.rewardType === 'points' && editingTask.points <= 0) return;
    if (editingTask.rewardType === 'euros' && editingTask.euros <= 0) return;
    updateTask(editingTask.id, editingTask);
    setEditingTask(null);
    showToast("✅ Tarea modificada con éxito!");
  };

  const handleSendRejection = () => {
    if (!rejectingItem) return;
    rejectTask(rejectingItem.taskId, rejectingItem.dateStr, rejectionNote);
    showToast(`❌ Tarea rechazada: ${rejectingItem.taskName}`);
    setRejectingItem(null);
    setRejectionNote("");
  };

  const handlePayAllowance = (amt, label) => {
    const success = payAllowance(amt, label);
    if (success) {
      showToast(`💶 ¡Abonado ${amt.toFixed(2)}€ de Paga Mensual y puntos reseteados!`);
      setCustomAllowanceAmt("");
      setShowDeductionInput(false);
    } else {
      showToast("❌ Error al abonar paga mensual", "error");
    }
  };

  const requirePinAction = (actionFn) => {
    setPendingAction(() => actionFn);
    setActionPinInput("");
  };

  const tryActionPin = (n) => {
    if (actionPinInput.length < 4) {
      const p = actionPinInput + n;
      setActionPinInput(p);
      if (p.length === 4) {
        setTimeout(() => {
          if (p === parentPin) {
            if(pendingAction) pendingAction();
            setPendingAction(null);
          } else {
            setActionPinError(true);
            setActionPinInput("");
            setTimeout(() => setActionPinError(false), 1500);
          }
        }, 100);
      }
    }
  };

  const tabs = [
    {id:"pending",label:`Pendientes (${pending.length})`},
    {id:"tasks",label:"Tareas"},
    {id:"summary",label:"Resumen"},
    {id:"settings",label:"Config"}
  ];

  return (
    <div className="animate-slide-up pb-8 font-sans">
      
      {/* Pending Action PIN Modal */}
      {pendingAction && (
        <div className="fixed inset-0 bg-[#3D2B4E99] flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl p-8 min-w-[300px] text-center animate-pop shadow-2xl">
            <div className="text-5xl mb-2">🔐</div>
            <h3 className="text-brand-dark m-0 mb-2 text-xl">Confirma Acción</h3>
            <p className="text-brand-gray text-sm m-0 mb-5">Introduce tu PIN para autorizar</p>
            <div className="flex gap-2 justify-center mb-4">
              {[0,1,2,3].map(i=>(
                <div key={i} className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center text-xl transition-all ${actionPinError ? 'border-brand-blueD' : 'border-brand-purple'} ${actionPinInput.length > i ? 'bg-brand-dark' : 'bg-transparent'}`}>
                  {actionPinInput.length > i ? "●" : ""}
                </div>
              ))}
            </div>
            {actionPinError && <p className="text-brand-blueD text-[13px] m-0 mb-2 animate-wiggle">❌ PIN incorrecto</p>}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[1,2,3,4,5,6,7,8,9].map(n=>(
                <button key={n} className="btn-primary p-3 bg-brand-purpleL border-none rounded-xl text-lg font-bold text-brand-dark cursor-pointer" onClick={()=>tryActionPin(n.toString())}>{n}</button>
              ))}
              <button className="btn-primary p-3 bg-brand-blueL border-none rounded-xl text-sm text-brand-dark cursor-pointer" onClick={()=>setActionPinInput(p=>p.slice(0,-1))}>⌫</button>
              <button className="btn-primary p-3 bg-brand-purpleL border-none rounded-xl text-lg font-bold text-brand-dark cursor-pointer" onClick={()=>tryActionPin("0")}>0</button>
              <button className="btn-primary p-3 bg-brand-cream border-none rounded-xl text-sm text-brand-gray cursor-pointer" onClick={()=>{setPendingAction(null);setActionPinInput("");}}>✕</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-3xl">🔑</span>
        <div>
          <h2 className="m-0 text-brand-dark text-lg font-bold">Panel Parental Admin</h2>
          <p className="m-0 text-[12px] text-brand-gray font-bold">Modo Administrador Activo 🔓</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 bg-brand-cream rounded-xl p-1 border border-brand-blueL">
        {tabs.map(t=>(
          <button key={t.id} className={`btn-primary flex-1 py-2.5 border-none rounded-lg text-xs font-extrabold cursor-pointer transition-all ${tab===t.id ? 'bg-gradient-to-br from-brand-blue to-brand-blueD text-white shadow-sm' : 'bg-transparent text-brand-gray'}`} onClick={()=>setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Pending approvals tab */}
      {tab==="pending" && (
        <>
          <h3 className="text-brand-dark m-0 mb-3 text-base font-bold flex items-center gap-1.5">
            <span>⏳</span> Chores Pendientes de Aprobación
          </h3>
          {pending.length===0 && (
            <div className="bg-brand-cyanL text-brand-teal p-6 rounded-2xl text-center border-2 border-brand-cyan/20">
              <span className="text-3xl block mb-2">🎉</span>
              <p className="m-0 text-sm font-bold">¡Buen trabajo! No hay tareas pendientes de validación.</p>
            </div>
          )}
          
          {pending.map(({taskId, dateStr, task, key, photo})=>(
            <Card key={key} className="mb-3.5 border-l-4 border-brand-indigo shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{task.icon || "✨"}</span>
                    <div>
                      <div className="font-extrabold text-brand-dark text-sm">{task.name}</div>
                      <div className="text-[11px] text-brand-gray font-bold font-sans">
                        {task.rewardType === 'euros' ? `+${task.euros.toFixed(2)} €` : `+${task.points} pts`} · {dateStr}
                      </div>
                    </div>
                  </div>
                  
                  {/* Photo Proof Box */}
                  {photo ? (
                    <div className="mb-3">
                      <div className="text-[10px] font-bold text-brand-gray mb-1 uppercase tracking-wider">Prueba de foto 📸:</div>
                      <div className="relative group w-28 h-20 rounded-xl overflow-hidden border-2 border-brand-blueL cursor-zoom-in shadow-sm bg-brand-cream" onClick={() => setActivePhotoUrl(photo)}>
                        <img src={photo} alt="Proof thumbnail" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-bold">Ampliar 🔍</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-brand-gray mb-2.5 italic">No se adjuntó foto.</div>
                  )}
                </div>

                <div className="flex gap-2 items-end">
                  <button 
                    className="btn-primary flex-1 py-2 px-3 bg-brand-blueL border-none rounded-xl text-brand-blueD font-bold text-xs cursor-pointer" 
                    onClick={() => setRejectingItem({ taskId, dateStr, taskName: task.name })}
                  >
                    ❌ Rechazar
                  </button>
                  <button 
                    className="btn-primary flex-1 py-2 px-3 bg-brand-cyanL border-none rounded-xl text-[#2d8a60] font-bold text-xs cursor-pointer" 
                    onClick={() => { approveTask(taskId, dateStr); showToast("✅ Tarea aprobada con éxito!"); }}
                  >
                    ✅ Aprobar
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </>
      )}

      {/* Task management tab */}
      {tab==="tasks" && (
        <>
          <div className="flex justify-between items-center mb-3">
            <h3 className="m-0 text-brand-dark text-base font-bold">📋 Catálogo General de Chores</h3>
            <button 
              className="btn-primary bg-gradient-to-br from-brand-cyan to-brand-teal border-none rounded-xl text-white px-3.5 py-1.5 font-bold text-xs shadow-sm cursor-pointer" 
              onClick={()=>setShowAddTask(true)}
            >
              + Nueva Tarea
            </button>
          </div>

          {/* Add task form inline */}
          {showAddTask && (
            <Card className="mb-4 bg-brand-cyanL border border-brand-cyan/20 animate-pop">
              <h4 className="m-0 mb-3 text-brand-dark font-extrabold text-sm uppercase">Crear Nueva Tarea</h4>
              
              <label className="block text-[11px] font-bold text-brand-gray mb-1">Nombre:</label>
              <input placeholder="Ej. Doblar ropa limpia" value={newTask.name} onChange={e=>setNewTask(t=>({...t,name:e.target.value}))}
                className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-2 text-xs text-brand-dark focus:outline-none" />
              
              <label className="block text-[11px] font-bold text-brand-gray mb-1">Icono de la Tarea:</label>
              <div className="flex gap-1.5 flex-wrap mb-3">
                {["⭐","🛏️","🧹","🍽️","📖","🚿","🎒","🧺","📚","🎮","💻","🎧","📱","🏋️","🎨","🎵","🌿","🍳","🐕","⚽","🎯","👗","👟"].map(em => (
                  <button key={em}
                    className={`btn-primary w-8 h-8 rounded-lg text-base flex items-center justify-center border-2 cursor-pointer transition-all ${newTask.icon===em ? 'border-brand-blueD bg-brand-blueL' : 'border-transparent bg-white'}`}
                    onClick={()=>setNewTask(t=>({...t,icon:em}))}>{em}</button>
                ))}
              </div>
              
              <div className="mb-3">
                <label className="block text-[11px] font-bold text-brand-gray mb-1">Tipo de Recompensa:</label>
                <select 
                  value={newTask.rewardType || "points"} 
                  onChange={e => setNewTask(t => ({ ...t, rewardType: e.target.value, points: e.target.value === 'points' ? 20 : 0, euros: e.target.value === 'euros' ? 5.00 : 0 }))}
                  className="w-full p-2.5 rounded-xl border-2 border-brand-blueL text-xs font-semibold text-brand-dark bg-white focus:outline-none"
                >
                  <option value="points">🪙 Puntos de Rutina</option>
                  <option value="euros">💶 Euros (€) Directos</option>
                </select>
              </div>

              <div className="flex gap-2.5 mb-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-brand-gray mb-1">Categoría:</label>
                  <select value={newTask.cat} onChange={e=>setNewTask(t=>({...t,cat:e.target.value}))}
                    className="w-full p-2 rounded-xl border-2 border-brand-blueL text-xs font-semibold text-brand-dark bg-white">
                    {Object.entries(CATEGORIES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
                <div className="w-[120px]">
                  {newTask.rewardType === 'euros' ? (
                    <>
                      <label className="block text-[11px] font-bold text-brand-gray mb-1">Euros (€):</label>
                      <input type="number" step="0.01" placeholder="5.00" value={newTask.euros} onChange={e=>setNewTask(t=>({...t,euros:parseFloat(e.target.value)||0.00}))}
                        className="w-full p-2 rounded-xl border-2 border-brand-blueL text-xs text-brand-dark focus:outline-none text-center" />
                    </>
                  ) : (
                    <>
                      <label className="block text-[11px] font-bold text-brand-gray mb-1">Puntos:</label>
                      <input type="number" placeholder="20" value={newTask.points} onChange={e=>setNewTask(t=>({...t,points:parseInt(e.target.value)||0}))}
                        className="w-full p-2 rounded-xl border-2 border-brand-blueL text-xs text-brand-dark focus:outline-none text-center" />
                    </>
                  )}
                </div>
              </div>

              <p className="m-0 mb-1.5 text-[11px] font-bold text-brand-gray uppercase">Días Activos:</p>
              <div className="flex gap-1 mb-3.5">
                {DAYS_LABELS.map((d,i)=>(
                  <button key={i} className={`btn-primary flex-1 py-2 border-none rounded-lg text-[10px] font-bold cursor-pointer transition-all ${newTask.days.includes(i) ? 'bg-brand-blueD text-white shadow-sm' : 'bg-brand-cream text-brand-gray'}`}
                    onClick={()=>setNewTask(t=>({...t,days:t.days.includes(i)?t.days.filter(x=>x!==i):[...t.days,i]}))}>
                    {d}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-brand-dark mb-4 cursor-pointer">
                <input type="checkbox" checked={newTask.needsApproval} onChange={e=>setNewTask(t=>({...t,needsApproval:e.target.checked}))} className="w-4 h-4 accent-brand-blueD" />
                Requiere Prueba de Foto 📸 (Validación Parental)
              </label>

              <div className="flex gap-2">
                <button className="btn-primary flex-1 py-2.5 bg-brand-cream border-none rounded-xl text-brand-gray font-bold text-xs cursor-pointer" onClick={()=>setShowAddTask(false)}>Cancelar</button>
                <button className="btn-primary flex-1 py-2.5 bg-gradient-to-br from-brand-cyan to-brand-teal border-none rounded-xl text-white font-bold text-xs cursor-pointer shadow-sm" onClick={handleAddTask}>Guardar Tarea</button>
              </div>
            </Card>
          )}

          {/* Edit Task dialog overlay */}
          {editingTask && (
            <div className="fixed inset-0 bg-[#0F172ACC] flex items-center justify-center z-[2000] p-4">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full animate-pop shadow-2xl">
                <h3 className="m-0 mb-4 text-brand-dark text-lg font-bold text-center">✏️ Editar Tarea</h3>
                
                <label className="block text-[11px] font-bold text-brand-gray mb-1 uppercase">Nombre de Tarea:</label>
                <input value={editingTask.name} onChange={e => setEditingTask(t => ({...t, name: e.target.value}))}
                  className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-2 text-xs text-brand-dark focus:outline-none" />

                <label className="block text-[11px] font-bold text-brand-gray mb-1 uppercase">Icono:</label>
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {["⭐","🛏️","🧹","🍽️","📖","🚿","🎒","🧺","📚","🎮","💻","🎧","📱","🏋️","🎨","🎵","🌿","🍳","🐕","⚽","🎯","👗","👟"].map(em => (
                    <button key={em}
                      className={`btn-primary w-8 h-8 rounded-lg text-base flex items-center justify-center border-2 cursor-pointer transition-all ${editingTask.icon===em ? 'border-brand-blueD bg-brand-blueL' : 'border-transparent bg-brand-cream'}`}
                      onClick={() => setEditingTask(t => ({...t, icon: em}))}>{em}</button>
                  ))}
                </div>

                <div className="mb-3">
                  <label className="block text-[11px] font-bold text-brand-gray mb-1 uppercase">Tipo de Recompensa:</label>
                  <select 
                    value={editingTask.rewardType || "points"} 
                    onChange={e => setEditingTask(t => ({ ...t, rewardType: e.target.value, points: e.target.value === 'points' ? 20 : 0, euros: e.target.value === 'euros' ? 5.00 : 0 }))}
                    className="w-full p-2.5 rounded-xl border-2 border-brand-blueL text-xs font-semibold text-brand-dark bg-white focus:outline-none"
                  >
                    <option value="points">🪙 Puntos de Rutina</option>
                    <option value="euros">💶 Euros (€) Directos</option>
                  </select>
                </div>

                <div className="flex gap-2.5 mb-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-brand-gray mb-1 uppercase">Categoría:</label>
                    <select value={editingTask.cat} onChange={e => setEditingTask(t => ({...t, cat: e.target.value}))}
                      className="w-full p-2.5 rounded-xl border-2 border-brand-blueL text-xs font-semibold text-brand-dark bg-white focus:outline-none">
                      {Object.entries(CATEGORIES).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                    </select>
                  </div>
                  <div className="w-[120px]">
                    {editingTask.rewardType === 'euros' ? (
                      <>
                        <label className="block text-[11px] font-bold text-brand-gray mb-1 uppercase">Euros (€):</label>
                        <input type="number" step="0.01" value={editingTask.euros} onChange={e => setEditingTask(t => ({...t, euros: parseFloat(e.target.value)||0.00}))}
                          className="w-full p-2.5 rounded-xl border-2 border-brand-blueL text-xs text-brand-dark text-center focus:outline-none" />
                      </>
                    ) : (
                      <>
                        <label className="block text-[11px] font-bold text-brand-gray mb-1 uppercase">Puntos:</label>
                        <input type="number" value={editingTask.points} onChange={e => setEditingTask(t => ({...t, points: parseInt(e.target.value, 10)||0}))}
                          className="w-full p-2.5 rounded-xl border-2 border-brand-blueL text-xs text-brand-dark text-center focus:outline-none" />
                      </>
                    )}
                  </div>
                </div>

                <p className="m-0 mb-1.5 text-[11px] font-bold text-brand-gray uppercase">Días Activos:</p>
                <div className="flex gap-1 mb-4">
                  {DAYS_LABELS.map((d,i)=>(
                    <button key={i} className={`btn-primary flex-1 py-2 border-none rounded-lg text-[10px] font-bold cursor-pointer transition-all ${editingTask.days.includes(i) ? 'bg-brand-blueD text-white shadow-sm' : 'bg-brand-cream text-brand-gray'}`}
                      onClick={() => setEditingTask(t => ({...t, days: t.days.includes(i) ? t.days.filter(x => x !== i) : [...t.days, i]}))}>
                      {d}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-brand-dark mb-5 cursor-pointer">
                  <input type="checkbox" checked={editingTask.needsApproval} onChange={e => setEditingTask(t => ({...t, needsApproval: e.target.checked}))} className="w-4 h-4 accent-brand-blueD" />
                  Requiere Prueba de Foto 📸 (Validación Parental)
                </label>

                <div className="flex gap-2">
                  <button className="btn-primary flex-1 py-2.5 bg-brand-cream border-none rounded-xl text-brand-gray font-bold text-xs cursor-pointer" onClick={() => setEditingTask(null)}>Cancelar</button>
                  <button className="btn-primary flex-1 py-2.5 bg-gradient-to-br from-brand-blue to-brand-blueD border-none rounded-xl text-white font-bold text-xs cursor-pointer shadow-sm" onClick={handleSaveEditTask}>Guardar Cambios</button>
                </div>
              </div>
            </div>
          )}

          {/* List of all chores */}
          {tasks.map(task => {
            const cat = CATEGORIES[task.cat];
            return (
              <div key={task.id} className="bg-white rounded-2xl p-3 px-4 mb-2.5 flex items-center gap-3 shadow-sm border border-brand-blueL animate-pop">
                <span className="text-2xl">{task.icon || "✨"}</span>
                <div className="flex-1">
                  <div className="font-extrabold text-brand-dark text-sm">{task.name}</div>
                  <div className="text-[10px] text-brand-gray font-bold mt-0.5">
                    {task.rewardType === 'euros' ? `${task.euros.toFixed(2)}€` : `${task.points} pts`} · {task.days.map(d=>DAYS_LABELS[d]).join(", ")}
                    {task.needsApproval && <span className="ml-2 text-brand-indigo font-bold">📷 foto</span>}
                    {task.fixed && <span className="ml-2 text-brand-purple font-extrabold uppercase">🔒 Sistema</span>}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    className="btn-primary bg-brand-purpleL border-none rounded-xl text-brand-purple px-2.5 py-1.5 text-xs font-bold cursor-pointer" 
                    onClick={() => setEditingTask({ ...task, rewardType: task.rewardType || "points" })}
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-primary bg-brand-blueL border-none rounded-xl text-brand-blueD px-2.5 py-1.5 text-xs font-bold cursor-pointer" 
                    onClick={() => { deleteTask(task.id); showToast("🗑️ Tarea eliminada"); }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}

          {/* Family Tasks Management */}
          <div className="mt-6 border-t-2 border-brand-blueL pt-4">
            <h3 className="m-0 text-brand-dark text-base font-bold mb-3 flex items-center gap-1.5">
              <span>👨‍👩‍👧</span> Tareas de Familia
            </h3>

            {/* Add Family Task Inline */}
            <Card className="mb-4 bg-brand-cream border border-brand-blueL shadow-sm animate-pop">
              <div className="flex gap-2">
                <input placeholder="Ej. Bajar a por el pan" value={newFamilyTask.name} onChange={e=>setNewFamilyTask(t=>({...t,name:e.target.value}))}
                  className="flex-1 p-2.5 rounded-xl border-2 border-brand-blueL text-xs text-brand-dark focus:outline-none" />
                <select value={newFamilyTask.assignedTo} onChange={e=>setNewFamilyTask(t=>({...t,assignedTo:e.target.value}))}
                  className="w-24 p-2.5 rounded-xl border-2 border-brand-blueL text-xs font-bold text-brand-dark focus:outline-none bg-white">
                  <option value="mom">👩 Mamá</option>
                  <option value="dad">👨 Papá</option>
                  <option value="child">👦 Hijo/a</option>
                </select>
                <input type="number" placeholder="Pts" value={newFamilyTask.points} onChange={e=>setNewFamilyTask(t=>({...t,points:parseInt(e.target.value)||0}))}
                  className="w-16 p-2.5 rounded-xl border-2 border-brand-blueL text-xs text-brand-dark focus:outline-none" />
              </div>
              <button className="mt-2 w-full btn-primary bg-brand-blueL text-brand-blueD font-bold border-none rounded-xl py-2 cursor-pointer text-xs" 
                onClick={() => {
                  if(!newFamilyTask.name.trim()) return;
                  addFamilyTask(newFamilyTask);
                  setNewFamilyTask({ name:"", assignedTo:"mom", points: 10 });
                  showToast("👨‍👩‍👧 Tarea familiar añadida");
                }}>Añadir Tarea Familiar</button>
            </Card>

            {/* List Family Tasks */}
            {familyTasks.map(ft => (
              <div key={ft.id} className={`rounded-xl p-3 mb-2 flex items-center gap-2 border shadow-sm ${ft.done ? 'bg-brand-cyanL border-brand-cyan' : 'bg-white border-brand-blueL'}`}>
                <div className="text-2xl">{ft.assignedTo==='mom'?'👩':ft.assignedTo==='dad'?'👨':'👦'}</div>
                <div className="flex-1">
                  <div className={`font-bold text-sm ${ft.done ? 'line-through opacity-50' : ''}`}>{ft.name}</div>
                  <div className="text-[10px] font-bold text-brand-gray">+{ft.points} pts</div>
                </div>
                {!ft.done ? (
                  <button className="btn-primary bg-brand-cyan text-white text-xs font-bold py-1.5 px-3 rounded-lg border-none cursor-pointer"
                    onClick={() => { completeFamilyTask(ft.id); showToast("✅ Tarea familiar completada"); }}>Marcar Hecho</button>
                ) : (
                  <span className="text-xl">✅</span>
                )}
                <button className="btn-primary bg-brand-red/10 text-brand-red text-xs font-bold py-1.5 px-2.5 rounded-lg border-none cursor-pointer ml-1"
                  onClick={() => { deleteFamilyTask(ft.id); showToast("🗑️ Tarea borrada"); }}>🗑️</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Summary tab */}
      {tab==="summary" && (
        <>
          <h3 className="text-brand-dark m-0 mb-3 text-base font-bold">📊 Balance General</h3>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <StatCard icon="✅" label="Tareas Completadas" value={totalDone} color="var(--color-brand-cyan)" />
            <StatCard icon="🪙" label="Puntos de Rutina" value={`${totalPoints} pts`} color="var(--color-brand-blue)" />
          </div>

          {/* Pay Allowance Paga Mensual Section */}
          <Card className="mb-4 shadow-sm border border-brand-purple bg-gradient-to-br from-white to-brand-purpleL/30">
            <h4 className="m-0 mb-1.5 text-brand-purple text-sm font-extrabold uppercase flex items-center gap-1.5">
              <span>💶</span> Abonar Paga Mensual a {childName}
            </h4>
            <p className="m-0 text-brand-gray text-[12px] font-semibold mb-3 leading-relaxed">
              La paga mensual establecida es de <strong>{monthlyAllowance.toFixed(2)}€</strong> y se otorga al alcanzar la meta de <strong>{monthlyTarget} pts</strong>.
            </p>
            
            <div className="bg-white/80 rounded-2xl p-3 border border-brand-purple/20 mb-3.5">
              <div className="flex justify-between items-center text-xs font-bold text-brand-dark mb-1">
                <span>Puntos de Rutina de {childName}:</span>
                <span className="text-brand-purple">{totalPoints} / {monthlyTarget} pts</span>
              </div>
              <ProgressBar pct={Math.min(100, (totalPoints / monthlyTarget) * 100)} color="var(--color-brand-purple)" />
              <div className="text-[10px] text-brand-gray font-bold text-center mt-2">
                {totalPoints >= monthlyTarget ? "🎉 ¡Meta de puntos alcanzada!" : `Le faltan ${Math.max(0, monthlyTarget - totalPoints)} puntos para la meta`}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {totalPoints >= monthlyTarget ? (
                <button 
                  className="btn-primary w-full py-2.5 bg-gradient-to-br from-brand-purple to-brand-indigo border-none rounded-xl text-white font-black text-xs cursor-pointer shadow-md"
                  onClick={() => requirePinAction(() => handlePayAllowance(monthlyAllowance, "Paga Mensual Completa"))}
                >
                  💶 Abonar Paga Completa ({monthlyAllowance.toFixed(2)}€)
                </button>
              ) : (
                <button 
                  className="btn-primary w-full py-2.5 bg-gradient-to-br from-brand-purple to-brand-indigo border-none rounded-xl text-white font-black text-xs cursor-pointer shadow-md"
                  onClick={() => requirePinAction(() => handlePayAllowance((totalPoints / monthlyTarget) * monthlyAllowance, "Paga Proporcional"))}
                >
                  💶 Abonar Paga Proporcional ({((totalPoints / monthlyTarget) * monthlyAllowance).toFixed(2)}€)
                </button>
              )}
              
              <button 
                className="btn-primary w-full py-2 bg-brand-purpleL border-none rounded-xl text-brand-purple font-extrabold text-xs cursor-pointer"
                onClick={() => setShowDeductionInput(!showDeductionInput)}
              >
                ⚠️ Ajuste Manual (Deducción o Bonus)
              </button>

              {showDeductionInput && (
                <div className="flex flex-col gap-2 mt-2 animate-pop bg-white p-3 rounded-xl border border-brand-purple/20">
                  <input 
                    type="number" 
                    step="0.10"
                    placeholder="Monto (€) ej: 5 o -5" 
                    value={customAllowanceAmt} 
                    onChange={e => setCustomAllowanceAmt(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-brand-purple/30 text-xs text-brand-dark focus:outline-none" 
                  />
                  <input 
                    type="text" 
                    placeholder="Motivo del ajuste" 
                    value={adjustmentReason} 
                    onChange={e => setAdjustmentReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-brand-purple/30 text-xs text-brand-dark focus:outline-none" 
                  />
                  <button 
                    className="btn-primary w-full py-2.5 bg-brand-purple text-white border-none rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                    onClick={() => {
                      const val = parseFloat(customAllowanceAmt);
                      if (isNaN(val) || val === 0 || !adjustmentReason.trim()) {
                        showToast("❌ Introduce un monto válido y un motivo", "error");
                        return;
                      }
                      requirePinAction(() => {
                        const success = ajusteManual(val, adjustmentReason);
                        if(success) {
                           showToast("✅ Ajuste manual aplicado equitativamente");
                           setCustomAllowanceAmt("");
                           setAdjustmentReason("");
                           setShowDeductionInput(false);
                        }
                      });
                    }}
                  >
                    Confirmar Ajuste
                  </button>
                </div>
              )}
            </div>
          </Card>

          <Card className="mb-4 shadow-sm border border-brand-blueL">
            <h4 className="m-0 mb-3 text-brand-dark text-sm font-bold uppercase">Carteras en Euros</h4>
            <div className="flex flex-col gap-3">
              {[
                {label:"Para Gastar",amt:wallet.spend,color:"var(--color-brand-blue)",pct:SPLIT.spend},
                {label:"Para Ahorrar",amt:wallet.save,color:"var(--color-brand-cyan)",pct:SPLIT.save},
                {label:"Para Invertir",amt:wallet.invest,color:"var(--color-brand-purple)",pct:SPLIT.invest}
              ].map(w=>(
                <div key={w.label}>
                  <div className="flex justify-between text-xs mb-1 font-bold">
                    <span className="text-brand-dark">{w.label} ({w.pct}%)</span>
                    <span style={{color:w.color}}>{w.amt.toFixed(2)} €</span>
                  </div>
                  <ProgressBar pct={(w.amt / Math.max(wallet.spend + wallet.save + wallet.invest, 0.01)) * 100} color={w.color} />
                </div>
              ))}
            </div>
          </Card>
          
          {/* Active Loans & Financial Tools */}
          <Card className="mb-4 shadow-sm border border-brand-red/20 bg-brand-red/5">
            <h4 className="m-0 mb-3 text-brand-dark text-sm font-bold uppercase flex items-center gap-1.5">
              <span>💳</span> Otorgar Nuevo Préstamo
            </h4>
            <div className="flex flex-col gap-2">
              <input type="text" placeholder="Motivo (Ej. Adelanto Zapatillas)" value={newLoan.note} onChange={e=>setNewLoan(l=>({...l,note:e.target.value}))}
                className="w-full p-2.5 rounded-xl border-2 border-brand-red/20 text-xs text-brand-dark focus:outline-none" />
              <div className="flex gap-2">
                <input type="number" placeholder="Cantidad (€)" value={newLoan.amount} onChange={e=>setNewLoan(l=>({...l,amount:e.target.value}))}
                  className="flex-1 p-2.5 rounded-xl border-2 border-brand-red/20 text-xs text-brand-dark focus:outline-none" />
                <button className="btn-primary px-4 bg-brand-red text-white border-none rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                  onClick={() => {
                    if (addLoan(newLoan.amount, newLoan.note)) {
                      showToast(`💸 Préstamo otorgado (${parseFloat(newLoan.amount).toFixed(2)}€)`);
                      setNewLoan({ amount:"", note:"" });
                    } else {
                      showToast("❌ Datos no válidos", "error");
                    }
                  }}>Confirmar</button>
              </div>
            </div>
          </Card>

          <Card className="mb-4 shadow-sm border border-brand-teal/20 bg-brand-teal/5">
            <h4 className="m-0 mb-3 text-brand-dark text-sm font-bold uppercase flex items-center gap-1.5">
              <span>📈</span> Aplicar Interés a Hucha
            </h4>
            <div className="flex flex-col gap-2">
              <select value={interestConfig.goalId} onChange={e=>setInterestConfig(i=>({...i,goalId:e.target.value}))}
                className="w-full p-2.5 rounded-xl border-2 border-brand-teal/20 text-xs font-bold text-brand-dark focus:outline-none bg-white">
                <option value="">Selecciona un Objetivo...</option>
                {savingsGoals.filter(g=>g.saved > 0).map(g => (
                  <option key={g.id} value={g.id}>{g.name} ({g.saved.toFixed(2)}€)</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input type="number" placeholder="Tasa (%)" value={interestConfig.rate} onChange={e=>setInterestConfig(i=>({...i,rate:e.target.value}))}
                  className="flex-1 p-2.5 rounded-xl border-2 border-brand-teal/20 text-xs text-brand-dark focus:outline-none" />
                <button className="btn-primary px-4 bg-brand-teal text-white border-none rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                  onClick={() => {
                    if (applyInterestToGoal(interestConfig.goalId, parseFloat(interestConfig.rate))) {
                      showToast(`📈 Interés aplicado correctamente`);
                      setInterestConfig({ goalId:"", rate:2 });
                    } else {
                      showToast("❌ No se pudo aplicar (asegúrate de que tenga fondos)", "error");
                    }
                  }}>Aplicar %</button>
              </div>
            </div>
          </Card>

          <h4 className="text-brand-dark m-0 mb-2.5 text-sm font-bold flex items-center gap-1.5">
            <span>📜</span> Últimas Transacciones Registradas
          </h4>
          {transactions.slice(0, 15).map(tx => (
            <div key={tx.id} className="bg-white rounded-xl p-2.5 px-3.5 mb-2.5 flex justify-between items-center shadow-sm border border-brand-blueL">
              <div className="flex-1">
                <div className="font-bold text-brand-dark text-xs">{tx.desc}</div>
                <div className="text-[9px] text-brand-gray font-bold mt-0.5">{new Date(tx.date).toLocaleDateString("es-ES")}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-xs ${tx.type === "spend" ? 'text-brand-blueD' : 'text-brand-cyan'}`}>
                  {tx.euros !== undefined ? (
                    <>{tx.euros > 0 ? "+" : ""}{tx.euros.toFixed(2)}€</>
                  ) : (
                    <>{tx.points > 0 ? "+" : ""}{tx.points} pts</>
                  )}
                </span>
                {tx.euros !== undefined && tx.euros < 0 && tx.type === "spend" && (
                  <button 
                    className="btn-primary bg-brand-blueL border-none rounded-lg px-2 py-1 text-xs text-brand-blueD font-bold cursor-pointer hover:bg-brand-blue hover:text-white transition-all ml-1" 
                    onClick={() => { 
                      if(confirm(`¿Revertir transacción: ${tx.desc}?`)){
                        deleteTransaction(tx.id); 
                        showToast("🗑️ Transacción revertida con éxito"); 
                      }
                    }}
                    title="Revertir Transacción (Añadirá el importe de vuelta)"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Settings tab */}
      {tab==="settings" && (
        <>
          <h3 className="text-brand-dark m-0 mb-3 text-base font-bold">⚙️ Configuración</h3>
          
          <Card className="mb-3.5 shadow-sm border border-brand-blueL">
            <label className="block text-xs font-bold text-brand-gray mb-1.5 uppercase">Nombre del Adolescente:</label>
            <input value={childName} onChange={e=>setChildName(e.target.value)}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL text-xs text-brand-dark focus:outline-none font-semibold" />
          </Card>

          <Card className="mb-3.5 shadow-sm border border-brand-blueL">
            <label className="block text-xs font-bold text-brand-gray mb-1.5 uppercase">Paga Mensual Establecida (€):</label>
            <input type="number" step="0.50" value={monthlyAllowance} onChange={e=>setMonthlyAllowance(parseFloat(e.target.value)||0)}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL text-xs text-brand-dark focus:outline-none font-semibold" />
          </Card>

          <Card className="mb-3.5 shadow-sm border border-brand-blueL">
            <label className="block text-xs font-bold text-brand-gray mb-1.5 uppercase">Meta Mensual de Puntos (pts):</label>
            <input type="number" value={monthlyTarget} onChange={e=>setMonthlyTarget(parseInt(e.target.value)||0)}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL text-xs text-brand-dark focus:outline-none font-semibold" />
          </Card>
          
          <Card className="shadow-sm border border-brand-blueL">
            <label className="block text-xs font-bold text-brand-gray mb-1.5 uppercase">Cambiar PIN Parental de Acceso (4 dígitos):</label>
            <div className="flex gap-2">
              <input type="password" maxLength={4} placeholder="Nuevo PIN" value={newPin} onChange={e=>setNewPin(e.target.value)}
                className="flex-1 p-2.5 rounded-xl border-2 border-brand-blueL text-xs text-brand-dark focus:outline-none" />
              <button className="btn-primary p-2 px-4 bg-gradient-to-br from-brand-blue to-brand-blueD border-none rounded-xl text-white font-bold text-xs cursor-pointer shadow-md" 
                onClick={()=>{ 
                  if(newPin.length===4){
                    requirePinAction(() => {
                      setParentPin(newPin);
                      setNewPin("");
                      showToast("✅ PIN actualizado con éxito!");
                    });
                  } else {
                    showToast("❌ El PIN debe tener 4 dígitos","error");
                  }
                }}>
                Guardar PIN
              </button>
            </div>
          </Card>
        </>
      )}

      {/* Rejection reason note Dialog Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 bg-[#0F172ACC] flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full animate-pop shadow-2xl">
            <h3 className="m-0 mb-2 text-brand-dark text-base font-bold flex items-center justify-center gap-1.5">
              <span>💬</span> Motivo de Rechazo
            </h3>
            <p className="m-0 mb-4 text-[11px] text-brand-gray font-bold text-center">
              Escribe una nota para <strong>{childName}</strong> indicando qué debe corregir en: <strong>{rejectingItem.taskName}</strong>.
            </p>

            <textarea 
              placeholder="Ej. Por favor, arregla las mantas de la cama y coloca los cojines..." 
              value={rejectionNote} 
              onChange={e=>setRejectionNote(e.target.value)}
              rows={3}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL text-xs text-brand-dark focus:outline-none mb-4 resize-none font-semibold box-border"
            />

            <div className="flex gap-2.5">
              <button className="btn-primary flex-1 py-2.5 bg-brand-cream border-none rounded-xl text-brand-gray font-bold text-xs cursor-pointer" onClick={() => { setRejectingItem(null); setRejectionNote(""); }}>
                Cancelar
              </button>
              <button className="btn-primary flex-1 py-2.5 bg-gradient-to-br from-brand-blue to-brand-blueD border-none rounded-xl text-white font-bold text-xs cursor-pointer shadow-md" onClick={handleSendRejection}>
                Rechazar Tarea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Photo Modal overlay */}
      {activePhotoUrl && (
        <div className="fixed inset-0 bg-[#0F172AD9] flex items-center justify-center z-[3000] p-4 cursor-zoom-out" onClick={() => setActivePhotoUrl(null)}>
          <div className="relative max-w-lg w-full rounded-2xl overflow-hidden border-4 border-white shadow-2xl animate-pop bg-black flex items-center justify-center">
            <img src={activePhotoUrl} alt="Enlarged Proof" className="max-w-full max-h-[80vh] object-contain" />
            <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white border-none font-bold text-base cursor-pointer flex items-center justify-center" onClick={() => setActivePhotoUrl(null)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}
