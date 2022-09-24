import React from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import VARIANT_ICONS from '../segments/variant_icons.json'
import { segmentsChanged } from '../segments/view'
import { changeSegmentProperties } from '../store/slices/street'
import Button from '../ui/Button'

function ElevationControl ({ position, segment }) {
  const dispatch = useDispatch()
  const intl = useIntl()

  function isVariantCurrentlySelected (set, selection) {
    let bool

    switch (selection) {
      case 'sidewalk': {
        bool = segment.elevation === 1
        break
      }
      case 'road':
        bool = segment.elevation === 0
        break
      default:
        bool = false
        break
    }

    return bool
  }

  function getButtonOnClickHandler (set, selection) {
    let elevation

    switch (selection) {
      case 'sidewalk':
        elevation = 1
        break
      case 'road':
        elevation = 0
        break
    }

    return (event) => {
      dispatch(changeSegmentProperties(position, { elevation }))
      segmentsChanged()
    }
  }

  function renderButton (set, selection) {
    const icon = VARIANT_ICONS[set][selection]

    if (!icon) return null

    const title = intl.formatMessage({
      id: `variant-icons.${set}|${selection}`,
      defaultMessage: icon.title
    })

    const isSelected = isVariantCurrentlySelected(set, selection)

    return (
      <Button
        title={title}
        className={isSelected ? 'variant-selected' : null}
        disabled={isSelected}
        onClick={getButtonOnClickHandler(set, selection)}
      >
        <svg
          xmlns="http://www.w3.org/1999/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className="icon"
        >
          {/* `xlinkHref` is preferred over `href` for compatibility with Safari */}
          <use xlinkHref={`#icon-${icon.id}`} />
        </svg>
      </Button>
    )
  }

  return (
    <>
      {renderButton('elevation', 'sidewalk')}
      {renderButton('elevation', 'road')}
    </>
  )
}

ElevationControl.propTypes = {
  position: PropTypes.number,
  segment: PropTypes.shape({
    elevation: PropTypes.number
  })
}

export default ElevationControl
