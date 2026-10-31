// src/pages/CareerPath.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { CheckCircle2, Lock, Star, Zap } from 'lucide-react'

const ICONS  = ['🌱','💻','🔧','⭐','🎯','🏛️']
const COLORS = ['#64748b','#3b82f6','#06b6d4','#10b981','#8b5cf6','#f59e0b']

export default function CareerPath() {
  const { engineer } = useAuth()
  const [ladder,setLadder] = useState([])
  const [score,setScore]   = useState(null)
  const [loading,setLoad]  = useState(true)

  useEffect(()=>{
    const eid = engineer?.id
    Promise.all([
      api.get('/analytics/career-ladder'),
      eid ? api.get(`/engineers/${eid}`) : Promise.resolve({data:null}),
    ]).then(([lr,er])=>{
      setLadder(lr.data)
      setScore(er.data?.scores?.[0]||null)
    }).finally(()=>setLoad(false))
  },[engineer])

  if(loading) return <div className="p-8 flex justify-center"><div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{borderColor:'rgba(99,102,241,.3)',borderTopColor:'#6366f1'}}/></div>

  const ns = parseFloat(score?.north_star_score||0)
  const curLvl = score?.current_level||'Fresher'

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="animate-fade-up">
        <h1 className="section-title flex items-center gap-2">
          <Star size={22} fill="#f59e0b" style={{color:'#f59e0b'}} className="animate-float"/> Career Path
        </h1>
        <p className="section-sub">AI-driven 6-level ladder from Fresher to Architect</p>
      </div>

      {/* Current position banner */}
      {score && (
        <div className="card card-glow animate-fade-up delay-1"
          style={{background:'linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.08))'}}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold mb-1" style={{color:'var(--text-muted)'}}>YOUR CURRENT POSITION</p>
              <p className="text-2xl font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>{curLvl}</p>
              <p className="text-sm mt-1" style={{color:'#a5b4fc'}}>
                North Star Score: <span className="font-bold text-white">{ns.toFixed(1)}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold mb-1" style={{color:'var(--text-muted)'}}>NEXT LEVEL</p>
              <p className="text-xl font-bold" style={{color:'#10b981',fontFamily:'Syne,sans-serif'}}>{score.predicted_next_level}</p>
              <div className="flex items-center gap-2 mt-2 justify-end">
                <div className="score-bar-track w-32">
                  <div className="score-bar-fill"
                    style={{width:`${score.promotion_readiness_pct}%`,background:'linear-gradient(90deg,#6366f1,#10b981)'}}/>
                </div>
                <span className="text-xs font-bold" style={{color:'#10b981'}}>{parseFloat(score.promotion_readiness_pct).toFixed(0)}%</span>
              </div>
              <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>Promotion readiness</p>
            </div>
          </div>
        </div>
      )}

      {/* Ladder */}
      <div className="space-y-3">
        {ladder.map((level,idx)=>{
          const col = COLORS[idx]||COLORS[0]
          const isCur = level.level_name===curLvl
          const unlocked = ns>=parseFloat(level.score_min)
          const progress = unlocked
            ? Math.min(100,((ns-parseFloat(level.score_min))/(parseFloat(level.score_max)-parseFloat(level.score_min)))*100)
            : 0

          return (
            <div key={level.id}
              className={`card animate-fade-up delay-${idx+1} transition-all duration-300`}
              style={{
                border: isCur ? `1px solid ${col}60` : unlocked ? '1px solid var(--border)' : '1px solid rgba(255,255,255,.03)',
                background: isCur ? `${col}10` : 'var(--bg-2)',
                boxShadow: isCur ? `0 0 24px ${col}20` : 'none',
                opacity: unlocked ? 1 : 0.55,
              }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{background:`${col}18`,border:`1px solid ${col}30`}}>
                  {ICONS[idx]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-white">{level.level_name}</h3>
                    {isCur && <span className="badge badge-indigo flex items-center gap-1"><Star size={9} fill="currentColor"/> Current</span>}
                    {!unlocked && <Lock size={12} style={{color:'var(--text-dim)'}}/>}
                    <span className="badge badge-slate">{level.score_min}–{level.score_max} pts</span>
                    <span className="badge badge-slate">{level.typical_years_min}–{level.typical_years_max===99?'∞':level.typical_years_max} yrs</span>
                  </div>
                  <p className="text-sm mb-3" style={{color:'var(--text-muted)'}}>{level.description}</p>
                  {level.key_competencies && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {level.key_competencies.map(c=>(
                        <span key={c} className="badge badge-slate text-xs">{c}</span>
                      ))}
                    </div>
                  )}
                  {isCur && (
                    <div>
                      <div className="flex justify-between text-xs mb-1" style={{color:'var(--text-muted)'}}>
                        <span>Progress to {ladder[idx+1]?.level_name||'Max'}</span>
                        <span style={{color:col}}>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="score-bar-track">
                        <div className="score-bar-fill" style={{width:`${progress}%`,background:`linear-gradient(90deg,${col}80,${col})`}}/>
                      </div>
                    </div>
                  )}
                </div>
                {!unlocked && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>Need</p>
                    <p className="text-xl font-bold" style={{color:col,fontFamily:'Syne,sans-serif'}}>
                      +{(parseFloat(level.score_min)-ns).toFixed(1)}
                    </p>
                    <p className="text-xs" style={{color:'var(--text-dim)'}}>pts</p>
                  </div>
                )}
                {unlocked&&!isCur && <CheckCircle2 size={22} className="flex-shrink-0 mt-1" style={{color:'#10b981'}}/>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Impact stats */}
      <div className="card animate-fade-up delay-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{color:'var(--text-muted)'}}>
          <Zap size={14} style={{color:'#f59e0b'}}/> North Star Expected Impact
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[['40%','Faster Promotions'],['60%','Less Review Bias'],['35%','Better Retention'],['88%','Skill Gap Accuracy'],['50%','Faster Onboarding']].map(([v,l])=>(
            <div key={l} className="rounded-xl p-3 text-center" style={{background:'var(--bg)',border:'1px solid var(--border)'}}>
              <p className="text-2xl font-bold" style={{color:'#a5b4fc',fontFamily:'Syne,sans-serif'}}>{v}</p>
              <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}