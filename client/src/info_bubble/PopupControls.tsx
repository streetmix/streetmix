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
  safePolygon,
  FloatingDelayGroup,
  FloatingPortal,
  FloatingArrow
} from '@floating-ui/react'

import { PopupControlContent } from './PopupControlContent'
import './PopupControls.css'

import type { FloatingDelayGroupProps } from '@floating-ui/react'
import type { Optional, SectionElementTypeAndPosition } from '@streetmix/types'

// Default settings
const POPUP_DELAY = {
  open: 0,
  close: 150
}
const POPUP_DELAY_TIMEOUT = 500
const POPUP_TRANSITION_DURATION = 150
const ARROW_WIDTH = 32
const ARROW_HEIGHT = 16

type PopupControlsProps = SectionElementTypeAndPosition & {
  children: React.ReactElement
}

export function PopupControls ({
  type,
  position,
  children
}: PopupControlsProps): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false)
  const arrowRef = React.useRef(null)
  const { refs, floatingStyles, context, middlewareData } = useFloating({
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
  const hover = useHover(context, {
    delay,
    mouseOnly: true,
    // ISN'T WORKING? HOW DO DEUBG?
    handleClose: safePolygon({
      blockPointerEvents: true,
      buffer: -Infinity,
      requireIntent: false
    })
  }) // TODO: disable hover from closing
  const click = useClick(context)
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    click,
    focus,
    dismiss
  ])

  const arrowX = middlewareData.arrow?.x ?? 0
  const arrowY = middlewareData.arrow?.y ?? 0
  const transformX = arrowX + ARROW_WIDTH / 2
  const transformY = arrowY + ARROW_HEIGHT

  // Define animation
  const { isMounted, styles } = useTransitionStyles(context, {
    duration: isInstantPhase
      ? {
          open: 0,
          close:
            currentId === context.floatingId ? POPUP_TRANSITION_DURATION : 0
        }
      : POPUP_TRANSITION_DURATION,
    initial: ({ side }) => ({
      opacity: 0,
      transform: 'rotateX(-80deg)'
    }),
    common: ({ side }) => ({
      transformOrigin: {
        top: `${transformX}px calc(100% + ${ARROW_HEIGHT}px)`,
        bottom: `${transformX}px ${-ARROW_HEIGHT}px`,
        left: `calc(100% + ${ARROW_HEIGHT}px) ${transformY}px`,
        right: `${-ARROW_HEIGHT}px ${transformY}px`
      }[side]
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
  // In general <PopupControls> wraps a <Button> which does that (a normal HTML
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
            <div className="popup-controls" style={styles}>
              <PopupControlContent type={type} position={position} />
              <FloatingArrow
                className="popup-controls-arrow"
                width={ARROW_WIDTH}
                height={ARROW_HEIGHT}
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

// PopupControlsGroupProps takes all of FloatingDelayGroupProps except that
// `delay` is now optional because we provide our own default value
type PopupControlsGroupProps = Optional<FloatingDelayGroupProps, 'delay'>

// Re-exports <FloatingDelayGroup> with our own default values. It can be
// overridden by props.
export function PopupControlsGroup ({
  children,
  ...props
}: PopupControlsGroupProps): React.ReactNode {
  return (
    <FloatingDelayGroup
      delay={POPUP_DELAY}
      timeoutMs={POPUP_DELAY_TIMEOUT}
      {...props}
    >
      {children}
    </FloatingDelayGroup>
  )
}
