import { createContext, useContext } from 'react'

export const FloatingPanelPortalContext = createContext<HTMLDivElement | null>(
  null
)
export const FloatingPanelPortalProvider = FloatingPanelPortalContext.Provider

// Read the current portal target, if one has been set up by an ancestor
// <FloatingPanelPortal>. Falls back to `null` when there isn't one, e.g. in
// tests that render <FloatingPanel> in isolation.
export function useFloatingPanelPortalContainer(): HTMLDivElement | null {
  return useContext(FloatingPanelPortalContext)
}
