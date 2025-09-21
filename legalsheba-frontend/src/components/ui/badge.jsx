import React from 'react'

const variants = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-muted text-foreground',
  outline: 'border border-border',
}

export function Badge({ variant = 'default', className = '', ...props }) {
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${variants[variant] || ''} ${className}`} {...props} />
}

export default Badge
