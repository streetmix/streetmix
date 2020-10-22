import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { showDialog } from '../store/slices/dialogs'

function StreetMetaGeotag (props) {
  const street = useSelector((state) => state.street)
  const editable = useSelector(
    (state) => !state.app.readOnly && state.flags.GEOTAG.value
  )
  const dispatch = useDispatch()

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
  const geotagText = street.location ? (
    getGeotagText()
  ) : (
    <FormattedMessage
      id="dialogs.geotag.add-location"
      defaultMessage="Add location"
    />
  )

  return (
    <span className="street-metadata-map">
      {editable ? <a onClick={handleClickGeotag}>{geotagText}</a> : geotagText}
    </span>
  )
}

export default StreetMetaGeotag
