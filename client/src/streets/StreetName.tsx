import { memo, useState } from 'react'
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
  name: string | null
  as?: 'div' | 'span'
  ref?: React.RefObject<HTMLDivElement | HTMLSpanElement | null>
  onClick?: React.MouseEventHandler
  editable?: boolean
}

export const StreetName = memo(function StreetName({
  name,
  as = 'div',
  ref,
  onClick = () => {},
  editable = false,
}: StreetNameProps) {
  const [isHovered, setHovered] = useState(false)
  const InnerTag = as === 'span' ? 'span' : 'div'

  function handleMouseEnter(): void {
    setHovered(true)
  }

  function handleMouseLeave(): void {
    setHovered(false)
  }

  const content = (
    <>
      {editable && isHovered && (
        <InnerTag className="street-name-hover-prompt">
          <FormattedMessage
            id="street.rename"
            defaultMessage="Click to rename"
          />
        </InnerTag>
      )}
      <InnerTag className="street-name-text">
        {normalizeStreetName(name) ?? (
          <FormattedMessage
            id="street.default-name"
            defaultMessage="Unnamed St"
          />
        )}
      </InnerTag>
    </>
  )

  if (as === 'span') {
    return (
      <span
        className="street-name"
        ref={ref as React.Ref<HTMLSpanElement>}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {content}
      </span>
    )
  }

  return (
    <div
      className="street-name"
      ref={ref as React.Ref<HTMLDivElement>}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {content}
    </div>
  )
})
