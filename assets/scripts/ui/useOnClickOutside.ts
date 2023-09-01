/**
 * useOnClickOutside React Hook
 * from https://usehooks.com/useOnClickOutside/
 *
 * This hook allows you to detect clicks outside of a specified element.
 * For example, use this to close a modal when any element outside of the modal
 * is clicked. By abstracting this logic out into a hook we can easily use it
 * across all of our components that need this kind of functionality (dropdown
 * menus, tooltips, etc).
 */
import { useEffect } from 'react'

export function useOnClickOutside (
  ref: React.RefObject<HTMLElement> | React.MutableRefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(
    () => {
      const listener = (event: MouseEvent | TouchEvent): void => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target as HTMLElement)) {
          return
        }

        handler(event)
      }

      document.addEventListener('mousedown', listener)
      document.addEventListener('touchstart', listener)

      return () => {
        document.removeEventListener('mousedown', listener)
        document.removeEventListener('touchstart', listener)
      }
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new
    // function on every render that will cause this effect
    // callback/cleanup to run every render. It's not a big deal
    // but to optimize you can wrap handler in useCallback before
    // passing it into this hook.
    [ref, handler]
  )
}
