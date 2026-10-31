
// src/components/NorthStarGauge.jsx
export default function NorthStarGauge({ score = 0, size = 200 }) {
  const r = 80, cx = size/2, cy = size*0.6
  const halfCirc = Math.PI * r
  const pct = Math.min(100, Math.max(0, score)) / 100
  const offset = halfCirc - pct * halfCirc

  const color = score<40?'#ef4444':score<55?'#f97316':score<70?'#eab308':score<82?'#10b981':score<92?'#6366f1':'#f59e0b'

  const level = score<40?'Fresher':score<55?'Junior Engineer':score<70?'Mid Engineer':
    score<82?'Senior Engineer':score<92?'Team Lead':'Architect'

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size*0.68} viewBox={`0 0 ${size} ${size*0.68}`}>
        <defs>
          <linearGradient id={`grad-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6"/>
            <stop offset="100%" stopColor={color} stopOpacity="1"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Track */}
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14" strokeLinecap="round"/>
        {/* Fill */}
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
          fill="none" stroke={`url(#grad-${score})`} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={halfCirc} strokeDashoffset={offset} filter="url(#glow)"
          style={{ transition:'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)' }}/>
        {/* Center star */}
        <text x={cx} y={cy-28} textAnchor="middle" fill="white"
          fontSize="36" fontWeight="800" fontFamily="Syne,sans-serif">
          {score.toFixed(1)}
        </text>
        <text x={cx} y={cy-10} textAnchor="middle" fill="#475569"
          fontSize="9" fontWeight="600" letterSpacing="2">
          NORTH STAR SCORE
        </text>
        {/* Tick marks */}
        {[0,25,50,75,100].map(v=>{
          const a = Math.PI - (v/100)*Math.PI
          const tx = cx + (r+18)*Math.cos(Math.PI-a)
          const ty = cy - (r+18)*Math.sin(Math.PI-a) + (r+18)*0
          // fix: use standard angle
          const angle = (1 - v/100) * Math.PI
          const tx2 = cx + (r+16)*Math.cos(angle) * -1
          const ty2 = cy - (r+16)*Math.sin(angle)
          return (
            <text key={v} x={cx+(r+20)*Math.cos(Math.PI*(1-v/100))}
              y={cy-Math.abs((r+20)*Math.sin(Math.PI*(1-v/100)))+4}
              textAnchor="middle" fill="#334155" fontSize="8">{v}</text>
          )
        })}
      </svg>
      <span className="text-xs font-bold tracking-wide mt-0.5" style={{ color }}>
        {level}
      </span>
    </div>
  )
}