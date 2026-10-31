// src/pages/SubmitMetrics.jsx
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

const SECTIONS = [
  {
    title: '✅ Work Completion', weight: '25%', color: 'text-emerald-400',
    fields: [
      { key: 'sprints_completed', label: 'Sprints Completed', type: 'number', hint: 'Number of sprints you finished' },
      { key: 'total_sprints', label: 'Total Sprints', type: 'number', hint: 'Total sprints in the period', default: 5 },
      { key: 'tickets_closed', label: 'Tickets Closed', type: 'number', hint: 'Jira/Linear tickets resolved' },
      { key: 'tickets_assigned', label: 'Tickets Assigned', type: 'number', hint: 'Total tickets assigned to you' },
      { key: 'on_time_delivery_pct', label: 'On-Time Delivery %', type: 'number', hint: '0-100, % of tasks delivered on time' },
    ]
  },
  {
    title: '💎 Code Quality', weight: '30%', color: 'text-indigo-400',
    fields: [
      { key: 'commits_count', label: 'Commits', type: 'number', hint: 'Total commits pushed' },
      { key: 'prs_merged', label: 'PRs Merged', type: 'number', hint: 'Pull requests merged' },
      { key: 'prs_reviewed', label: 'PRs Reviewed', type: 'number', hint: 'Other people\'s PRs you reviewed' },
      { key: 'bugs_introduced', label: 'Bugs Introduced', type: 'number', hint: 'Bugs/regressions you caused' },
      { key: 'bugs_fixed', label: 'Bugs Fixed', type: 'number', hint: 'Bugs you resolved' },
      { key: 'code_review_score', label: 'Code Review Score', type: 'number', hint: '0-100, quality of your code reviews' },
      { key: 'sonar_maintainability', label: 'SonarQube Maintainability', type: 'number', hint: '0-100 (from SonarQube dashboard)' },
    ]
  },
  {
    title: '⚡ Time Efficiency', weight: '20%', color: 'text-amber-400',
    fields: [
      { key: 'avg_cycle_time_hours', label: 'Avg Cycle Time (hours)', type: 'number', hint: 'Average hours from ticket start to merge' },
      { key: 'focus_time_pct', label: 'Focus Time %', type: 'number', hint: '0-100, % of day in deep work' },
      { key: 'context_switches', label: 'Daily Context Switches', type: 'number', hint: 'Times switching between tasks per day' },
      { key: 'overtime_hours', label: 'Overtime Hours', type: 'number', hint: 'Extra hours beyond 8hr/day this period' },
    ]
  },
  {
    title: '🎯 Skill Acquisition', weight: '25%', color: 'text-pink-400',
    fields: [
      { key: 'courses_completed', label: 'Courses Completed', type: 'number', hint: 'Online courses finished (Coursera, Udemy, etc.)' },
      { key: 'certifications_earned', label: 'Certifications Earned', type: 'number', hint: 'Professional certs obtained' },
      { key: 'new_technologies', label: 'New Technologies Learned', type: 'number', hint: 'New tools/frameworks adopted' },
      { key: 'mentoring_sessions', label: 'Mentoring Sessions', type: 'number', hint: 'Sessions you mentored others' },
    ]
  },
]

const defaultForm = {
  period_label: 'Q1 2025',
  sprints_completed: '', total_sprints: '5',
  tickets_closed: '', tickets_assigned: '',
  on_time_delivery_pct: '',
  commits_count: '', prs_merged: '', prs_reviewed: '',
  bugs_introduced: '', bugs_fixed: '',
  code_review_score: '', sonar_maintainability: '',
  avg_cycle_time_hours: '', focus_time_pct: '',
  context_switches: '', overtime_hours: '',
  courses_completed: '', certifications_earned: '',
  new_technologies: '', mentoring_sessions: '',
}

