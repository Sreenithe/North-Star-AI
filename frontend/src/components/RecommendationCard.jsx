// src/components/RecommendationCard.jsx
import { BookOpen, Award, Code2, Users, AlertCircle, ArrowUpCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import api from '../utils/api'
import { useState } from 'react'

const typeConfig = {
  course: { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Course' },
  certification: { icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Certification' },
  project: { icon: Code2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Project' },
  mentoring: { icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', label: 'Mentoring' },
  skill_gap: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Skill Gap' },
  career_move: { icon: ArrowUpCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', label: 'Career Move' },
}

const priorityBadge = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-amber-500/20 text-amber-400',
  low: 'bg-emerald-500/20 text-emerald-400',
}

export default function RecommendationCard({ rec, onComplete }) {
  const cfg = typeConfig[rec.recommendation_type] || typeConfig.course
  const Icon = cfg.icon
  const [completing, setCompleting] = useState(false)

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await api.patch(`/recommendations/${rec.id}/complete`)
      onComplete?.(rec.id)
    } catch (e) {
      console.error(e)
    }
    setCompleting(false)
  }

  return (
    <div className={`card-sm border ${cfg.bg} space-y-3 ${rec.is_completed ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.bg}`}>
            <Icon size={16} className={cfg.color} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-white">{rec.title}</p>
              <span className={`badge ${priorityBadge[rec.priority]}`}>{rec.priority}</span>
              <span className="badge bg-slate-700 text-slate-300">{cfg.label}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rec.description}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-3">
          {rec.estimated_impact && (
            <span className="text-xs text-emerald-400">+{rec.estimated_impact} score impact</span>
          )}
          {rec.resource_url && (
            <a href={rec.resource_url} target="_blank" rel="noopener noreferrer"
               className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <ExternalLink size={11} /> Resource
            </a>
          )}
        </div>
        {!rec.is_completed && (
          <button onClick={handleComplete} disabled={completing}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors">
            <CheckCircle2 size={14} />
            {completing ? 'Saving…' : 'Mark Done'}
          </button>
        )}
        {rec.is_completed && (
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={12} /> Completed
          </span>
        )}
      </div>
    </div>
  )
}