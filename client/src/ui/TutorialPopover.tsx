import { useRef, cloneElement } from 'react'
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  useFloatingNodeId,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  useTransitionStyles,
  useMergeRefs,
  FloatingPortal,
  FloatingArrow,
  FloatingNode,
} from '@floating-ui/react'

import { useDispatch } from '~/src/store/hooks.js'
import { nextTutorialStep } from '~/src/store/slices/app.js'
import { Button } from './Button.js'

import type { Placement } from '@floating-ui/react'

import './TutorialPopover.css'

// Default settings
const TOOLTIP_PLACEMENT = 'top'
const TOOLTIP_TRANSITION_DURATION = 150
const TOOLTIP_TRANSITION_DISTANCE = 8

interface TutorialPopoverOptions {
  placement?: Placement
}

interface TutorialPopoverProps extends TutorialPopoverOptions {
  isOpen: boolean
  label?: string
  children: React.JSX.Element
}

export function TutorialPopover({
  isOpen,
  label,
  placement = TOOLTIP_PLACEMENT,
  children,
}: TutorialPopoverProps) {
  const dispatch = useDispatch()
  const arrowRef = useRef(null)
  const nodeId = useFloatingNodeId()
  const { refs, floatingStyles, context } = useFloating({
    nodeId,
    open: isOpen,
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
  const hover = useHover(context)
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
    duration: TOOLTIP_TRANSITION_DURATION,
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
  // In general <TutorialPopover> wraps a <Button> which does that (a normal HTML
  // <button> also works just fine as is) but if this becomes too complex,
  // a future workaround is to use floating-ui's `asChild` pattern so that
  // some instances can be wrapped with its own element.
  const tooltipTriggerElement = cloneElement(
    children,
    getReferenceProps({
      // Refs are merged between useFloating and an existing child ref, if any.
      ref: useMergeRefs([refs.setReference, children.props.ref]),
      ...children.props,
    })
  )

  // Pass thru if <TutorialPopover> is rendered without a label
  if (label === undefined) {
    return children
  }

  function handleNext() {
    dispatch(nextTutorialStep())
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
              <div className="tutorial-popover" style={styles}>
                <p className="tutorial-popover-label">{label}</p>
                <Button onClick={handleNext} primary>
                  Next
                </Button>

                <FloatingArrow
                  className="tutorial-popover-arrow"
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