export default function SubmitMetrics() {
  const { engineer } = useAuth()
  const [form, setForm] = useState(defaultForm)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState(0)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    const payload = {}
    Object.keys(form).forEach(k => {
      payload[k] = k === 'period_label' ? form[k] : parseFloat(form[k] || 0)
    })

    try {
      const res = await api.post(`/engineers/${engineer.id}/metrics`, payload)
      setResult(res.data.score)
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed')
    }
    setLoading(false)
  }

  if (result) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="card text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Metrics Submitted!</h2>
            <p className="text-slate-400 mt-1">Your North Star Score has been calculated</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '🌟 North Star Score', value: parseFloat(result.north_star_score).toFixed(1), color: 'text-indigo-400' },
              { label: '✅ Work Completion', value: parseFloat(result.work_completion_score).toFixed(1), color: 'text-emerald-400' },
              { label: '💎 Code Quality', value: parseFloat(result.code_quality_score).toFixed(1), color: 'text-blue-400' },
              { label: '⚡ Time Efficiency', value: parseFloat(result.time_efficiency_score).toFixed(1), color: 'text-amber-400' },
              { label: '🎯 Skill Acquisition', value: parseFloat(result.skill_acquisition_score).toFixed(1), color: 'text-pink-400' },
              { label: '📈 Promotion Readiness', value: `${parseFloat(result.promotion_readiness_pct).toFixed(0)}%`, color: 'text-violet-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#0f0f1a] rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0f0f1a] rounded-xl p-4">
            <p className="text-sm text-slate-400">Current Level</p>
            <p className="text-xl font-bold text-white mt-1">{result.current_level}</p>
            <p className="text-sm text-indigo-400 mt-1">→ Predicted Next: <strong>{result.predicted_next_level}</strong></p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setResult(null); setForm(defaultForm) }}
              className="btn-ghost flex-1">Submit Another</button>
            <a href="/dashboard" className="btn-primary flex-1 text-center">View Dashboard</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Submit Performance Metrics</h1>
        <p className="text-slate-400 text-sm mt-1">Enter your activity data — AI will calculate your North Star Score</p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {SECTIONS.map((s, i) => (
          <button key={i} onClick={() => setActiveSection(i)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium
              ${activeSection === i ? 'bg-indigo-600 text-white' : 'bg-[#1a1a2e] text-slate-400 hover:text-white border border-[#2a2a4a]'}`}>
            {s.title} <span className="opacity-60">{s.weight}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card space-y-5">
          {/* Period label */}
          <div>
            <label className="label">Period Label</label>
            <input className="input" value={form.period_label} onChange={set('period_label')}
              placeholder="e.g. Q1 2025, Sprint 12" required />
          </div>

          {/* Active section fields */}
          <div>
            <h3 className={`text-sm font-semibold mb-4 ${SECTIONS[activeSection].color}`}>
              {SECTIONS[activeSection].title} — {SECTIONS[activeSection].weight} of North Star Score
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SECTIONS[activeSection].fields.map(({ key, label, type, hint }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input type={type} className="input" value={form[key]} onChange={set(key)}
                    placeholder={`0`} min="0" step="any" />
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                    <Info size={10} /> {hint}
                  </p>
                </div>
              ))}
            </div>
          </div>

{/* 🔍 SonarQube Code Quality Check */}
<div className="mt-6 p-4 bg-[#0f0f1a] rounded-xl border border-[#2a2a4a]">
  <h3 className="text-sm font-semibold text-indigo-400 mb-2">
    🔍 Code Quality Check (SonarQube)
  </h3>

  <p className="text-xs text-slate-500 mb-3">
    Use SonarQube to analyze your code quality and enter the maintainability score above.
  </p>

  <a
    href="http://localhost:9000"
    target="_blank"
    rel="noopener noreferrer"
  >
    <button
      type="button"
      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
    >
      Open SonarQube Dashboard
    </button>
  </a>
</div>

          {/* Navigation */}
          <div className="flex justify-between pt-2 border-t border-[#2a2a4a]">
            <button type="button"
              onClick={() => setActiveSection(s => Math.max(0, s - 1))}
              disabled={activeSection === 0}
              className="btn-ghost disabled:opacity-30">← Previous</button>

            {activeSection < SECTIONS.length - 1 ? (
              <button type="button"
                onClick={() => setActiveSection(s => s + 1)}
                className="btn-primary">Next →</button>
            ) : (
              <button type="submit" disabled={loading}
                className="btn-primary flex items-center gap-2">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Calculating…</>
                  : '🚀 Calculate North Star Score'}
              </button>
            )}
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4 text-sm text-red-400">
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </form>
    </div>
  )
}