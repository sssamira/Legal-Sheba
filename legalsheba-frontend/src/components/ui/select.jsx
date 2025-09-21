import React, { useEffect, useMemo, useRef, useState, createContext, useContext } from 'react'

const SelectCtx = createContext(null)

export function Select({ value, onValueChange, children, defaultValue }) {
  const [internal, setInternal] = useState(defaultValue ?? '')
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const rootRef = useRef(null)

  const val = value !== undefined ? value : internal
  const setVal = onValueChange || setInternal

  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const ctx = useMemo(() => ({ value: val, setValue: setVal, open, setOpen, label, setLabel }), [val, setVal, open, label])

  return (
    <SelectCtx.Provider value={ctx}>
      <div ref={rootRef} className="relative w-full">
        {children}
      </div>
    </SelectCtx.Provider>
  )
}

export function SelectTrigger({ className = '', children }) {
  const { setOpen } = useContext(SelectCtx)
  return (
    <button type="button" onClick={() => setOpen((o) => !o)} className={`inline-flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm ${className}`}>
      {children}
    </button>
  )
}
export function SelectValue({ placeholder }) {
  const { value, label } = useContext(SelectCtx)
  const display = label || (value ? String(value) : '')
  return <span className={`truncate ${display ? '' : 'text-muted-foreground'}`}>{display || placeholder}</span>
}
export function SelectContent({ children }) {
  const { open } = useContext(SelectCtx)
  if (!open) return null
  return (
    <div className="absolute left-0 right-0 mt-2 rounded-md border bg-white p-1 text-sm shadow-lg z-50">
      {children}
    </div>
  )
}
export function SelectItem({ children, value }) {
  const { value: selected, setValue, setOpen, setLabel } = useContext(SelectCtx)
  const isSelected = selected === value
  const onClick = () => {
    setValue && setValue(value)
    setLabel && setLabel(typeof children === 'string' ? children : (children?.props?.children ?? ''))
    setOpen && setOpen(false)
  }
  return (
    <div role="option" aria-selected={isSelected} className={`cursor-pointer rounded px-2 py-1 hover:bg-gray-100 ${isSelected ? 'bg-gray-100' : ''}`} onClick={onClick}>
      {children}
    </div>
  )
}

export default Select
