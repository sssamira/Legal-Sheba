import React from 'react'

export function ScrollArea({ className = '', ...props }) {
  return <div className={`overflow-y-auto ${className}`} {...props} />
}

export default ScrollArea
