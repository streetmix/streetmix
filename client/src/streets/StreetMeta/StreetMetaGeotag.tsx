import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { IoLocationOutline } from 'react-icons/io5'
import type { StreetLocation } from '@streetmix/types'
import { useSelector, useDispatch } from '../../store/hooks'
import { showDialog } from '../../store/slices/dialogs'
import StreetMetaItem from './StreetMetaItem'

function StreetMetaGeotag (): React.ReactElement | null {
  const street = useSelector((state) => state.street)
  const editable = useSelector(
    (state) => !state.app.readOnly && state.flags.GEOTAG.value
  )
  const dispatch = useDispatch()
  const intl = useIntl()

  // Render nothing if there is no street location, and geolocation is not enabled
  if (!editable && !street.location) return null

  function handleClickGeotag (event: React.MouseEvent): void {
    dispatch(showDialog('GEOTAG'))
  }

  function getGeotagText (
    location: StreetLocation
  ): string | React.ReactElement {
    const { hierarchy } = location
    const unknownLabel = (
      <FormattedMessage
        id="dialogs.geotag.unknown-location"
        defaultMessage="Unknown location"
      />
    )

    let text =
      hierarchy.locality ?? hierarchy.region ?? hierarchy.neighbourhood

    if (text !== undefined && hierarchy.country !== undefined) {
      text = text + ', ' + hierarchy.country
    }

    return text ?? unknownLabel
  }

  // Determine what text label to render
  const geotagText =
    street.location !== null
      ? (
          getGeotagText(street.location)
        )
      : (
        <FormattedMessage
          id="dialogs.geotag.add-location"
          defaultMessage="Add location"
        />
        )

  const tooltip = intl.formatMessage({
    id: 'tooltip.geotag',
    defaultMessage: 'Change location'
  })

  return (
    <StreetMetaItem
      isEditable={editable}
      tooltip={tooltip}
      onClick={handleClickGeotag}
      icon={<IoLocationOutline />}
    >
      <span className="underline">{geotagText}</span>
    </StreetMetaItem>
  )
}

export default StreetMetaGeotag
