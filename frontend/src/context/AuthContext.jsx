// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [engineer, setEngineer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('propel_token')
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => {
          setUser(data.user)
          setEngineer(data.engineer)
        })
        .catch(() => {
          localStorage.removeItem('propel_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('propel_token', data.token)
    setUser(data.user)
    setEngineer(data.engineer)
    return data
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    localStorage.setItem('propel_token', data.token)
    setUser(data.user)
    setEngineer(data.engineer)
    return data
  }

  const logout = () => {
    localStorage.removeItem('propel_token')
    setUser(null)
    setEngineer(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, engineer, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)