import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import { ChevronDownIcon, RulerHorizontalIcon } from '@radix-ui/react-icons'
import Tooltip from '../ui/Tooltip'
import { prettifyWidth } from '../util/width_units'
import './StreetMetaWidthLabel.scss'

// eslint-disable-next-line react/prop-types
function renderStreetWidthRemaining ({ remainingWidth, units }) {
  const width = prettifyWidth(Math.abs(remainingWidth), units)

  if (remainingWidth > 0) {
    return (
      <span className="street-width-under">
        <FormattedMessage
          id="width.under"
          defaultMessage="({width} room)"
          values={{ width }}
        />
      </span>
    )
  } else if (remainingWidth < 0) {
    return (
      <span className="street-width-over">
        <FormattedMessage
          id="width.over"
          defaultMessage="({width} over)"
          values={{ width }}
        />
      </span>
    )
  }

  return null
}

StreetMetaWidthLabel.propTypes = {
  street: PropTypes.shape({
    units: PropTypes.number,
    width: PropTypes.number,
    occupiedWidth: PropTypes.number,
    remainingWidth: PropTypes.number
  }).isRequired,
  editable: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
}

function StreetMetaWidthLabel (props) {
  const { street, editable, onClick } = props
  const width = prettifyWidth(street.width, street.units)

  // A title attribute is provided only when street width is editable
  const intl = useIntl()
  const title = intl.formatMessage({
    id: 'tooltip.street-width',
    defaultMessage: 'Change width of the street'
  })

  // Apply a class when street width is editable for styling
  let className = 'street-width'
  if (editable) {
    className += ' street-width-editable'
  }

  const component = (
    <span className={className} onClick={onClick}>
      <RulerHorizontalIcon />
      <FormattedMessage
        id="width.label"
        defaultMessage="{width} width"
        values={{ width }}
      />
      {renderStreetWidthRemaining(street)}
      {editable && <ChevronDownIcon className="menu-carat-down" />}
    </span>
  )

  if (editable) {
    return (
      <Tooltip label={title} placement="bottom">
        {component}
      </Tooltip>
    )
  }

  return component
}

export default StreetMetaWidthLabel
