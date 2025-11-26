import React from 'react'

import { useSelector } from '~/src/store/hooks'
import { getLocaleSliceName } from '~/src/segments/labels'
import { images } from '~/src/app/load_resources'
import CapacityMessage from './CapacityMessage'
import CapacityBar from './CapacityBar'
import './SegmentAnalytics.css'

import type { CapacityForDisplay } from '@streetmix/types'

const BAR_COLORS = 4

interface SegmentAnalyticsProps {
  index: number
  type: string
  max: number
  capacity: CapacityForDisplay
}

function SegmentAnalytics({
  index,
  type,
  max,
  capacity,
}: SegmentAnalyticsProps): React.ReactElement | null {
  const locale = useSelector((state) => state.locale.locale)

  const { average, potential } = capacity
  const label = getLocaleSliceName(type, locale)
  const colorScheme = (index % BAR_COLORS) + 1

  if (average === 0) return null

  let ImageElement
  switch (type) {
    case 'magic-carpet':
      ImageElement = (
        <img
          src={images.get('vehicles--magic-carpet-jasmine').src}
          style={{ width: '100%', marginTop: '-22%' }}
        />
      )
      break
    case 'drive-lane':
      ImageElement = (
        <img
          src={images.get('vehicles--car-inbound').src}
          style={{ width: '100%', marginTop: '-10%' }}
        />
      )
      break
    case 'bike-lane':
      ImageElement = (
        <img
          src={images.get('bikes--biker-01-inbound').src}
          style={{ width: '45%', marginTop: '0%' }}
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
          style={{ width: '38%', marginTop: '0%' }}
        />
      )
      break
    case 'light-rail':
      ImageElement = (
        <img
          src={images.get('transit--light-rail-inbound').src}
          style={{ width: '65%', marginTop: '-15%' }}
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
          style={{ width: '80%', marginTop: '-15%' }}
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
