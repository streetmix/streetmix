import React, { memo, useState } from 'react'
import { FormattedMessage } from 'react-intl'

import './StreetName.css'

const MAX_STREET_NAME_WIDTH = 50

function normalizeStreetName(name: string | null): string | null {
  // If name is null, pass through -- a placeholder display name
  // will be handled by localization
  if (name === null) return null

  name = name.trim()

  if (name.length > MAX_STREET_NAME_WIDTH) {
    name = name.substring(0, MAX_STREET_NAME_WIDTH) + '…'
  }

  return name
}

interface StreetNameProps {
  readonly name: string | null
  readonly ref?: React.RefObject<HTMLDivElement | null>
  readonly onClick?: () => void
  readonly editable?: boolean
}

function StreetName({
  name,
  ref,
  onClick = () => {},
  editable = false,
}: StreetNameProps) {
  const [isHovered, setHovered] = useState(false)

  function handleMouseEnter(): void {
    setHovered(true)
  }

  function handleMouseLeave(): void {
    setHovered(false)
  }

  return (
    <div
      className="street-name"
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {editable && isHovered && (
        <div className="street-name-hover-prompt">
          <FormattedMessage
            id="street.rename"
            defaultMessage="Click to rename"
          />
        </div>
      )}
      <div className="street-name-text">
        {normalizeStreetName(name) ?? (
          <FormattedMessage
            id="street.default-name"
            defaultMessage="Unnamed St"
          />
        )}
      </div>
    </div>
  )
}

export default memo(StreetName)
