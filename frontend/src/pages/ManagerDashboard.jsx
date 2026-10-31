// src/pages/ManagerDashboard.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid,Cell } from 'recharts'
import { Users, TrendingUp, AlertTriangle, Trophy, ChevronRight, RefreshCw } from 'lucide-react'

const scoreColor = s => s>=82?'#8b5cf6':s>=70?'#10b981':s>=55?'#06b6d4':s>=40?'#3b82f6':'#ef4444'

export default function ManagerDashboard() {
  const [data,setData] = useState(null)
  const [loading,setLoad] = useState(true)
  useEffect(()=>{ api.get('/analytics/team').then(r=>setData(r.data)).finally(()=>setLoad(false)) },[])

  if(loading) return <div className="p-8 flex justify-center"><div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{borderColor:'rgba(99,102,241,.3)',borderTopColor:'#6366f1'}}/></div>
  if(!data) return null

  const barData = data.engineers.map(e=>({
    name:e.name.split(' ')[0], score:parseFloat(e.north_star_score||0), level:e.current_level
  }))

  const stats = [
    {label:'Team Size',    value:data.totalCount,                   icon:Users,         color:'#a5b4fc'},
    {label:'Avg Score',    value:data.teamAverages.north_star,       icon:TrendingUp,    color:'#6ee7b7'},
    {label:'Promo Ready',  value:data.promotionReady.length,         icon:Trophy,        color:'#fcd34d'},
    {label:'At Risk',      value:data.engineers.filter(e=>parseFloat(e.north_star_score)<40).length, icon:AlertTriangle, color:'#fca5a5'},
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="animate-fade-up">
        <h1 className="section-title">Manager Dashboard</h1>
        <p className="section-sub">Team performance intelligence at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({label,value,icon:Icon,color},i)=>(
          <div key={label} className={`card animate-fade-up delay-${i+1}`}>
            <Icon size={18} className="mb-3" style={{color}}/>
            <p className="stat-value" style={{color}}>{value}</p>
            <p className="stat-label">{label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card animate-fade-up delay-2">
        <h3 className="text-sm font-semibold mb-4" style={{color:'var(--text-muted)'}}>Team North Star Scores</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{top:0,right:0,left:-20,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,.06)" vertical={false}/>
            <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:11,fontFamily:'Space Grotesk'}}/>
            <YAxis domain={[0,100]} tick={{fill:'#64748b',fontSize:11}}/>
            <Tooltip contentStyle={{background:'#0d1120',border:'1px solid rgba(99,102,241,.3)',borderRadius:12,fontFamily:'Space Grotesk'}}
              formatter={(v,_,p)=>[v.toFixed(1)+' pts',p.payload.level]}/>
            <Bar dataKey="score" radius={[6,6,0,0]}>
              {barData.map((e,i)=><Cell key={i} fill={scoreColor(e.score)}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap table */}
      <div className="card animate-fade-up delay-3 overflow-x-auto">
        <h3 className="text-sm font-semibold mb-4" style={{color:'var(--text-muted)'}}>Performance Heatmap</h3>
        <table className="w-full text-sm">
          <thead>
            <tr style={{borderBottom:'1px solid var(--border)'}}>
              {['Engineer','⭐ North Star','✅ Work','💎 Code','⚡ Time','🎯 Skills','Level','Ready',''].map(h=>(
                <th key={h} className="text-left py-2 px-2 text-xs font-semibold" style={{color:'var(--text-muted)'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.engineers.map(e=>{
              const ns=parseFloat(e.north_star_score||0), ready=parseFloat(e.promotion_readiness_pct||0)
              return (
                <tr key={e.id} className="transition-colors" style={{borderBottom:'1px solid rgba(99,102,241,.05)'}}
                  onMouseEnter={ev=>ev.currentTarget.style.background='rgba(99,102,241,.04)'}
                  onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="avatar w-7 h-7 text-xs">{e.name[0]}</div>
                      <div>
                        <p className="text-xs font-semibold text-white">{e.name}</p>
                        <p className="text-xs" style={{color:'var(--text-muted)'}}>{e.team}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2">
                    <span className="text-sm font-bold" style={{color:scoreColor(ns),fontFamily:'Syne,sans-serif'}}>{ns.toFixed(1)}</span>
                  </td>
                  {[e.work_completion_score,e.code_quality_score,e.time_efficiency_score,e.skill_acquisition_score].map((s,i)=>{
                    const v=parseFloat(s||0)
                    return <td key={i} className="px-2 text-center">
                      <span className={`text-xs font-semibold ${v>=75?'text-emerald-400':v>=55?'text-amber-400':'text-red-400'}`}>{v.toFixed(0)}</span>
                    </td>
                  })}
                  <td className="px-2">
                    <span className="badge text-xs" style={{background:`${scoreColor(ns)}20`,color:scoreColor(ns),border:`1px solid ${scoreColor(ns)}40`}}>
                      {e.current_level?.split(' ')[0]}
                    </span>
                  </td>
                  <td className="px-2">
                    <div className="flex items-center gap-1.5">
                      <div className="score-bar-track w-14">
                        <div className="score-bar-fill" style={{width:`${ready}%`,background:'#6366f1'}}/>
                      </div>
                      <span className="text-xs" style={{color:'var(--text-muted)'}}>{ready.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-2">
                    <Link to={`/engineer/${e.id}`} style={{color:'#6366f1'}} className="hover:text-indigo-300 transition-colors">
                      <ChevronRight size={16}/>
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Promotion ready */}
      {data.promotionReady.length>0 && (
        <div className="card card-amber animate-fade-up delay-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{color:'#fcd34d'}}>
            <Trophy size={14}/> Promotion Ready (&gt;70% readiness)
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.promotionReady.map(e=>(
              <Link key={e.id} to={`/engineer/${e.id}`}
                className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
                style={{background:'rgba(245,158,11,.1)',border:'1px solid rgba(245,158,11,.2)'}}>
                <span className="text-sm font-semibold text-white">{e.name}</span>
                <span className="text-xs" style={{color:'#fcd34d'}}>→ {e.predicted_next_level}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}