import React from 'react'

export default function Avatar({ src, name, size = 40 }) {
  if (src) return <img src={src} alt={name} className="rounded-full" style={{ width: size, height: size }} />
  const initials = (name || 'U').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()
  return <div className="rounded-full bg-blue-100 text-blue-700 flex items-center justify-center" style={{ width: size, height: size }}>{initials}</div>
}
