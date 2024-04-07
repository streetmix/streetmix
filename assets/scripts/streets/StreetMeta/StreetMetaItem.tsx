import React from 'react'
import Tooltip from '../../ui/Tooltip'
import './StreetMetaItem.scss'

interface StreetMetaItemProps {
  isEditable?: boolean // Might need a better name; isInteractive?
  tooltip?: string
  sublabel?: string
  onClick?: (event: React.MouseEvent) => void
  icon?: React.ReactNode
  children: React.ReactNode
}

function StreetMetaItem ({
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

  const content = (
    <>
      {icon !== undefined && <div className="street-meta-icon">{icon}</div>}
      <div className="street-meta-content">{children}</div>
    </>
  )

  if (isEditable) {
    return (
      <div className="street-meta-item">
        <Tooltip label={tooltip} sublabel={sublabel} placement="bottom">
          <button onClick={handleClick}>{content}</button>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="street-meta-item street-meta-item-plain">{content}</div>
  )
}

export default StreetMetaItem
