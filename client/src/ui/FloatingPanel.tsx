import { useRef } from 'react'
import { useTransition, animated } from '@react-spring/web'
import Draggable from 'react-draggable'

import CloseButton from '~/src/ui/CloseButton.js'
import Icon, { type IconNames } from '~/src/ui/Icon.js'
import './FloatingPanel.css'

interface FloatingPanelProps {
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
}: FloatingPanelProps) {
  const nodeRef = useRef<HTMLDivElement>(null)

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
