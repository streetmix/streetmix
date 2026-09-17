import { useState, type ReactNode } from 'react'

import { FloatingPanelPortalContext } from './FloatingPanelPortalContext.js'
import './FloatingPanelPortal.css'

interface FloatingPanelPortalProps {
  children: ReactNode
}

// Wraps part of the React tree and renders a target `<div>` inside it, so
// that any <FloatingPanel> rendered by a descendant portals into this
// specific location, rather than wherever it happens to be called from.
// The target div is captured via a callback ref (instead of
// `document.getElementById`) so consumers can react to it becoming
// available after the initial render, once it actually exists in the DOM.
export function FloatingPanelPortal({ children }: FloatingPanelPortalProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  return (
    <FloatingPanelPortalContext.Provider value={container}>
      {children}
      <div className="floating-panel-portal" ref={setContainer} />
    </FloatingPanelPortalContext.Provider>
  )
}
