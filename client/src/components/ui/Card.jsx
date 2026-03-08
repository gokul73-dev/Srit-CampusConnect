import React from 'react'
import { cn } from '../../lib/utils'

export function Card({ children, className, ...props }) {
  return <div className={cn('bg-white p-4 rounded-2xl shadow-card', className)} {...props}>{children}</div>
}

export function CardHeader({ children, className, ...props }) {
  return <div className={cn('mb-2 flex items-center justify-between', className)} {...props}>{children}</div>
}

export function CardContent({ children, className, ...props }) {
  return <div className={cn('text-sm text-gray-700', className)} {...props}>{children}</div>
}

export function CardTitle({ children, className, ...props }) {
  return <h3 className={cn('text-lg font-semibold', className)} {...props}>{children}</h3>
}

export function CardDescription({ children, className, ...props }) {
  return <p className={cn('text-sm text-gray-500', className)} {...props}>{children}</p>
}

export default Card
