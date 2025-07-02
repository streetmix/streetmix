import React, { useState } from 'react'
import {
  useFloating,
  autoUpdate,
  shift,
  arrow,
  useDelayGroup,
  useHover,
  useClick,
  useFocus,
  useDismiss,
  useInteractions,
  useTransitionStyles,
  useMergeRefs,
  FloatingDelayGroup,
  FloatingPortal,
  FloatingArrow
} from '@floating-ui/react'
import type { FloatingDelayGroupProps } from '@floating-ui/react'
import type { Optional } from '@streetmix/types'
import './TestPopupUI.css'

// Default settings
const TOOLTIP_DELAY = {
  open: 150,
  close: 0
}
const TOOLTIP_DELAY_TIMEOUT = 200
const TOOLTIP_TRANSITION_DURATION = 150
const TOOLTIP_TRANSITION_DISTANCE = 8

interface TestPopupProps {
  children: React.ReactElement
}

export function TestPopup ({ children }: TestPopupProps): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false)
  const arrowRef = React.useRef(null)
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    whileElementsMounted: autoUpdate,
    middleware: [
      shift({
        crossAxis: true,
        padding: {
          right: 20,
          left: 20,
          top: 130 // minimum distance from top of viewport
        }
      }),
      arrow({
        element: arrowRef,
        padding: 20
      })
    ]
  })
  const { delay, currentId, isInstantPhase } = useDelayGroup(context)
  const hover = useHover(context, { delay, mouseOnly: true }) // TODO: disable hover from closing
  const click = useClick(context)
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    click,
    focus,
    dismiss
  ])

  // Define animation
  const { isMounted, styles } = useTransitionStyles(context, {
    duration: isInstantPhase
      ? {
          open: 0,
          close:
            currentId === context.floatingId ? TOOLTIP_TRANSITION_DURATION : 0
        }
      : TOOLTIP_TRANSITION_DURATION,
    initial: ({ side }) => ({
      opacity: 0,
      transform: 'rotateX(-80deg)'
    }),
    common: () => ({
      perspective: '1200px',
      transformOrigin: 'bottom'
    })
  })

  // We clone the child element so we can apply floating-ui's props
  // to it on top of its existing props.
  // Limitations to keep in mind:
  // - Child element must be a single element or component and cannot
  //   be a fragment
  // - If child element is a React component, the component definition
  //   must also spread its props to whichever element needs to take
  //   floating-ui's props
  // In general <TestPopup> wraps a <Button> which does that (a normal HTML
  // <button> also works just fine as is) but if this becomes too complex,
  // a future workaround is to use floating-ui's `asChild` pattern so that
  // some instances can be wrapped with its own element.
  const tooltipTriggerElement = React.cloneElement(
    children,
    getReferenceProps({
      // Refs are merged between useFloating and an existing child ref, if any.
      ref: useMergeRefs([
        refs.setReference,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (children as any).ref
      ]),
      ...children.props
    })
  )

  return (
    <>
      {tooltipTriggerElement}
      {isMounted && (
        <FloatingPortal>
          {/* Outer div is our main tooltip wrapper */}
          <div
            ref={refs.setFloating}
            className="floating-ui-wrapper"
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {/* Inner div is for styling and additional transforms */}
            <div className="slice-controls" style={styles}>
              <p className="tooltip-label">test</p>
              <FloatingArrow
                className="slice-controls-arrow"
                width={32}
                height={16}
                ref={arrowRef}
                context={context}
              />
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

// TestPopupGroupProps takes all of FloatingDelayGroupProps except that
// `delay` is now optional because we provide our own default value
type TestPopupGroupProps = Optional<FloatingDelayGroupProps, 'delay'>

// Re-exports <FloatingDelayGroup> with our own default values. It can be
// overridden by props.
export function TestPopupGroup ({
  children,
  ...props
}: TestPopupGroupProps): React.ReactNode {
  return (
    <FloatingDelayGroup
      delay={TOOLTIP_DELAY}
      timeoutMs={TOOLTIP_DELAY_TIMEOUT}
      {...props}
    >
      {children}
    </FloatingDelayGroup>
  )
}
