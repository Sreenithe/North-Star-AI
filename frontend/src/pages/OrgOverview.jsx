// src/pages/OrgOverview.jsx
import { useEffect, useState } from 'react'
import api from '../utils/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Users, TrendingUp, Trophy, AlertTriangle, ShieldCheck, Building2 } from 'lucide-react'

const LEVEL_COLORS = { 'Fresher':'#64748b','Junior Engineer':'#3b82f6','Mid Engineer':'#06b6d4','Senior Engineer':'#22c55e','Team Lead':'#8b5cf6','Architect':'#f59e0b' }

export default function OrgOverview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/org-overview').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 flex justify-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>
  if (!data) return null

  const { summary, levelDistribution, teamPerformance } = data

  const statsCards = [
    { label: 'Total Engineers', value: summary.total_engineers, icon: Users, color: 'text-indigo-400' },
    { label: 'Avg North Star', value: parseFloat(summary.avg_score || 0).toFixed(1), icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Promotion Ready', value: summary.promotion_ready, icon: Trophy, color: 'text-amber-400' },
    { label: 'At Risk', value: summary.at_risk, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Bias Flags', value: summary.bias_flagged, icon: ShieldCheck, color: 'text-cyan-400' },
  ]

  const levelBar = levelDistribution.map(l => ({
    name: l.current_level?.replace(' Engineer','') || 'Unknown',
    count: parseInt(l.count),
    color: LEVEL_COLORS[l.current_level] || '#64748b',
  }))

  const teamBar = teamPerformance.map(t => ({
    name: t.team || 'Unknown',
    score: parseFloat(t.avg_score || 0),
    size: parseInt(t.size),
  }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Org Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Talent intelligence across the organization</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statsCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Distribution */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Building2 size={15} className="text-indigo-400" /> Level Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={levelBar}>
              <XAxis dataKey="name" tick={{ fill:'#94a3b8', fontSize:11 }} />
              <YAxis tick={{ fill:'#94a3b8', fontSize:11 }} />
              <Tooltip contentStyle={{ background:'#1a1a2e', border:'1px solid #2a2a4a', borderRadius:8, color:'#e2e8f0' }} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {levelBar.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team Performance */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Team Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={teamBar}>
              <XAxis dataKey="name" tick={{ fill:'#94a3b8', fontSize:11 }} />
              <YAxis domain={[0,100]} tick={{ fill:'#94a3b8', fontSize:11 }} />
              <Tooltip
                contentStyle={{ background:'#1a1a2e', border:'1px solid #2a2a4a', borderRadius:8, color:'#e2e8f0' }}
                formatter={(v, _, props) => [`${v} avg score (${props.payload.size} engineers)`]}
              />
              <Bar dataKey="score" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PROPEL SOFT impact summary */}
      <div className="card bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border-indigo-500/20">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">PROPEL SOFT System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-[#0f0f1a] rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Bias Detection</p>
            <p className="text-lg font-bold text-cyan-400">{summary.bias_flagged || 0} flags</p>
            <p className="text-xs text-slate-600 mt-1">Async contributors detected & normalized</p>
          </div>
          <div className="bg-[#0f0f1a] rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">AI Recommendations</p>
            <p className="text-lg font-bold text-amber-400">Active</p>
            <p className="text-xs text-slate-600 mt-1">Personalized paths for all engineers</p>
          </div>
          <div className="bg-[#0f0f1a] rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Career Ladder</p>
            <p className="text-lg font-bold text-emerald-400">6 Levels</p>
            <p className="text-xs text-slate-600 mt-1">Fresher → Junior → Mid → Senior → Lead → Architect</p>
          </div>
        </div>
      </div>
    </div>
  )
}