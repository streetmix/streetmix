import React from 'react'

import { Tooltip } from '../../ui/Tooltip.js'
import './StreetMetaItem.css'

interface StreetMetaItemProps {
  className?: string
  isEditable?: boolean // Might need a better name; isInteractive?
  tooltip?: string
  sublabel?: string
  onClick?: React.MouseEventHandler
  icon?: React.ReactNode
  children: React.ReactNode

  // We needed to type this for some special logic, below
  'data-state'?: string
}

function StreetMetaItem({
  className = '',
  isEditable = false,
  tooltip,
  sublabel,
  onClick = () => {},
  icon,
  children,
  // extra props from Radix UI's dropdown menu are spread to child element
  ...restProps
}: StreetMetaItemProps) {
  function handleClick(event: React.MouseEvent): void {
    event.preventDefault()
    onClick(event)
  }

  const classNames = ['street-meta-item']
  if (!isEditable) {
    classNames.push('street-meta-item-plain')
  }
  if (className) {
    classNames.push(className)
  }

  const content = (
    <>
      {icon !== undefined && <div className="street-meta-icon">{icon}</div>}
      <div className="street-meta-content">{children}</div>
    </>
  )

  if (isEditable) {
    return (
      <div className={classNames.join(' ')} {...restProps}>
        <Tooltip label={tooltip} sublabel={sublabel} placement="bottom">
          <button onClick={handleClick} aria-label={tooltip}>
            {content}
          </button>
        </Tooltip>
      </div>
    )
  }

  return <div className={classNames.join(' ')}>{content}</div>
}

export default StreetMetaItem
