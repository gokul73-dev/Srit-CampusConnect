import React, { createContext, useContext, useEffect, useState } from 'react'
import API from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    let mounted = true
    async function init() {
      try {
        const res = await API.get('/auth/me')
        if (!mounted) return
        setUser(res.data.user || res.data)
        setProfile(res.data.profile || res.data.user || res.data)
      } catch (err) {
        console.error('Auth verify failed', err)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    init()
    return () => { mounted = false }
  }, [])

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user); setProfile(data.user)
    return data
  }

  const register = async (payload) => {
    const { data } = await API.post('/auth/register', payload)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user); setProfile(data.user)
    return data
  }

  const signOut = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user')
    setUser(null); setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
