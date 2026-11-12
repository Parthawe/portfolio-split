import { useState, type ReactNode } from 'react'
export default function OriginalExperiment({children}: {children: ReactNode}) {
  const [open, setOpen] = useState(false)
  return <details className="world-original" onToggle={event => setOpen(event.currentTarget.open)}><summary>Open the original browser experiment</summary>{open && children}</details>
}
