import React, { useState } from 'react'
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  useDelayGroup,
  useFloatingNodeId,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  useTransitionStyles,
  useMergeRefs,
  FloatingDelayGroup,
  FloatingPortal,
  FloatingArrow,
  FloatingNode,
} from '@floating-ui/react'

import type { FloatingDelayGroupProps, Placement } from '@floating-ui/react'
import type { Optional } from '@streetmix/types'

import './Tooltip.css'

// Default settings
const TOOLTIP_PLACEMENT = 'top'
const TOOLTIP_DELAY = {
  open: 150,
  close: 0,
}
const TOOLTIP_DELAY_TIMEOUT = 200
const TOOLTIP_TRANSITION_DURATION = 150
const TOOLTIP_TRANSITION_DISTANCE = 8

interface TooltipOptions {
  placement?: Placement
}

interface TooltipProps extends TooltipOptions {
  label?: string
  sublabel?: string
  children: React.JSX.Element
}

export function Tooltip({
  label,
  sublabel,
  placement = TOOLTIP_PLACEMENT,
  children,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const arrowRef = React.useRef(null)
  const nodeId = useFloatingNodeId()
  const { refs, floatingStyles, context } = useFloating({
    nodeId,
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip({
        crossAxis: placement.includes('-'),
        fallbackAxisSideDirection: 'start',
        padding: 5,
      }),
      shift({ padding: 5 }),
      arrow({
        element: arrowRef,
      }),
    ],
  })
  const { delay, currentId, isInstantPhase } = useDelayGroup(context)
  const hover = useHover(context, { delay })
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ])

  // Define animation
  const { isMounted, styles } = useTransitionStyles(context, {
    duration: isInstantPhase
      ? {
          open: 0,
          close:
            currentId === context.floatingId ? TOOLTIP_TRANSITION_DURATION : 0,
        }
      : TOOLTIP_TRANSITION_DURATION,
    initial: ({ side }) => ({
      opacity: 0,
      transform: {
        top: `translateY(-${TOOLTIP_TRANSITION_DISTANCE}px)`,
        bottom: `translateY(${TOOLTIP_TRANSITION_DISTANCE}px)`,
        left: `translateX(-${TOOLTIP_TRANSITION_DISTANCE}px)`,
        right: `translateX(${TOOLTIP_TRANSITION_DISTANCE}px)`,
      }[side],
    }),
  })

  // We clone the child element so we can apply floating-ui's props
  // to it on top of its existing props.
  // Limitations to keep in mind:
  // - Child element must be a single element or component and cannot
  //   be a fragment
  // - If child element is a React component, the component definition
  //   must also spread its props to whichever element needs to take
  //   floating-ui's props
  // In general <Tooltip> wraps a <Button> which does that (a normal HTML
  // <button> also works just fine as is) but if this becomes too complex,
  // a future workaround is to use floating-ui's `asChild` pattern so that
  // some instances can be wrapped with its own element.
  const tooltipTriggerElement = React.cloneElement(
    children,
    getReferenceProps({
      // Refs are merged between useFloating and an existing child ref, if any.
      ref: useMergeRefs([refs.setReference, children.props.ref]),
      ...children.props,
    })
  )

  // Pass thru if <Tooltip> is rendered without a label
  if (label === undefined) {
    return children
  }

  return (
    <>
      {tooltipTriggerElement}
      <FloatingNode id={nodeId}>
        {isMounted && (
          <FloatingPortal>
            {/* Outer div is our main tooltip wrapper */}
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              {/* Inner div is for styling and additional transforms */}
              <div className="tooltip" style={styles}>
                <p className="tooltip-label">{label}</p>
                {sublabel !== undefined && (
                  <p className="tooltip-sublabel">{sublabel}</p>
                )}
                <FloatingArrow
                  className="tooltip-arrow"
                  ref={arrowRef}
                  context={context}
                />
              </div>
            </div>
          </FloatingPortal>
        )}
      </FloatingNode>
    </>
  )
}

// TooltipGroupProps takes all of FloatingDelayGroupProps except that
// `delay` is now optional because we provide our own default value
type TooltipGroupProps = Optional<FloatingDelayGroupProps, 'delay'>

// Re-exports <FloatingDelayGroup> with our own default values. It can be
// overridden by props.
export function TooltipGroup({ children, ...props }: TooltipGroupProps) {
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
