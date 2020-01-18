import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import './StreetName.scss'

const MAX_STREET_NAME_WIDTH = 50

/**
 * Some processing needed to display street name
 *
 * @public for main street name ¯\_(ツ)_/¯
 * @params {string} name - Street name to check
 */
function normalizeStreetName (name) {
  if (!name) return ''

  name = name.trim()

  if (name.length > MAX_STREET_NAME_WIDTH) {
    name = name.substr(0, MAX_STREET_NAME_WIDTH) + '…'
  }

  return name
}

StreetName.propTypes = {
  name: PropTypes.string,
  childRef: PropTypes.object,
  onClick: PropTypes.func,
  editable: PropTypes.bool
}

function StreetName (props) {
  const { name = '', childRef, onClick = () => {}, editable = false } = props
  const [isHovered, setHovered] = useState(false)

  function handleMouseEnter () {
    setHovered(true)
  }

  function handleMouseLeave () {
    setHovered(false)
  }

  return (
    <div
      className="street-name"
      ref={childRef}
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
        {normalizeStreetName(name) || (
          <FormattedMessage
            id="street.default-name"
            defaultMessage="Unnamed St"
          />
        )}
      </div>
    </div>
  )
}

export default React.memo(StreetName)
