// src/pages/EngineerProfile.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import NorthStarGauge from '../components/NorthStarGauge'
import ScorePillar from '../components/ScorePillar'
import RecommendationCard from '../components/RecommendationCard'
import { RefreshCw, ArrowLeft, Sparkles } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function EngineerProfile() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [history, setHistory] = useState([])
  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [genLoading, setGenLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get(`/engineers/${id}`),
      api.get(`/engineers/${id}/score-history`),
      api.get(`/recommendations/${id}`),
    ]).then(([eRes, hRes, rRes]) => {
      setData(eRes.data)
      setHistory(hRes.data)
      setRecs(rRes.data.filter(r => !r.is_completed).slice(0, 5))
    }).finally(() => setLoading(false))
  }, [id])

  const generateRecs = async () => {
    setGenLoading(true)
    try {
      const res = await api.post(`/recommendations/generate/${id}`)
      setRecs(res.data.recommendations.slice(0, 5))
    } catch (e) { setError('AI generation failed') }
    setGenLoading(false)
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>
  if (!data) return <div className="p-8 text-slate-400">Engineer not found</div>

  const s = data.scores?.[0]
  const ns = parseFloat(s?.north_star_score || 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/manager" className="btn-ghost flex items-center gap-2 text-sm"><ArrowLeft size={15}/> Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{data.engineer.name}</h1>
          <p className="text-slate-400 text-sm">{data.engineer.team} · {data.engineer.current_level} · {data.engineer.years_experience}y exp</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card flex flex-col items-center">
          <NorthStarGauge score={ns} size={200} />
          <div className="mt-3 text-center">
            <p className="text-xs text-slate-400">Promotion Readiness</p>
            <p className="text-lg font-bold text-indigo-400">{parseFloat(s?.promotion_readiness_pct || 0).toFixed(0)}%</p>
            <p className="text-xs text-slate-500 mt-1">→ {s?.predicted_next_level}</p>
          </div>
        </div>
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Performance Pillars</h3>
          <ScorePillar label="Work Completion" score={s?.work_completion_score} weight="25%" icon="✅" color="#22c55e" />
          <ScorePillar label="Code Quality" score={s?.code_quality_score} weight="30%" icon="💎" color="#6366f1" />
          <ScorePillar label="Time Efficiency" score={s?.time_efficiency_score} weight="20%" icon="⚡" color="#f59e0b" />
          <ScorePillar label="Skill Acquisition" score={s?.skill_acquisition_score} weight="25%" icon="🎯" color="#ec4899" />
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {data.skills?.map(sk => (
              <span key={sk.id} className={`badge ${
                sk.proficiency==='expert'?'bg-amber-500/20 text-amber-400':
                sk.proficiency==='advanced'?'bg-emerald-500/20 text-emerald-400':
                sk.proficiency==='intermediate'?'bg-blue-500/20 text-blue-400':
                'bg-slate-500/20 text-slate-400'}`}>
                {sk.skill_name}
              </span>
            ))}
            {!data.skills?.length && <p className="text-xs text-slate-500">No skills recorded</p>}
          </div>
        </div>
      </div>

      {history.length > 1 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Score Trend</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
              <XAxis dataKey="period_label" tick={{ fill:'#64748b', fontSize:11 }} />
              <YAxis domain={[0,100]} tick={{ fill:'#64748b', fontSize:11 }} />
              <Tooltip contentStyle={{ background:'#1a1a2e', border:'1px solid #2a2a4a', borderRadius:8, color:'#e2e8f0' }} />
              <Line type="monotone" dataKey="north_star_score" stroke="#6366f1" strokeWidth={2} dot={{ fill:'#6366f1', r:3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Sparkles size={15} className="text-amber-400" /> AI Recommendations
          </h3>
          <button onClick={generateRecs} disabled={genLoading}
            className="flex items-center gap-2 text-xs btn-primary py-1.5 px-3">
            <RefreshCw size={11} className={genLoading ? 'animate-spin' : ''} />
            {genLoading ? 'Generating…' : 'Generate'}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
        {recs.length === 0
          ? <p className="text-xs text-slate-500 text-center py-6">Click Generate to get AI recommendations</p>
          : <div className="space-y-3">{recs.map(r => <RecommendationCard key={r.id} rec={r} onComplete={rid => setRecs(p => p.filter(x => x.id !== rid))} />)}</div>
        }
      </div>
    </div>
  )
}