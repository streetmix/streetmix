import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTransition, animated } from '@react-spring/web'
import Draggable, {
  type DraggableProps,
  type DraggableEventHandler,
} from 'react-draggable'

import { CloseButton } from '~/src/ui/CloseButton.js'
import { Icon, type IconNames } from '~/src/ui/Icon.js'
import { useFloatingPanelPortalContainer } from './FloatingPanelPortalContext.js'
import './FloatingPanel.css'

// Allow <Draggable> props to be passed in, but do not require any
interface FloatingPanelProps extends Partial<DraggableProps> {
  icon?: IconNames
  title: string | React.ReactElement /* typeof FormattedMessage */
  show: boolean
  className?: string
  handleClose: React.MouseEventHandler
  children: React.ReactNode
}

// Proof of concept for a z-index tracker that moves the last interacted
// FloatingPanel to the top. This value is shared between all instances of
// FloatingPanel, and incrementing + applying it happens only during an event
// handler, because changing this value cannot re-render or provide reactivity.
// This breaks in hot-module reloading because the value is reset on reload.
// This works for now, but for future cases (e.g. SSR), can move to context
// or Redux state. This is also bad for unit tests -- value increments between
// tests which normally would occur in isolation.
let zIndexTracker = 1

function setZIndex(node: HTMLElement) {
  zIndexTracker++
  node.style.zIndex = String(zIndexTracker)
}

// Exported so tests can reset shared module state between runs.
// eslint-disable-next-line react-refresh/only-export-components
export function resetZIndexTracker() {
  zIndexTracker = 1
}

export function FloatingPanel({
  icon,
  title,
  show,
  className,
  handleClose,
  children,
  ...draggableProps
}: FloatingPanelProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const portalContainer = useFloatingPanelPortalContainer()

  // NOTE: this automatically remembers position state when closed
  // (unless this or its parent component is unmounted)
  // Panels can be placed initially via CSS or otherwise, and if you don't
  // set the `position` prop, then the 0, 0 origin is relative to that
  // TODO: handle the case where a window resizes smaller and a panel appears
  // off-screen. This does not automatically check for on-screen visibility.
  // TODO: consider remembering state between sessions (via localStorage)
  const [position, setPosition] = useState(
    draggableProps.position ?? { x: 0, y: 0 }
  )

  const handleDrag: DraggableEventHandler = (e, data) => {
    setPosition({ x: data.x, y: data.y })
  }

  const classNames = ['floating-panel', 'floating-panel-container-outer']
  if (className) {
    classNames.push(className)
  }

  const transitions = useTransition(show, {
    from: { opacity: 0, scale: 0.75, pointerEvents: 'none' },
    enter: { opacity: 1, scale: 1, pointerEvents: 'auto' },
    leave: { opacity: 0, scale: 0.85, pointerEvents: 'none' },
    config: { tension: 300, friction: 5, clamp: true },
  })

  // On show, new floating panel is on top
  useEffect(() => {
    if (show && nodeRef.current) {
      setZIndex(nodeRef.current)
    }
  }, [show])

  // On interaction, either with mouse, pointer, or keyboard,
  // the current floating panel is on top
  function focusThis(_event: React.PointerEvent | React.FocusEvent) {
    if (nodeRef.current) {
      setZIndex(nodeRef.current)
    }
  }

  const component = transitions(
    (style, item) =>
      item && (
        <Draggable
          bounds="parent"
          handle="header"
          cancel=".close"
          nodeRef={nodeRef}
          onDrag={handleDrag}
          {...draggableProps}
          position={position}
        >
          {/* Two containers are necessary because different libraries are applying CSS transforms */}
          {/* Outer container is transformed by Draggable's position */}
          <div
            className={classNames.join(' ')}
            ref={nodeRef}
            onPointerDown={focusThis}
            onFocus={focusThis}
          >
            {/* Inner container contains transition styles from Transition */}
            <animated.div
              className="floating-panel-container-inner"
              style={style}
            >
              <header>
                <h3>
                  {icon && <Icon name={icon} />}
                  {title}
                </h3>
                <CloseButton onClick={handleClose} />
              </header>
              <div className="floating-panel-content">{children}</div>
            </animated.div>
          </div>
        </Draggable>
      )
  )

  // If testing in isolation there is no portal container, render directly.
  if (portalContainer) {
    return createPortal(component, portalContainer)
  } else {
    return component
  }
}
