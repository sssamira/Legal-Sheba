import React from 'react'

export function Checkbox({ className = '', ...props }) {
  return <input type="checkbox" className={`h-4 w-4 rounded border border-input text-primary focus-visible:ring-2 ${className}`} {...props} />
}

export default Checkbox
