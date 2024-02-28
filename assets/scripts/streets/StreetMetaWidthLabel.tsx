import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { ChevronDownIcon, RulerHorizontalIcon } from '@radix-ui/react-icons'
import { useSelector } from '../store/hooks'
import Tooltip from '../ui/Tooltip'
import { prettifyWidth } from '../util/width_units'
import type { StreetJsonExtra } from '@streetmix/types'
import './StreetMetaWidthLabel.scss'

interface StreetMetaWidthLabelProps {
  street: StreetJsonExtra
  editable: boolean
  onClick: (e: React.MouseEvent) => void
}

function StreetMetaWidthLabel ({
  street,
  editable,
  onClick
}: StreetMetaWidthLabelProps): React.ReactElement {
  const locale = useSelector((state) => state.locale.locale)
  const width = prettifyWidth(street.width, street.units, locale)

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

  function renderStreetWidthRemaining (
    { remainingWidth, units }: StreetJsonExtra,
    locale: string
  ): React.ReactElement | null {
    const width = prettifyWidth(Math.abs(remainingWidth), units, locale)

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

  const component = (
    <span className={className} onClick={onClick}>
      <RulerHorizontalIcon />
      <FormattedMessage
        id="width.label"
        defaultMessage="{width} width"
        values={{ width }}
      />
      {renderStreetWidthRemaining(street, locale)}
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
