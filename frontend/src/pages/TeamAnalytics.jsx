// src/pages/TeamAnalytics.jsx
import { useEffect, useState } from 'react'
import api from '../utils/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const LEVEL_COLORS = { 'Fresher':'#64748b','Junior Engineer':'#3b82f6','Mid Engineer':'#06b6d4','Senior Engineer':'#22c55e','Team Lead':'#8b5cf6','Architect':'#f59e0b' }
const PIE_COLORS = Object.values(LEVEL_COLORS)

export default function TeamAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/team').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 flex justify-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>
  if (!data) return null

  const levelPie = Object.entries(data.levelDistribution).map(([name, value]) => ({ name, value }))

  const avgBar = [
    { name: 'Work Completion', score: parseFloat(data.teamAverages.work_completion) },
    { name: 'Code Quality', score: parseFloat(data.teamAverages.code_quality) },
    { name: 'Time Efficiency', score: parseFloat(data.teamAverages.time_efficiency) },
    { name: 'Skill Acquisition', score: parseFloat(data.teamAverages.skill_acquisition) },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Team Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Aggregated performance intelligence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avg pillars */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Team Average by Pillar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={avgBar} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" domain={[0,100]} tick={{ fill:'#64748b', fontSize:11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill:'#94a3b8', fontSize:11 }} width={110} />
              <Tooltip contentStyle={{ background:'#1a1a2e', border:'1px solid #2a2a4a', borderRadius:8, color:'#e2e8f0' }} />
              <Bar dataKey="score" radius={[0,4,4,0]} fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Level distribution pie */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Level Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={levelPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name.split(' ')[0]}: ${value}`}>
                {levelPie.map((entry, i) => (
                  <Cell key={i} fill={LEVEL_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background:'#1a1a2e', border:'1px solid #2a2a4a', borderRadius:8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg North Star', value: data.teamAverages.north_star, color: 'text-indigo-400' },
          { label: 'Avg Work', value: data.teamAverages.work_completion, color: 'text-emerald-400' },
          { label: 'Avg Code Quality', value: data.teamAverages.code_quality, color: 'text-blue-400' },
          { label: 'Avg Skills', value: data.teamAverages.skill_acquisition, color: 'text-pink-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}