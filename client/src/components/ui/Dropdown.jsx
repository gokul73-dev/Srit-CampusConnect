import React, { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

export default function Dropdown({ trigger, children, className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])
  return (
    <div ref={ref} className={cn('relative inline-block text-left', className)}>
      <div onClick={() => setOpen(v => !v)}>{trigger}</div>
      {open && <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow z-20 p-2">{children}</div>}
    </div>
  )
}
