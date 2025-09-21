import React, { useState } from 'react'

export function Tabs({ defaultValue, value, onValueChange, children, className = '' }) {
  const [internal, setInternal] = useState(defaultValue)
  const current = value !== undefined ? value : internal
  const setVal = onValueChange || setInternal
  return (
    <div className={className}>
      {React.Children.map(children, (c) =>
        React.isValidElement(c)
          ? React.cloneElement(c, { __tabsValue: current, __setTabsValue: setVal })
          : c
      )}
    </div>
  )
}
export function TabsList({ children, className = '' }) {
  return <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>{children}</div>
}
export function TabsTrigger({ value, children, __tabsValue, __setTabsValue }) {
  const active = __tabsValue === value
  return (
    <button
      onClick={() => __setTabsValue && __setTabsValue(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 ${
        active ? 'bg-background text-foreground shadow' : ''
      }`}
    >
      {children}
    </button>
  )
}
export function TabsContent({ value, children, __tabsValue, className = '' }) {
  if (__tabsValue !== value) return null
  return <div className={className}>{children}</div>
}

export default Tabs
