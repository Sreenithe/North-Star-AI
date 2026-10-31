// src/components/ScorePillar.jsx
export default function ScorePillar({ label, score=0, weight, icon, color='#6366f1' }) {
  const v = Math.min(100, Math.max(0, parseFloat(score)||0))
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-xs font-medium" style={{color:'var(--text-muted)'}}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{color:'var(--text-dim)'}}>{weight}</span>
          <span className="text-sm font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>{v.toFixed(1)}</span>
        </div>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{
          width:`${v}%`,
          background:`linear-gradient(90deg,${color}80,${color})`,
          boxShadow:`0 0 8px ${color}50`,
        }}/>
      </div>
    </div>
  )
}