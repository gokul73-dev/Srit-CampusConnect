import React, { useEffect, useState } from 'react'
import API from '../services/api'
import Card from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'

export default function Users(){
  const { profile } = useAuth()
  const [users, setUsers] = useState([])

  useEffect(()=> { if(profile?.role==='admin') API.get('/users').then(r=>setUsers(r.data)).catch(()=>{}) },[profile])

  const changeRole = async (id) => {
    const role = prompt('New role (student,faculty,clubhead,admin)')
    if (!role) return
    await API.put(`/users/${id}/role`, { role })
    setUsers(prev => prev.map(u => u._id===id?{...u, role}:u))
  }

  if (profile?.role !== 'admin') return <div className="text-sm text-gray-600">Admin only</div>

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Users</h2>
      <div className="space-y-2">
        {users.map(u => (
          <Card key={u._id}>
            <div className="flex justify-between">
              <div>{u.name}<div className="text-xs text-gray-500">{u.email}</div></div>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <div>{u.role}</div>
                <button className="text-primary" onClick={()=>changeRole(u._id)}>Change</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
