/**
 * Get the currently hovered segment
 * This is for keyboard commands (e.g. "delete") that
 * act on whichever is segment is being hovered upon
 */
export function getHoveredSegmentEl () {
  return document.querySelector('.segment.hover')
}
