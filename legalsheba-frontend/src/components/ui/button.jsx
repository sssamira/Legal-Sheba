import React from 'react'

const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
const variants = {
  default: 'bg-primary text-primary-foreground hover:opacity-90 px-4 py-2',
  outline: 'border border-border bg-transparent hover:bg-muted px-4 py-2',
  ghost: 'hover:bg-muted px-3 py-2',
  secondary: 'bg-secondary text-secondary-foreground hover:opacity-90 px-4 py-2',
}
const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10',
  lg: 'h-11 text-base',
}

export function Button({ variant = 'default', size = 'md', className = '', asChild, ...props }) {
  const cls = `${base} ${variants[variant] || variants.default} ${sizes[size] || ''} ${className}`
  return <button className={cls} {...props} />
}

export default Button
