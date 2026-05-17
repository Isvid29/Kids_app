import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SPLIT } from '../utils/constants';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { WalletBig } from '../components/WalletPill';

const GOAL_ICONS = ["🎮","📖","🎨","🎵","⚽","🧸","🌸","🎁","✈️","🍕","💻","👗"];
const GOAL_COLORS = ["var(--color-brand-cyan)", "var(--color-brand-purple)", "var(--color-brand-blue)", "var(--color-brand-sky)", "var(--color-brand-indigo)", "var(--color-brand-teal)"];

export default function MoneyView({ fireConfetti, showToast }) {
  const { wallet, totalEuros, savingsGoals, transactions, fundGoal, addGoal, recordSpend } = useAppStore();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [spendModal, setSpendModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name:"", target:20, icon:"🎯", color: GOAL_COLORS[0] });
  const [spendAmount, setSpendAmount] = useState("");
  const [spendNote, setSpendNote] = useState("");

  const handleFund = (goalId, amount) => {
    const success = fundGoal(goalId, amount);
    if (!success) {
      showToast("❌ No hay suficiente en ahorros", "error");
      return;
    }
    const goal = useAppStore.getState().savingsGoals.find(g => g.id === goalId);
    if (goal.saved >= goal.target) {
      fireConfetti();
      showToast("🏆 ¡Objetivo alcanzado!");
    } else {
      showToast(`💰 +${amount.toFixed(2)}€ al objetivo`);
    }
  };

  const handleAddGoal = () => {
    if (!newGoal.name.trim()) return;
    addGoal(newGoal);
    setShowGoalModal(false);
    setNewGoal({ name:"", target:20, icon:"🎯", color: GOAL_COLORS[0] });
    showToast("🎯 ¡Nuevo objetivo añadido!");
  };

  const handleSpend = () => {
    const amt = parseFloat(spendAmount);
    if (!amt || amt <= 0) { showToast("❌ Importe no válido", "error"); return; }
    const success = recordSpend(amt, spendNote);
    if (!success) { showToast("❌ No hay suficiente dinero", "error"); return; }
    
    setSpendModal(false);
    setSpendAmount("");
    setSpendNote("");
    showToast("💸 Gasto registrado");
  };

  return (
    <div className="animate-slide-up pb-8">
      <h2 className="text-brand-dark m-0 mb-3 text-lg">🏦 Mi Hucha</h2>
      <Card className="mb-4">
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-brand-blueD">{totalEuros.toFixed(2)}€</div>
          <div className="text-[13px] text-brand-gray">Total ganado</div>
        </div>
        <div className="flex gap-2">
          <WalletBig label="Gastar" amount={wallet.spend} color="var(--color-brand-blue)" bg="var(--color-brand-blueL)" icon="💸" pct={SPLIT.spend} />
          <WalletBig label="Ahorrar" amount={wallet.save} color="var(--color-brand-cyan)" bg="var(--color-brand-cyanL)" icon="🏦" pct={SPLIT.save} />
          <WalletBig label="Invertir" amount={wallet.invest} color="var(--color-brand-purple)" bg="var(--color-brand-purpleL)" icon="📈" pct={SPLIT.invest} />
        </div>
        <button className="btn-primary w-full mt-3.5 p-2.5 bg-gradient-to-br from-brand-blue to-brand-blueD border-none rounded-xl text-white font-bold text-sm" onClick={()=>setSpendModal(true)}>
          💸 Registrar un gasto
        </button>
      </Card>

      {/* Spend modal */}
      {spendModal && (
        <div className="fixed inset-0 bg-[#3D2B4E80] flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-3xl p-7 min-w-[300px] animate-pop max-w-sm w-full">
            <h3 className="m-0 mb-4 text-brand-dark text-lg">💸 Registrar gasto</h3>
            <input placeholder="¿En qué gastaste?" value={spendNote} onChange={e=>setSpendNote(e.target.value)}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-2.5 text-sm box-border" />
            <input type="number" placeholder="Importe (€)" value={spendAmount} onChange={e=>setSpendAmount(e.target.value)}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-3.5 text-sm box-border" />
            <div className="flex gap-2.5">
              <button className="btn-primary flex-1 p-2.5 bg-brand-cream border-none rounded-xl text-brand-gray" onClick={()=>setSpendModal(false)}>Cancelar</button>
              <button className="btn-primary flex-1 p-2.5 bg-gradient-to-br from-brand-blue to-brand-blueD border-none rounded-xl text-white font-bold" onClick={handleSpend}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Savings goals */}
      <div className="flex justify-between items-center my-4">
        <h3 className="m-0 text-brand-dark text-[17px]">🎯 Mis objetivos</h3>
        <button className="btn-primary bg-gradient-to-br from-brand-cyan to-[#5eb888] border-none rounded-xl text-white px-3.5 py-1.5 font-bold text-[13px]" onClick={()=>setShowGoalModal(true)}>
          + Nuevo
        </button>
      </div>

      {savingsGoals.map(goal => {
        const pct = Math.min(100, (goal.saved/goal.target)*100);
        return (
          <Card key={goal.id} className="mb-3 border-l-4" style={{ borderLeftColor: goal.color }}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="text-3xl">{goal.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-brand-dark text-[15px]">{goal.name}</div>
                <div className="text-[13px] text-brand-gray">{goal.saved.toFixed(2)}€ / {goal.target.toFixed(2)}€</div>
              </div>
              <div className="text-xl font-bold" style={{ color: goal.color }}>{Math.round(pct)}%</div>
            </div>
            <ProgressBar pct={pct} color={goal.color} />
            {pct < 100 && (
              <div className="flex gap-1.5 mt-2.5">
                {[0.50, 1, 2].map(amt => (
                  <button key={amt} className="btn-primary flex-1 p-1.5 bg-brand-cyanL border-none rounded-lg text-xs text-brand-dark font-bold" onClick={()=>handleFund(goal.id, amt)}>
                    +{amt.toFixed(2)}€
                  </button>
                ))}
              </div>
            )}
            {pct >= 100 && <div className="text-center mt-2 text-lg">🏆 ¡Objetivo alcanzado!</div>}
          </Card>
        );
      })}

      {/* Add goal modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-[#3D2B4E80] flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-3xl p-7 min-w-[320px] animate-pop max-w-sm w-full">
            <h3 className="m-0 mb-4 text-brand-dark text-lg">🎯 Nuevo objetivo</h3>
            <input placeholder="¿Qué quieres conseguir?" value={newGoal.name} onChange={e=>setNewGoal(g=>({...g,name:e.target.value}))}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-2.5 text-sm box-border" />
            <input type="number" placeholder="Precio (€)" value={newGoal.target} onChange={e=>setNewGoal(g=>({...g,target:parseFloat(e.target.value)||0}))}
              className="w-full p-2.5 rounded-xl border-2 border-brand-blueL mb-2.5 text-sm box-border" />
            
            <p className="m-0 mb-1.5 text-[13px] text-brand-gray">Icono:</p>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {GOAL_ICONS.map(ic=>(
                <button key={ic} className="btn-primary w-9 h-9 rounded-lg text-lg flex items-center justify-center bg-brand-cream border-2" 
                  style={{ borderColor: newGoal.icon===ic ? 'var(--color-brand-blueD)' : 'transparent' }}
                  onClick={()=>setNewGoal(g=>({...g,icon:ic}))}>
                  {ic}
                </button>
              ))}
            </div>
            <p className="m-0 mb-1.5 text-[13px] text-brand-gray">Color:</p>
            <div className="flex gap-2 mb-4">
              {GOAL_COLORS.map(c=>(
                <button key={c} className="btn-primary w-[30px] h-[30px] rounded-full border-4" 
                  style={{ background: c, borderColor: newGoal.color===c ? '#333' : 'transparent' }}
                  onClick={()=>setNewGoal(g=>({...g,color:c}))} />
              ))}
            </div>
            <div className="flex gap-2.5">
              <button className="btn-primary flex-1 p-2.5 bg-brand-cream border-none rounded-xl text-brand-gray" onClick={()=>setShowGoalModal(false)}>Cancelar</button>
              <button className="btn-primary flex-1 p-2.5 bg-gradient-to-br from-brand-cyan to-[#5eb888] border-none rounded-xl text-white font-bold" onClick={handleAddGoal}>Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      {transactions.length > 0 && <>
        <h3 className="text-brand-dark my-4 text-[17px]">📜 Historial</h3>
        {transactions.slice(0,15).map(tx=>(
          <div key={tx.id} className="bg-white rounded-xl p-2.5 px-3.5 mb-2 flex justify-between items-center shadow-sm">
            <div>
              <div className="font-bold text-brand-dark text-[13px]">{tx.desc}</div>
              <div className="text-[11px] text-brand-gray">{new Date(tx.date).toLocaleDateString("es-ES")}</div>
            </div>
            <div className={`font-bold text-[15px] ${tx.euros>0 ? 'text-brand-cyan' : 'text-brand-blueD'}`}>
              {tx.euros>0?"+":""}{tx.euros.toFixed(2)}€
            </div>
          </div>
        ))}
      </>}
    </div>
  );
}
