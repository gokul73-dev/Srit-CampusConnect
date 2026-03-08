import React, { useEffect } from 'react'

export default function Toast({ open, message, onClose, duration = 3500 }) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => onClose && onClose(), duration)
    return () => clearTimeout(t)
  }, [open, duration, onClose])

  if (!open) return null
  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className="bg-gray-900 text-white px-4 py-2 rounded shadow">{message}</div>
    </div>
  )
}
