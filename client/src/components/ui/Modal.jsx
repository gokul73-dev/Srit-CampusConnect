import React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'

export default function Modal({ open, onClose, children }) {
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}/>
      <div className={cn('bg-white rounded-lg p-6 z-10 w-full max-w-2xl')}>{children}</div>
    </div>,
    document.body
  )
}
