import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import Card, { CardHeader, CardContent, CardDescription, CardTitle } from '../components/ui/Card'
import { Bell, Calendar, MessageSquare, Package, FolderKanban, GraduationCap, User, LogOut } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import API from '../services/api'

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth() || {}
  const navigate = useNavigate()

  const [notices, setNotices] = useState([])
  const [events, setEvents] = useState([])
  const [counts, setCounts] = useState({})
  const [loadingData, setLoadingData] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  // Load dashboard data
  useEffect(() => {
    let mounted = true

    async function load() {
      setLoadingData(true)
      try {
        const [nRes, eRes, sRes] = await Promise.all([
          API.get('/notices').catch(() => ({ data: [] })),
          API.get('/events').catch(() => ({ data: { events: [] } })),
          API.get('/api/admin/summary').catch(() => ({ data: {} }))
        ])

        if (!mounted) return

        setNotices(nRes.data || [])
        const eventsData = Array.isArray(eRes.data)
          ? eRes.data
          : (eRes.data.events || [])

        setEvents(eventsData)
        setCounts(sRes.data || {})
      } catch (err) {
        console.error('dashboard load err', err)
      } finally {
        if (mounted) setLoadingData(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Dashboard Features
  const features = [
    {
      title: 'Notice Board',
      description: 'Campus notices',
      icon: Bell,
      path: '/notices',
      colorClass: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Events',
      description: 'Browse & join events',
      icon: Calendar,
      path: '/events',
      colorClass: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Lost & Found',
      description: 'Report / find items',
      icon: Package,
      path: '/lost-found',
      colorClass: 'bg-orange-100 text-orange-600'
    },
    {
      title: 'Projects',
      description: 'Collaborate on projects',
      icon: FolderKanban,
      path: '/projects',
      colorClass: 'bg-green-100 text-green-600'
    },
    {
      title: 'General Chat',
      description: 'Campus-wide discussion forum',
      icon: MessageSquare,
      path: '/chat/general',
      colorClass: 'bg-pink-100 text-pink-600',
      tag: 'Campus-wide'
    },
    {
      title: 'Clubs',
      description: 'Join and connect with club members',
      icon: MessageSquare,
      path: '/clubs',
      colorClass: 'bg-indigo-100 text-indigo-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SRIT CampusConnect</h1>
              <p className="text-sm text-gray-500">
                {profile?.role ? `${profile.role} Dashboard` : 'User Dashboard'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/profile')}>
              <User className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                signOut && signOut()
                navigate('/login')
              }}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="px-8 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name || user?.name || 'User'}!
          </h2>
          <p className="text-gray-600">
            {profile?.department
              ? `Department of ${profile.department}`
              : 'Explore CampusConnect features.'}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <Card
                key={f.title}
                className="cursor-pointer group hover:shadow-lg transition-all hover:-translate-y-1"
                onClick={() => navigate(f.path)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${f.colorClass} p-3 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{f.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          {f.description}
                        </CardDescription>
                      </div>
                    </div>

                    {f.tag && (
                      <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                        {f.tag}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {f.title === 'Events' && (
                    <div className="text-sm text-gray-600 mt-2">
                      {events.length} upcoming
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Admin Section */}
        {profile?.role === 'admin' && (
          <div className="mt-8">
            <Card className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
              <CardHeader>
                <CardTitle className="text-white">Admin Quick Actions</CardTitle>
                <CardDescription className="text-white/80">
                  Manage platform
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/users')}>
                  User Management
                </Button>
                <Button variant="outline" onClick={() => navigate('/notices')}>
                  Manage Notices
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Events & Notices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

          {/* Events */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {events.length} total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {events.slice(0, 6).map(evt => (
                    <li key={evt._id} className="p-3 border rounded-md hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{evt.title}</div>
                          <div className="text-xs text-gray-500">
                            {evt.venue || 'TBA'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {evt.startsAt
                            ? new Date(evt.startsAt).toLocaleString()
                            : 'TBA'}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {evt.description?.slice(0, 120)}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Notices */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Notices</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {notices.length} total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {notices.slice(0, 6).map(n => (
                    <li key={n._id} className="py-2">
                      <div className="font-medium">{n.title}</div>
                      <div className="text-sm text-gray-600">
                        {n.body?.slice(0, 80)}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

        </div>

      </main>
    </div>
  )
}
