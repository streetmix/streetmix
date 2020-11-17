import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { getLocaleSegmentName } from '../../segments/view'
import { images } from '../../app/load_resources'
import CapacityMessage from './CapacityMessage'
import CapacityBar from './CapacityBar'
import './SegmentAnalytics.scss'

const BAR_COLORS = 4

SegmentAnalytics.propTypes = {
  index: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  max: PropTypes.number.isRequired,
  capacity: PropTypes.shape({
    average: PropTypes.number,
    potential: PropTypes.number
  }).isRequired
}

function SegmentAnalytics ({ index, type, max, capacity }) {
  const locale = useSelector((state) => state.locale.locale)

  const { average, potential } = capacity
  const label = getLocaleSegmentName(type, locale)
  const colorScheme = (index % BAR_COLORS) + 1

  if (average === 0) return null

  let ImageElement
  switch (type) {
    case 'magic-carpet':
      ImageElement = (
        <img src={images.get('vehicles--magic-carpet-jasmine').src} />
      )
      break
    case 'drive-lane':
      ImageElement = (
        <img
          src={images.get('vehicles--car-inbound').src}
          style={{ width: '80%', marginTop: '-120%' }}
        />
      )
      break
    case 'bike-lane':
      ImageElement = (
        <img
          src={images.get('bikes--biker-01-inbound').src}
          style={{ width: '50%', marginTop: '-40%' }}
        />
      )
      break
    case 'brt-lane':
      ImageElement = (
        <img
          src={images.get('transit--brt-bus-inbound').src}
          style={{ width: '85%', marginTop: '-5%' }}
        />
      )
      break
    case 'sidewalk':
      ImageElement = (
        <>
          <img src={images.get('people--people-01').src} />
          <img
            src={images.get('people--people-06').src}
            style={{ marginLeft: '-40%' }}
          />
        </>
      )
      break
    case 'scooter':
      ImageElement = (
        <img
          src={images.get('scooters--scooter-inbound').src}
          style={{ width: '45%', marginTop: '-10%' }}
        />
      )
      break
    case 'light-rail':
      ImageElement = (
        <img
          src={images.get('transit--light-rail-inbound').src}
          style={{ width: '70%', marginTop: '-20%' }}
        />
      )
      break
    case 'bus-lane':
      ImageElement = (
        <img
          src={images.get('transit--bus-inbound').src}
          style={{ width: '90%', marginTop: '0%' }}
        />
      )
      break
    case 'streetcar':
      ImageElement = (
        <img
          src={images.get('transit--streetcar-inbound').src}
          style={{ width: '80%', marginTop: '-30%' }}
        />
      )
      break
  }

  return (
    <div className="segment-analytics" data-color={colorScheme}>
      <div className="capacity-icon">
        <div className="capacity-icon-image">{ImageElement}</div>
      </div>
      <CapacityBar average={average} potential={potential} max={max} />
      <div className="capacity-text">
        <div className="capacity-label">{label}</div>
        <div className="capacity-summary">
          <CapacityMessage
            average={average}
            potential={potential}
            locale={locale}
          />
        </div>
      </div>
    </div>
  )
}

export default SegmentAnalytics
