import React from 'react'
import { cn } from '../../lib/utils'

export default function Input({ className, ...props }) {
  return <input className={cn('w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary', className)} {...props} />
}
