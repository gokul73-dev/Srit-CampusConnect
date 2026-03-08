import React from 'react'
import { cn } from '../../lib/utils'

export default function Button({ children, variant='default', className, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variants = {
    default: 'bg-primary text-white px-4 py-2',
    ghost: 'bg-transparent px-2 py-1',
    outline: 'border border-gray-200 px-3 py-1',
    secondary: 'bg-white/10 text-white px-3 py-1'
  }
  return <button className={cn(base, variants[variant] || variants.default, className)} {...props}>{children}</button>
}
