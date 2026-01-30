import { useRef, useState } from 'react'
import { useTransition, animated } from '@react-spring/web'
import Draggable, {
  type DraggableProps,
  type DraggableEventHandler,
} from 'react-draggable'

import CloseButton from '~/src/ui/CloseButton.js'
import Icon, { type IconNames } from '~/src/ui/Icon.js'
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

  // NOTE: this automatically remembers position state when closed
  // (unless this or its parent component is unmounted)
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

  return transitions(
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
          <div className={classNames.join(' ')} ref={nodeRef}>
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
}
