import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import API from '../services/api'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'

export default function Profile(){
  const { user } = useAuth()
  const [profile, setProfile] = useState(user || {})
  const [saving, setSaving] = useState(false)

  useEffect(()=> setProfile(user || {}), [user])

  const save = async () => {
    setSaving(true)
    try {
      const res = await API.put('/users/me', profile)
      setProfile(res.data)
      alert('Saved')
    } catch (err) { alert('Save failed') } finally { setSaving(false) }
  }

  return (
    <Card>
      <h3 className="text-lg font-medium mb-3">Profile</h3>
      <div className="space-y-3">
        <Input value={profile.name || ''} onChange={e=>setProfile({...profile, name: e.target.value})} placeholder="Full name" />
        <Input value={profile.department || ''} onChange={e=>setProfile({...profile, department: e.target.value})} placeholder="Department" />
        <Input value={profile.year || ''} onChange={e=>setProfile({...profile, year: e.target.value})} placeholder="Year" />
        <div className="text-right">
          <button onClick={save} className="bg-primary text-white px-3 py-1 rounded" disabled={saving}>Save</button>
        </div>
      </div>
    </Card>
  )
}
