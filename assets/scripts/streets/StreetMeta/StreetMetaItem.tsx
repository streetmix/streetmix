import React from 'react'
import Tooltip from '../../ui/Tooltip'
import './StreetMetaItem.scss'

interface StreetMetaItemProps {
  className?: string
  isEditable?: boolean // Might need a better name; isInteractive?
  tooltip?: string
  sublabel?: string
  onClick?: (event: React.MouseEvent) => void
  icon?: React.ReactNode
  children: React.ReactNode
}

function StreetMetaItem ({
  className = '',
  isEditable = false,
  tooltip,
  sublabel,
  onClick = () => {},
  icon,
  children
}: StreetMetaItemProps): React.ReactElement {
  function handleClick (event: React.MouseEvent): void {
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
      <div className={classNames.join(' ')}>
        <Tooltip label={tooltip} sublabel={sublabel} placement="bottom">
          <button onClick={handleClick}>{content}</button>
        </Tooltip>
      </div>
    )
  }

  return <div className={classNames.join(' ')}>{content}</div>
}

export default StreetMetaItem
