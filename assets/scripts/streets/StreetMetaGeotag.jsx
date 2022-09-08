import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { showDialog } from '../store/slices/dialogs'
import Tooltip from '../ui/Tooltip'

function StreetMetaGeotag (props) {
  const street = useSelector((state) => state.street)
  const editable = useSelector(
    (state) => !state.app.readOnly && state.flags.GEOTAG.value
  )
  const dispatch = useDispatch()
  const intl = useIntl()

  // Render nothing if there is no street location, and geolocation is not enabled
  if (!editable && !street.location) return null

  function handleClickGeotag (event) {
    event.preventDefault()

    dispatch(showDialog('GEOTAG'))
  }

  function getGeotagText () {
    const { hierarchy } = street.location
    const unknownLabel = (
      <FormattedMessage
        id="dialogs.geotag.unknown-location"
        defaultMessage="Unknown location"
      />
    )

    let text = hierarchy.locality
      ? hierarchy.locality
      : hierarchy.region
        ? hierarchy.region
        : hierarchy.neighbourhood
          ? hierarchy.neighbourhood
          : null

    if (text && hierarchy.country) {
      text = text + ', ' + hierarchy.country
    }

    return text || unknownLabel
  }

  // Determine what text label to render
  const geotagText = street.location
    ? (
        getGeotagText()
      )
    : (
      <FormattedMessage
        id="dialogs.geotag.add-location"
        defaultMessage="Add location"
      />
      )

  const title = intl.formatMessage({
    id: 'tooltip.geotag',
    defaultMessage: 'Change location'
  })

  if (editable) {
    return (
      <Tooltip label={title} placement="bottom">
        <span className="street-metadata-map">
          <a onClick={handleClickGeotag}>{geotagText}</a>
        </span>
      </Tooltip>
    )
  }

  return <span className="street-metadata-map">{geotagText}</span>
}

export default StreetMetaGeotag
