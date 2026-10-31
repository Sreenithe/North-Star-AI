// src/components/Layout.jsx
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, TrendingUp, Users, BarChart3, PlusCircle, LogOut, Star, Building2, Database, Zap, ChevronRight } from 'lucide-react'

const engineerNav = [
  { to:'/dashboard',      icon:LayoutDashboard, label:'My Dashboard',  desc:'Score & career' },
  { to:'/career',         icon:TrendingUp,      label:'Career Path',   desc:'6-level ladder' },
  { to:'/submit-metrics', icon:PlusCircle,      label:'Submit Metrics',desc:'Update scores' },
  { to:'/integrations',   icon:Database,        label:'Data Sources',  desc:'GitHub, Jira, etc.' },
  { to:'/pipeline',       icon:Zap,             label:'AI Pipeline',   desc:'Live event stream' },
]
const managerNav = [
  { to:'/manager',    icon:LayoutDashboard, label:'Manager View',   desc:'Team overview' },
  { to:'/team',       icon:Users,           label:'Team Analytics', desc:'Charts & heatmap' },
  { to:'/pipeline',   icon:Zap,             label:'AI Pipeline',    desc:'Live event stream' },
]
const hrNav = [
  { to:'/org',  icon:Building2, label:'Org Overview',   desc:'Talent intelligence' },
  { to:'/team', icon:Users,     label:'Team Analytics', desc:'Charts & heatmap' },
]
const adminNav = [
  { to:'/dashboard',      icon:LayoutDashboard, label:'My Dashboard',  desc:'Score & career' },
  { to:'/career',         icon:TrendingUp,      label:'Career Path',   desc:'6-level ladder' },
  { to:'/submit-metrics', icon:PlusCircle,      label:'Submit Metrics',desc:'Update scores' },
  { to:'/manager',        icon:BarChart3,       label:'Manager View',  desc:'Team overview' },
  { to:'/team',           icon:Users,           label:'Team Analytics',desc:'Charts & heatmap' },
  { to:'/org',            icon:Building2,       label:'Org Overview',  desc:'Talent intel' },
  { to:'/integrations',   icon:Database,        label:'Data Sources',  desc:'All integrations' },
  { to:'/pipeline',       icon:Zap,             label:'AI Pipeline',   desc:'Live event stream' },
]

const LEVEL_COLOR = {
  'Fresher':'#64748b','Junior Engineer':'#3b82f6','Mid Engineer':'#06b6d4',
  'Senior Engineer':'#10b981','Team Lead':'#8b5cf6','Architect':'#f59e0b',
}

export default function Layout() {
  const { user, engineer, logout } = useAuth()
  const location = useLocation()
  const nav = user?.role==='admin'?adminNav:user?.role==='manager'?managerNav:user?.role==='hr'?hrNav:engineerNav
  const score = parseFloat(engineer?.north_star_score||0)
  const lc = LEVEL_COLOR[engineer?.current_level]||'#6366f1'

  return (
    <div className="flex min-h-screen" style={{background:'var(--bg)'}}>
      <aside className="w-64 flex-shrink-0 flex flex-col sticky top-0 h-screen"
        style={{background:'var(--bg-2)',borderRight:'1px solid var(--border)'}}>
        {/* Logo */}
        <div className="p-5" style={{borderBottom:'1px solid var(--border)'}}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'0 0 16px rgba(99,102,241,.5)'}}>
              <Star size={18} className="text-white" fill="white"/>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none" style={{fontFamily:'Syne,sans-serif'}}>North Star</p>
              <p className="text-xs mt-0.5 leading-none" style={{color:'var(--text-muted)'}}>for Engineers</p>
            </div>
          </div>
        </div>
        {/* User card */}
        <div className="p-4" style={{borderBottom:'1px solid var(--border)'}}>
          <div className="p-3 rounded-xl" style={{background:'var(--bg)',border:'1px solid var(--border)'}}>
            <div className="flex items-center gap-3">
              <div className="avatar w-9 h-9 text-sm flex-shrink-0">
                {(engineer?.name||user?.email||'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{engineer?.name||user?.email}</p>
                <p className="text-xs truncate" style={{color:lc}}>{engineer?.current_level||user?.role}</p>
              </div>
              {score>0&&(
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-bold" style={{color:lc,fontFamily:'Syne,sans-serif'}}>{score.toFixed(0)}</p>
                  <p className="text-xs" style={{color:'var(--text-muted)'}}>score</p>
                </div>
              )}
            </div>
            {score>0&&(
              <div className="mt-2.5">
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{width:`${score}%`,background:lc}}/>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({to,icon:Icon,label,desc})=>{
            const active=location.pathname===to
            return (
              <NavLink key={to} to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background:active?'rgba(99,102,241,0.12)':'transparent',
                  color:active?'#a5b4fc':'var(--text-muted)',
                  border:active?'1px solid rgba(99,102,241,0.3)':'1px solid transparent',
                }}>
                <Icon size={16} className="flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{color:active?'#e0e7ff':'inherit'}}>{label}</p>
                  <p style={{color:'var(--text-dim)',fontSize:'10px'}}>{desc}</p>
                </div>
                {active&&<ChevronRight size={12} style={{color:'#6366f1'}}/>}
              </NavLink>
            )
          })}
        </nav>
        {/* Bottom */}
        <div className="p-3" style={{borderTop:'1px solid var(--border)'}}>
          <div className="flex items-center gap-2 mb-2 px-2">
            <span className={`badge ${user?.role==='admin'?'badge-amber':user?.role==='manager'?'badge-violet':user?.role==='hr'?'badge-cyan':'badge-indigo'}`}>
              {user?.role?.toUpperCase()}
            </span>
            <div className="dot-live ml-auto"/>
            <span className="text-xs" style={{color:'var(--text-muted)'}}>Live</span>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{color:'var(--text-muted)'}}
            onMouseEnter={e=>{e.currentTarget.style.color='#fca5a5';e.currentTarget.style.background='rgba(239,68,68,.08)'}}
            onMouseLeave={e=>{e.currentTarget.style.color='var(--text-muted)';e.currentTarget.style.background='transparent'}}>
            <LogOut size={15}/> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto relative z-10"><Outlet/></main>
    </div>
  )
}