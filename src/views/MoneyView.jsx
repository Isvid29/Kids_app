import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SPLIT } from '../utils/constants';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { WalletBig } from '../components/WalletPill';

const GOAL_ICONS = ["🎮","🎧","🛹","📱","🎒","👕","📚","🍕","🚲","🎨","💻","🎁"];
const GOAL_COLORS = ["var(--color-brand-purple)", "var(--color-brand-cyan)", "var(--color-brand-blue)", "var(--color-brand-indigo)", "var(--color-brand-teal)", "var(--color-brand-blueD)"];

export default function MoneyView({ fireConfetti, showToast }) {
  const { 
    wallet, 
    totalPoints, 
    savingsGoals, 
    spendingGoals,
    transactions, 
    fundGoal, 
    addGoal, 
    editGoal, 
    deleteGoal, 
    recordSpend,
    recordIncome,
    monthlyTarget,
    addSpendingGoal,
    editSpendingGoal,
    deleteSpendingGoal,
    fundSpendingGoal,
    loans,
    repayLoan,
  } = useAppStore();
  
  const [showGoalModal,     setShowGoalModal]     = useState(false);
  const [editGoalModal,     setEditGoalModal]     = useState(null);
  const [showSpendGoalModal, setShowSpendGoalModal] = useState(false);
  const [editSpendGoalModal, setEditSpendGoalModal] = useState(null);
  const [newSpendGoal, setNewSpendGoal] = useState({ name:"", target:30.00, icon: GOAL_ICONS[0], color: GOAL_COLORS[0] });
  
  // Advanced Point Transaction Modal State
  const [txModal, setTxModal] = useState(false);
  const [txType, setTxType] = useState("spend"); // "spend" or "income"
  const [txWallet, setTxWallet] = useState("spend"); // "spend", "save", "invest", "split"
  const [txAmount, setTxAmount] = useState("");
  const [txNote, setTxNote] = useState("");

  const [newGoal, setNewGoal] = useState({ name:"", target:30.00, icon: GOAL_ICONS[0], color: GOAL_COLORS[0] });

  const handleFund = (goalId, amount) => {
    const success = fundGoal(goalId, amount);
    if (!success) {
      showToast("❌ No tienes suficientes Euros en la hucha de Ahorros", "error");
      return;
    }
    const goal = savingsGoals.find(g => g.id === goalId);
    if (goal.saved >= goal.target) {
      fireConfetti();
      showToast(`🏆 ¡Objetivo "${goal.name}" alcanzado!`);
    } else {
      showToast(`💰 +${amount.toFixed(2)}€ destinados al objetivo`);
    }
  };

  const handleAddGoal = () => {
    const targetVal = parseFloat(newGoal.target);
    if (!newGoal.name.trim() || isNaN(targetVal) || targetVal <= 0) return;
    addGoal({ ...newGoal, target: parseFloat(targetVal.toFixed(2)) });
    setShowGoalModal(false);
    setNewGoal({ name:"", target:30.00, icon: GOAL_ICONS[0], color: GOAL_COLORS[0] });
    showToast("🎯 ¡Nuevo objetivo de ahorro añadido!");
  };

  const handleEditGoal = () => {
    const targetVal = parseFloat(editGoalModal.target);
    if (!editGoalModal?.name?.trim() || isNaN(targetVal) || targetVal <= 0) return;
    editGoal(editGoalModal.id, { 
      name: editGoalModal.name, 
      target: parseFloat(targetVal.toFixed(2)), 
      icon: editGoalModal.icon, 
      color: editGoalModal.color 
    });
    setEditGoalModal(null);
    showToast("✅ Objetivo actualizado");
  };

  const handleRegisterTx = () => {
    const euros = parseFloat(txAmount);
    if (isNaN(euros) || euros <= 0) { 
      showToast("❌ Importe en Euros no válido", "error"); 
      return; 
    }
    const note = txNote.trim() || (txType === "spend" ? "Gasto manual" : "Ingreso manual");
    
    if (txType === "spend") {
      const success = recordSpend(euros, note, txWallet === "split" ? "spend" : txWallet);
      if (!success) { 
        showToast("❌ Saldo insuficiente en la hucha seleccionada", "error"); 
        return; 
      }
      showToast("💸 Gasto registrado con éxito");
    } else {
      const success = recordIncome(euros, note, txWallet);
      if (!success) {
        showToast("❌ Error al registrar ingreso", "error");
        return;
      }
      fireConfetti();
      showToast("💰 ¡Dinero ingresado con éxito!");
    }
    
    setTxModal(false);
    setTxAmount("");
    setTxNote("");
  };

  return (
    <div className="animate-slide-up pb-8 font-sans">
      <h2 className="text-brand-dark m-0 mb-3 text-lg font-bold flex items-center gap-2">
        <span>🏦</span> Mi Banco y Ahorros
      </h2>
      
      <Card className="mb-5 border border-brand-blueL shadow-md">
        <div className="text-center mb-4">
          <div className="text-3xl font-black text-brand-purple tracking-tight">{totalPoints} / {monthlyTarget} pts</div>
          <div className="text-[12px] font-bold text-brand-gray mt-1">Puntos de Rutina Acumulados este mes</div>
          <div className="w-full bg-brand-cream/80 rounded-full h-2.5 mt-2.5 overflow-hidden border border-brand-blueL/30">
            <div className="bg-gradient-to-r from-brand-purple to-brand-indigo h-full transition-all duration-500" style={{ width: `${Math.min(100, (totalPoints / monthlyTarget) * 100)}%` }} />
          </div>
        </div>
        
        <div className="flex gap-2.5">
          <WalletBig label="Para Gastar" amount={wallet.spend} color="var(--color-brand-blue)" bg="var(--color-brand-blueL)" icon="🎮" pct={SPLIT.spend} />
          <WalletBig label="Para Ahorrar" amount={wallet.save} color="var(--color-brand-cyan)" bg="var(--color-brand-cyanL)" icon="🎯" pct={SPLIT.save} />
          <WalletBig label="Para Invertir" amount={wallet.invest} color="var(--color-brand-purple)" bg="var(--color-brand-purpleL)" icon="📈" pct={SPLIT.invest} />
        </div>
        <button 
          className="btn-primary w-full mt-4 p-3 bg-gradient-to-br from-brand-purple to-brand-indigo border-none rounded-2xl text-white font-bold text-sm shadow-md cursor-pointer hover:shadow-lg transition-all"
          onClick={() => { setTxType("spend"); setTxWallet("spend"); setTxModal(true); }}
        >
          ⚙️ Registrar Movimiento (Ingreso / Gasto)
        </button>
      </Card>

      {/* Transaction registration Modal */}
      {txModal && (
        <div className="fixed inset-0 bg-[#0F172ACC] flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full animate-pop shadow-2xl">
            <h3 className="m-0 mb-4 text-brand-dark text-lg font-bold text-center">
              ⚙️ Registrar Movimiento
            </h3>

            {/* Type selector tab */}
            <div className="flex bg-brand-cream p-1 rounded-xl mb-4 border border-brand-blueL">
              <button 
                className={`flex-1 py-2 rounded-lg font-bold text-xs border-none cursor-pointer ${txType === 'spend' ? 'bg-gradient-to-br from-brand-blue to-brand-blueD text-white shadow-sm' : 'bg-transparent text-brand-gray'}`}
                onClick={() => { setTxType("spend"); if (txWallet === "split") setTxWallet("spend"); }}
              >
                💸 Registrar Gasto
              </button>
              <button 
                className={`flex-1 py-2 rounded-lg font-bold text-xs border-none cursor-pointer ${txType === 'income' ? 'bg-gradient-to-br from-brand-cyan to-brand-teal text-white shadow-sm' : 'bg-transparent text-brand-gray'}`}
                onClick={() => setTxType("income")}
              >
                💰 Registrar Ingreso
              </button>
            </div>

            {/* Wallet target selector */}
            <label className="block text-[11px] font-bold text-brand-gray mb-1.5 uppercase">Seleccionar Hucha:</label>
            <select 
              value={txWallet}
              onChange={e => setTxWallet(e.target.value)}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL text-xs font-semibold text-brand-dark bg-white mb-3"
            >
              <option value="spend">🎮 Para Gastar</option>
              <option value="save">🎯 Para Ahorrar</option>
              <option value="invest">📈 Para Invertir</option>
              {txType === "income" && <option value="split">⚖️ Repartir Split (40/40/20)</option>}
            </select>

            <label className="block text-[11px] font-bold text-brand-gray mb-1.5 uppercase">Concepto / Motivo:</label>
            <input 
              placeholder="Ej. Compra de libro, Tarea extra..." 
              value={txNote} 
              onChange={e=>setTxNote(e.target.value)}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-3 text-xs text-brand-dark focus:outline-none" 
            />

            <label className="block text-[11px] font-bold text-brand-gray mb-1.5 uppercase">Importe en Euros (€):</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="Ej. 5.50" 
              value={txAmount} 
              onChange={e=>setTxAmount(e.target.value)}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-5 text-xs text-brand-dark focus:outline-none" 
            />

            <div className="flex gap-2">
              <button className="btn-primary flex-1 py-2.5 bg-brand-cream border-none rounded-xl text-brand-gray font-bold text-xs cursor-pointer" onClick={()=>setTxModal(false)}>Cancelar</button>
              <button className="btn-primary flex-1 py-2.5 bg-gradient-to-br from-brand-blue to-brand-blueD border-none rounded-xl text-white font-bold text-xs cursor-pointer shadow-sm" onClick={handleRegisterTx}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Savings goals */}
      <div className="flex justify-between items-center my-4">
        <h3 className="m-0 text-brand-dark text-base font-bold flex items-center gap-1.5">
          <span>🎯</span> Objetivos de Ahorro
        </h3>
        <button 
          className="btn-primary bg-gradient-to-br from-brand-cyan to-brand-teal border-none rounded-xl text-white px-3.5 py-1.5 font-bold text-xs shadow-sm cursor-pointer" 
          onClick={()=>setShowGoalModal(true)}
        >
          + Nuevo Objetivo
        </button>
      </div>

      {savingsGoals.length === 0 && <p className="text-brand-gray text-center text-sm py-4">¡Añade un objetivo para empezar a ahorrar! 📈</p>}

      {savingsGoals.map(goal => {
        const pct = Math.min(100, (goal.saved / goal.target) * 100);
        return (
          <Card key={goal.id} className="mb-3.5 border-l-4 shadow-sm" style={{ borderLeftColor: goal.color }}>
            <div className="flex items-center gap-3 mb-2.5">
              <span className="text-3xl">{goal.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-brand-dark text-[15px]">{goal.name}</div>
                <div className="text-xs text-brand-gray font-semibold mt-0.5">{goal.saved.toFixed(2)}€ / {goal.target.toFixed(2)}€</div>
              </div>
              <div className="text-[15px] font-black" style={{ color: goal.color }}>{Math.round(pct)}%</div>
              <button className="btn-primary bg-brand-purpleL border-none rounded-lg px-2.5 py-1.5 text-xs text-brand-purple font-bold cursor-pointer"
                onClick={() => setEditGoalModal({ ...goal })}>✏️</button>
              <button className="btn-primary bg-brand-blueL border-none rounded-lg px-2.5 py-1.5 text-xs text-brand-blueD font-bold cursor-pointer"
                onClick={() => { deleteGoal(goal.id); showToast("🗑️ Objetivo eliminado"); }}>🗑️</button>
            </div>
            <ProgressBar pct={pct} color={goal.color} />
            {pct < 100 && (
              <div className="flex gap-2 mt-3">
                {[2, 5, 10].map(amt => (
                  <button key={amt} className="btn-primary flex-1 py-1.5 bg-brand-cyanL border-none rounded-xl text-xs text-brand-dark font-bold cursor-pointer hover:bg-brand-cyan hover:text-white transition-all shadow-sm" onClick={()=>handleFund(goal.id, amt)}>
                    +{amt}€
                  </button>
                ))}
              </div>
            )}
            {pct >= 100 && <div className="text-center mt-3 text-brand-cyan font-bold text-sm animate-pulse">🏆 ¡Objetivo conseguido! ¡Enhorabuena!</div>}
          </Card>
        );
      })}

      {/* Add goal modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-[#0F172ACC] flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full animate-pop shadow-2xl">
            <h3 className="m-0 mb-4 text-brand-dark text-lg font-bold text-center">🎯 Nuevo Objetivo</h3>
            <input placeholder="¿Qué quieres conseguir?" value={newGoal.name} onChange={e=>setNewGoal(g=>({...g,name:e.target.value}))}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-2.5 text-xs text-brand-dark focus:outline-none" />
            <input type="number" placeholder="Precio en Euros (€)" value={newGoal.target} onChange={e=>setNewGoal(g=>({...g,target:parseFloat(e.target.value)||0}))}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-3.5 text-xs text-brand-dark focus:outline-none" />
            
            <p className="m-0 mb-2 text-xs font-bold text-brand-gray uppercase">Elige Icono:</p>
            <div className="flex flex-wrap gap-1.5 mb-3.5 justify-center">
              {GOAL_ICONS.map(ic=>(
                <button key={ic} className="btn-primary w-9 h-9 rounded-lg text-lg flex items-center justify-center bg-brand-cream border-2 cursor-pointer transition-all" 
                  style={{ borderColor: newGoal.icon===ic ? 'var(--color-brand-blueD)' : 'transparent', background: newGoal.icon===ic ? 'var(--color-brand-blueL)' : '' }}
                  onClick={()=>setNewGoal(g=>({...g,icon:ic}))}>
                  {ic}
                </button>
              ))}
            </div>
            
            <p className="m-0 mb-2 text-xs font-bold text-brand-gray uppercase">Elige Color:</p>
            <div className="flex gap-2.5 mb-5 justify-center">
              {GOAL_COLORS.map(c=>(
                <button key={c} className="btn-primary w-[30px] h-[30px] rounded-full border-4 cursor-pointer transition-all" 
                  style={{ background: c, borderColor: newGoal.color===c ? '#1E293B' : 'transparent' }}
                  onClick={()=>setNewGoal(g=>({...g,color:c}))} />
              ))}
            </div>
            <div className="flex gap-2.5">
              <button className="btn-primary flex-1 py-2.5 bg-brand-cream border-none rounded-xl text-brand-gray font-bold text-xs cursor-pointer" onClick={()=>setShowGoalModal(false)}>Cancelar</button>
              <button className="btn-primary flex-1 py-2.5 bg-gradient-to-br from-brand-cyan to-brand-teal border-none rounded-xl text-white font-bold text-xs cursor-pointer shadow-sm" onClick={handleAddGoal}>Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit goal modal */}
      {editGoalModal && (
        <div className="fixed inset-0 bg-[#0F172ACC] flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full animate-pop shadow-2xl">
            <h3 className="m-0 mb-4 text-brand-dark text-lg font-bold text-center">✏️ Editar Objetivo</h3>
            <input placeholder="Nombre" value={editGoalModal.name} onChange={e => setEditGoalModal(g => ({...g, name: e.target.value}))}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-2.5 text-xs text-brand-dark focus:outline-none" />
            <input type="number" placeholder="Precio en Euros (€)" value={editGoalModal.target} onChange={e => setEditGoalModal(g => ({...g, target: parseFloat(e.target.value)||0}))}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-3.5 text-xs text-brand-dark focus:outline-none" />
            
            <p className="m-0 mb-2 text-xs font-bold text-brand-gray uppercase">Elige Icono:</p>
            <div className="flex flex-wrap gap-1.5 mb-3.5 justify-center">
              {GOAL_ICONS.map(ic => (
                <button key={ic} className="btn-primary w-9 h-9 rounded-lg text-lg flex items-center justify-center bg-brand-cream border-2 cursor-pointer transition-all"
                  style={{ borderColor: editGoalModal.icon===ic ? 'var(--color-brand-blueD)' : 'transparent', background: editGoalModal.icon===ic ? 'var(--color-brand-blueL)' : '' }}
                  onClick={() => setEditGoalModal(g => ({...g, icon: ic}))}>{ic}</button>
              ))}
            </div>
            
            <p className="m-0 mb-2 text-xs font-bold text-brand-gray uppercase">Elige Color:</p>
            <div className="flex gap-2.5 mb-5 justify-center">
              {GOAL_COLORS.map(c => (
                <button key={c} className="btn-primary w-[30px] h-[30px] rounded-full border-4 cursor-pointer transition-all"
                  style={{ background: c, borderColor: editGoalModal.color===c ? '#1E293B' : 'transparent' }}
                  onClick={() => setEditGoalModal(g => ({...g, color: c}))} />
              ))}
            </div>
            <div className="flex gap-2.5">
              <button className="btn-primary flex-1 py-2.5 bg-brand-cream border-none rounded-xl text-brand-gray font-bold text-xs cursor-pointer" onClick={() => setEditGoalModal(null)}>Cancelar</button>
              <button className="btn-primary flex-1 py-2.5 bg-gradient-to-br from-brand-cyan to-brand-teal border-none rounded-xl text-white font-bold text-xs cursor-pointer shadow-sm" onClick={handleEditGoal}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Spending Goals Section ─── */}
      <div className="flex justify-between items-center my-4">
        <h3 className="m-0 text-brand-dark text-base font-bold flex items-center gap-1.5">
          <span>💸</span> Objetivos de Gasto
        </h3>
        <button
          className="btn-primary bg-gradient-to-br from-brand-blue to-brand-blueD border-none rounded-xl text-white px-3.5 py-1.5 font-bold text-xs shadow-sm cursor-pointer"
          onClick={() => setShowSpendGoalModal(true)}
        >+ Nuevo Gasto</button>
      </div>

      {spendingGoals.length === 0 && (
        <p className="text-brand-gray text-center text-sm py-4 border-2 border-dashed border-brand-blueL rounded-2xl">
          Planifica a dónde vas a destinar tu dinero 🎯
        </p>
      )}

      {spendingGoals.map(goal => {
        const pct = Math.min(100, (goal.saved / goal.target) * 100);
        return (
          <Card key={goal.id} className="mb-3.5 border-l-4 shadow-sm" style={{ borderLeftColor: goal.color }}>
            <div className="flex items-center gap-3 mb-2.5">
              <span className="text-3xl">{goal.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-brand-dark text-[15px]">{goal.name}</div>
                <div className="text-xs text-brand-gray font-semibold mt-0.5">
                  {goal.saved.toFixed(2)}€ / {goal.target.toFixed(2)}€ reservado
                </div>
              </div>
              <div className="text-[15px] font-black" style={{ color: goal.color }}>{Math.round(pct)}%</div>
              <button className="btn-primary bg-brand-purpleL border-none rounded-lg px-2.5 py-1.5 text-xs text-brand-purple font-bold cursor-pointer"
                onClick={() => setEditSpendGoalModal({ ...goal })}>✏️</button>
              <button className="btn-primary bg-brand-blueL border-none rounded-lg px-2.5 py-1.5 text-xs text-brand-blueD font-bold cursor-pointer"
                onClick={() => { deleteSpendingGoal(goal.id); showToast("🗑️ Objetivo eliminado"); }}>🗑️</button>
            </div>
            <ProgressBar pct={pct} color={goal.color} />
            {pct < 100 && (
              <div className="flex gap-2 mt-3">
                {[2, 5, 10].map(amt => (
                  <button key={amt}
                    className="btn-primary flex-1 py-1.5 bg-brand-blueL border-none rounded-xl text-xs text-brand-dark font-bold cursor-pointer hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                    onClick={() => {
                      if (fundSpendingGoal(goal.id, amt)) {
                        showToast(`💸 +${amt}€ reservado para ${goal.name}`);
                      } else {
                        showToast("❌ Importe no válido", "error");
                      }
                    }}
                  >+{amt}€</button>
                ))}
              </div>
            )}
            {pct >= 100 && <div className="text-center mt-3 text-brand-cyan font-bold text-sm animate-pulse">🏆 ¡Meta alcanzada! Listo para gastar.</div>}
          </Card>
        );
      })}

      {/* Add spending goal modal */}
      {showSpendGoalModal && (
        <div className="fixed inset-0 bg-[#0F172ACC] flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full animate-pop shadow-2xl">
            <h3 className="m-0 mb-4 text-brand-dark text-lg font-bold text-center">💸 Nuevo Objetivo de Gasto</h3>
            <input placeholder="¿En qué quieres gastar?" value={newSpendGoal.name} onChange={e => setNewSpendGoal(g => ({ ...g, name: e.target.value }))}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-2.5 text-xs text-brand-dark focus:outline-none" />
            <input type="number" placeholder="Precio en Euros (€)" value={newSpendGoal.target} onChange={e => setNewSpendGoal(g => ({ ...g, target: parseFloat(e.target.value)||0 }))}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-3.5 text-xs text-brand-dark focus:outline-none" />
            <p className="m-0 mb-2 text-xs font-bold text-brand-gray uppercase">Elige Icono:</p>
            <div className="flex flex-wrap gap-1.5 mb-3.5 justify-center">
              {GOAL_ICONS.map(ic => (
                <button key={ic} className="btn-primary w-9 h-9 rounded-lg text-lg flex items-center justify-center bg-brand-cream border-2 cursor-pointer transition-all"
                  style={{ borderColor: newSpendGoal.icon===ic ? 'var(--color-brand-blueD)' : 'transparent', background: newSpendGoal.icon===ic ? 'var(--color-brand-blueL)' : '' }}
                  onClick={() => setNewSpendGoal(g => ({ ...g, icon: ic }))}>{ic}</button>
              ))}
            </div>
            <p className="m-0 mb-2 text-xs font-bold text-brand-gray uppercase">Elige Color:</p>
            <div className="flex gap-2.5 mb-5 justify-center">
              {GOAL_COLORS.map(c => (
                <button key={c} className="btn-primary w-[30px] h-[30px] rounded-full border-4 cursor-pointer transition-all"
                  style={{ background: c, borderColor: newSpendGoal.color===c ? '#1E293B' : 'transparent' }}
                  onClick={() => setNewSpendGoal(g => ({ ...g, color: c }))} />
              ))}
            </div>
            <div className="flex gap-2.5">
              <button className="btn-primary flex-1 py-2.5 bg-brand-cream border-none rounded-xl text-brand-gray font-bold text-xs cursor-pointer" onClick={() => setShowSpendGoalModal(false)}>Cancelar</button>
              <button className="btn-primary flex-1 py-2.5 bg-gradient-to-br from-brand-blue to-brand-blueD border-none rounded-xl text-white font-bold text-xs cursor-pointer shadow-sm" onClick={() => {
                const t = parseFloat(newSpendGoal.target);
                if (!newSpendGoal.name.trim() || isNaN(t) || t <= 0) return;
                addSpendingGoal({ ...newSpendGoal, target: parseFloat(t.toFixed(2)) });
                setShowSpendGoalModal(false);
                setNewSpendGoal({ name:"", target:30.00, icon: GOAL_ICONS[0], color: GOAL_COLORS[0] });
                showToast("🎯 ¡Objetivo de gasto añadido!");
              }}>Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit spending goal modal */}
      {editSpendGoalModal && (
        <div className="fixed inset-0 bg-[#0F172ACC] flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full animate-pop shadow-2xl">
            <h3 className="m-0 mb-4 text-brand-dark text-lg font-bold text-center">✏️ Editar Objetivo de Gasto</h3>
            <input placeholder="Nombre" value={editSpendGoalModal.name} onChange={e => setEditSpendGoalModal(g => ({ ...g, name: e.target.value }))}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-2.5 text-xs text-brand-dark focus:outline-none" />
            <input type="number" placeholder="Precio en Euros" value={editSpendGoalModal.target} onChange={e => setEditSpendGoalModal(g => ({ ...g, target: parseFloat(e.target.value)||0 }))}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-3.5 text-xs text-brand-dark focus:outline-none" />
            <p className="m-0 mb-2 text-xs font-bold text-brand-gray uppercase">Icono:</p>
            <div className="flex flex-wrap gap-1.5 mb-3.5 justify-center">
              {GOAL_ICONS.map(ic => (
                <button key={ic} className="btn-primary w-9 h-9 rounded-lg text-lg flex items-center justify-center bg-brand-cream border-2 cursor-pointer transition-all"
                  style={{ borderColor: editSpendGoalModal.icon===ic ? 'var(--color-brand-blueD)' : 'transparent', background: editSpendGoalModal.icon===ic ? 'var(--color-brand-blueL)' : '' }}
                  onClick={() => setEditSpendGoalModal(g => ({ ...g, icon: ic }))}>{ic}</button>
              ))}
            </div>
            <p className="m-0 mb-2 text-xs font-bold text-brand-gray uppercase">Color:</p>
            <div className="flex gap-2.5 mb-5 justify-center">
              {GOAL_COLORS.map(c => (
                <button key={c} className="btn-primary w-[30px] h-[30px] rounded-full border-4 cursor-pointer transition-all"
                  style={{ background: c, borderColor: editSpendGoalModal.color===c ? '#1E293B' : 'transparent' }}
                  onClick={() => setEditSpendGoalModal(g => ({ ...g, color: c }))} />
              ))}
            </div>
            <div className="flex gap-2.5">
              <button className="btn-primary flex-1 py-2.5 bg-brand-cream border-none rounded-xl text-brand-gray font-bold text-xs cursor-pointer" onClick={() => setEditSpendGoalModal(null)}>Cancelar</button>
              <button className="btn-primary flex-1 py-2.5 bg-gradient-to-br from-brand-blue to-brand-blueD border-none rounded-xl text-white font-bold text-xs cursor-pointer shadow-sm" onClick={() => {
                const t = parseFloat(editSpendGoalModal.target);
                if (!editSpendGoalModal?.name?.trim() || isNaN(t) || t <= 0) return;
                editSpendingGoal(editSpendGoalModal.id, { name: editSpendGoalModal.name, target: parseFloat(t.toFixed(2)), icon: editSpendGoalModal.icon, color: editSpendGoalModal.color });
                setEditSpendGoalModal(null);
                showToast("✅ Objetivo actualizado");
              }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Active Loans Section ─── */}
      {loans.length > 0 && (
        <div className="mt-6 mb-2">
          <h3 className="m-0 text-brand-dark text-base font-bold flex items-center gap-1.5 mb-3">
            <span>💳</span> Préstamos Activos
          </h3>
          {loans.map(loan => (
            <Card key={loan.id} className="mb-3 border-l-4 border-brand-red shadow-sm bg-brand-red/5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-brand-dark text-sm">{loan.note}</div>
                  <div className="text-[10px] text-brand-gray font-bold mt-0.5">Pendiente de devolver</div>
                </div>
                <div className="text-base font-black text-brand-red">{loan.remaining.toFixed(2)}€</div>
              </div>
              <div className="flex gap-2 mt-2 pt-2 border-t border-brand-red/10">
                {[1, 5].map(amt => (
                  <button key={amt}
                    className="btn-primary flex-1 py-1.5 bg-brand-red/10 hover:bg-brand-red hover:text-white border-none rounded-xl text-xs text-brand-red font-bold cursor-pointer transition-colors shadow-sm"
                    disabled={wallet.spend < amt || loan.remaining < amt}
                    style={{ opacity: (wallet.spend < amt || loan.remaining < amt) ? 0.5 : 1 }}
                    onClick={() => {
                      if (repayLoan(loan.id, amt)) {
                        showToast(`💳 Devolución de ${amt}€ realizada`);
                      } else {
                        showToast("❌ No tienes saldo suficiente en Gastar", "error");
                      }
                    }}
                  >Devolver {amt}€</button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Transactions History Ledger */}
      <h3 className="text-brand-dark my-4 text-base font-bold flex items-center gap-1.5">
        <span>📜</span> Historial de Movimientos
      </h3>
      {transactions.length === 0 && <p className="text-brand-gray text-center text-sm py-4">¡Aún no hay movimientos registrados! 🪙</p>}
      
      {transactions.filter(tx => tx.euros !== undefined).slice(0, 30).map(tx => (
        <div key={tx.id} className="bg-white rounded-2xl p-3 px-4 mb-2 flex justify-between items-center shadow-sm border border-brand-blueL animate-pop">
          <div>
            <div className="font-bold text-brand-dark text-sm">{tx.desc}</div>
            <div className="text-[10px] text-brand-gray font-bold mt-0.5">{new Date(tx.date).toLocaleDateString("es-ES")} {new Date(tx.date).toLocaleTimeString("es-ES", {hour:'2-digit', minute:'2-digit'})}</div>
          </div>
          <div className={`font-black text-sm ${tx.type === "spend" ? 'text-brand-blueD' : 'text-brand-cyan'}`}>
            {tx.euros !== undefined ? (
              <>
                {tx.euros > 0 ? "+" : ""}{tx.euros.toFixed(2)}€
              </>
            ) : (
              <>
                {tx.points > 0 ? "+" : ""}{tx.points} pts
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
