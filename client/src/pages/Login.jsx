import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, LogIn, GraduationCap } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card, { CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-black text-2xl font-bold">Srit CampusConnect</h1>
        </div>

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LogIn className="text-primary w-5 h-5" /> Sign in</CardTitle>
            <CardDescription>Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" required />
              <Input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" required />
              {error && <div className="text-sm text-red-600">{error}</div>}
              <div className="flex justify-end">
                <Button type="submit" className="bg-primary text-white px-4 py-2" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Sign in'}
                </Button>
              </div>
            </form>
            <p className="text-sm text-gray-600 mt-4">Don't have account? <span onClick={()=>navigate('/register')} className="text-primary cursor-pointer">Register</span></p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
