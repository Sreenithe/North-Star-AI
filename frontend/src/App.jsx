// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'
import EngineerDashboard from './pages/EngineerDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import CareerPath from './pages/CareerPath'
import TeamAnalytics from './pages/TeamAnalytics'
import SubmitMetrics from './pages/SubmitMetrics'
import EngineerProfile from './pages/EngineerProfile'
import OrgOverview from './pages/OrgOverview'


function Spinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{background:'var(--bg)'}}>
      <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
        style={{borderColor:'rgba(99,102,241,.3)',borderTopColor:'#6366f1'}}/>
      <p className="text-sm" style={{color:'var(--text-muted)'}}>Loading North Star…</p>
    </div>
  )
}

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner/>
  if (!user) return <Navigate to="/login" replace/>
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace/>
  return children
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace/>
  if (user.role === 'engineer') return <Navigate to="/dashboard" replace/>
  if (user.role === 'manager') return <Navigate to="/manager" replace/>
  return <Navigate to="/org" replace/>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/" element={<PrivateRoute><Layout/></PrivateRoute>}>
            <Route index element={<RoleRedirect/>}/>
            <Route path="dashboard" element={<PrivateRoute roles={['engineer','admin']}><EngineerDashboard/></PrivateRoute>}/>
            <Route path="career"    element={<PrivateRoute roles={['engineer','admin']}><CareerPath/></PrivateRoute>}/>
            <Route path="submit-metrics" element={<PrivateRoute roles={['engineer','admin']}><SubmitMetrics/></PrivateRoute>}/>
            <Route path="manager"   element={<PrivateRoute roles={['manager','admin']}><ManagerDashboard/></PrivateRoute>}/>
            <Route path="team"      element={<PrivateRoute roles={['manager','admin','hr']}><TeamAnalytics/></PrivateRoute>}/>
            <Route path="engineer/:id" element={<PrivateRoute roles={['manager','admin','hr']}><EngineerProfile/></PrivateRoute>}/>
            <Route path="org"       element={<PrivateRoute roles={['hr','admin']}><OrgOverview/></PrivateRoute>}/>

          </Route>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}