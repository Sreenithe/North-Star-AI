// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Star, Mail, Lock, AlertCircle } from 'lucide-react'

const DEMOS = [
  { label:'👷 Engineer', email:'sreenithe@propelsoft.ai', color:'#a5b4fc' },
  { label:'📊 Manager',  email:'manager@propelsoft.ai',  color:'#67e8f9' },
  { label:'🏢 Admin',    email:'admin@propelsoft.ai',    color:'#fcd34d' },
]

export default function Login() {
  const [email,setEmail]       = useState('')
  const [password,setPassword] = useState('password123')
  const [error,setError]       = useState('')
  const [loading,setLoad]      = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoad(true)
    try {
      const d = await login(email, password)
      const r = d.user.role
      nav(r==='engineer'?'/dashboard':r==='manager'?'/manager':'/org')
    } catch(err) {
      setError(err.response?.data?.error || 'Login failed — check your credentials')
    }
    setLoad(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{background:'var(--bg)'}}>
      {/* Ambient glow */}
      <div style={{position:'absolute',top:'-20%',left:'-10%',width:'40%',height:'40%',
        background:'radial-gradient(circle,rgba(99,102,241,.15) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'-20%',right:'-10%',width:'40%',height:'40%',
        background:'radial-gradient(circle,rgba(139,92,246,.12) 0%,transparent 70%)',pointerEvents:'none'}}/>

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'0 0 30px rgba(99,102,241,.5)'}}>
            <Star size={32} className="text-white animate-float" fill="white"/>
            <div style={{position:'absolute',inset:'-4px',borderRadius:'18px',
              border:'1px solid rgba(99,102,241,.4)',pointerEvents:'none'}}/>
          </div>
          <h1 className="text-3xl font-extrabold text-white" style={{fontFamily:'Syne,sans-serif'}}>
            North Star
          </h1>
          <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>for Engineers — AI Performance Intelligence</p>
        </div>

        {/* Card */}
        <div className="card card-glow">
          <h2 className="text-lg font-bold text-white mb-5">Sign In</h2>

          {error && (
            <div className="flex items-center gap-2 rounded-xl p-3 mb-4 text-sm"
              style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.25)',color:'#fca5a5'}}>
              <AlertCircle size={15}/> {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-dim)'}}/>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  className="input pl-9" placeholder="you@company.com" required/>
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-dim)'}}/>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                  className="input pl-9" placeholder="••••••••" required/>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading
                ? <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:'rgba(255,255,255,.3)',borderTopColor:'white'}}/>
                : 'Sign In →'}
            </button>
          </form>

          {/* Demo logins */}
          <div className="mt-6 pt-5" style={{borderTop:'1px solid var(--border)'}}>
            <p className="text-xs text-center mb-3" style={{color:'var(--text-muted)'}}>
              Quick Demo Login <span style={{color:'var(--text-dim)'}}>(password123)</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMOS.map(({label,email:e,color})=>(
                <button key={e} onClick={()=>{setEmail(e);setPassword('password123')}}
                  className="text-xs py-2.5 px-2 rounded-xl transition-all font-medium"
                  style={{
                    background:'var(--bg)',border:'1px solid var(--border)',
                    color:'var(--text-muted)',
                  }}
                  onMouseEnter={ev=>{ev.currentTarget.style.borderColor=color+'60';ev.currentTarget.style.color=color}}
                  onMouseLeave={ev=>{ev.currentTarget.style.borderColor='var(--border)';ev.currentTarget.style.color='var(--text-muted)'}}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-center text-sm mt-4" style={{color:'var(--text-muted)'}}>
            No account?{' '}
            <Link to="/register" style={{color:'#a5b4fc'}} className="font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}