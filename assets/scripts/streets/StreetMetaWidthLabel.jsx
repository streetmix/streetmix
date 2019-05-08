import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { prettifyWidth } from '../util/width_units'
import './StreetMetaWidthLabel.scss'

// eslint-disable-next-line react/prop-types
function renderStreetWidthRemaining ({ remainingWidth, units }) {
  const width = prettifyWidth(Math.abs(remainingWidth), units)

  if (remainingWidth > 0) {
    return (
      <span className="street-width-under">
        <FormattedMessage id="width.under" defaultMessage="({width} room)" values={{ width }} />
      </span>
    )
  } else if (remainingWidth < 0) {
    return (
      <span className="street-width-over">
        <FormattedMessage id="width.over" defaultMessage="({width} over)" values={{ width }} />
      </span>
    )
  }

  return null
}

const StreetMetaWidthLabel = (props) => {
  const { formatMessage, street, editable, onClick } = props
  const width = prettifyWidth(street.width, street.units)

  // A title attribute is provided only when street width is editable
  const title = (editable)
    ? formatMessage({
      id: 'tooltip.street-width',
      defaultMessage: 'Change width of the street'
    })
    : null

  // Apply a class when street width is editable for styling
  let className = 'street-width'
  if (editable) {
    className += ' street-width-editable'
  }

  return (
    <span className={className} title={title} onClick={onClick}>
      <FormattedMessage id="width.label" defaultMessage="{width} width" values={{ width }} />
      {renderStreetWidthRemaining(street)}
    </span>
  )
}

StreetMetaWidthLabel.propTypes = {
  // pass intl's formatMessage() to here to avoid HOC wrapper
  formatMessage: PropTypes.func.isRequired,

  // from parent component
  street: PropTypes.shape({
    units: PropTypes.number,
    width: PropTypes.number,
    occupiedWidth: PropTypes.number,
    remainingWidth: PropTypes.number
  }).isRequired,
  editable: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
}

export default StreetMetaWidthLabel
