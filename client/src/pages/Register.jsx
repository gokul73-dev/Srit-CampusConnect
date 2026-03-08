import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, UserPlus, GraduationCap } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card, { CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
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
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="text-primary w-5 h-5" /> Create account
            </CardTitle>
            <CardDescription>Join our smartplatform community</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input name="name" value={form.name} onChange={onChange} placeholder="Full name" required />
              <Input name="email" value={form.email} onChange={onChange} type="email" placeholder="Email address" required />
              <Input name="password" value={form.password} onChange={onChange} type="password" placeholder="Password" required />

              {/* 🔽 Role dropdown */}
              <select
                name="role"
                value={form.role}
                onChange={onChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-primary"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="clubhead">Club Head</option>
                <option value="admin">Admin</option>
              </select>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className=" bg-primary text-white px-4 py-2"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Register'}
                </Button>
              </div>
            </form>

            <p className="text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} className="text-primary cursor-pointer">
                Sign in
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
