import React from 'react'

import { images } from '~/src/app/load_resources'
import { getLocaleSliceName } from '~/src/segments/labels'
import { useSelector } from '~/src/store/hooks'
import CapacityBar from './CapacityBar'
import CapacityMessage from './CapacityMessage'
import './SliceAnalytics.css'

import type { CapacityForDisplay } from '@streetmix/types'

const BAR_COLORS = 4

interface SliceAnalyticsProps {
  readonly index: number
  readonly type: string
  readonly max: number
  readonly capacity: CapacityForDisplay
}

function SliceAnalytics({ index, type, max, capacity }: SliceAnalyticsProps) {
  const locale = useSelector((state) => state.locale.locale)

  const { average, potential } = capacity
  const label = getLocaleSliceName(type)
  const colorScheme = (index % BAR_COLORS) + 1

  if (average === 0) return null

  let imageEl
  switch (type) {
    case 'magic-carpet':
      imageEl = (
        <img
          src={images.get('vehicles--magic-carpet-jasmine').src}
          style={{ width: '100%', marginTop: '-22%' }}
        />
      )
      break
    case 'drive-lane':
      imageEl = (
        <img
          src={images.get('vehicles--car-inbound').src}
          style={{ width: '100%', marginTop: '-10%' }}
        />
      )
      break
    case 'bike-lane':
      imageEl = (
        <img
          src={images.get('bikes--biker-01-inbound').src}
          style={{ width: '45%', marginTop: '0%' }}
        />
      )
      break
    case 'brt-lane':
      imageEl = (
        <img
          src={images.get('transit--brt-bus-inbound').src}
          style={{ width: '85%', marginTop: '-5%' }}
        />
      )
      break
    case 'sidewalk':
      imageEl = (
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
      imageEl = (
        <img
          src={images.get('scooters--scooter-inbound').src}
          style={{ width: '38%', marginTop: '0%' }}
        />
      )
      break
    case 'light-rail':
      imageEl = (
        <img
          src={images.get('transit--light-rail-inbound').src}
          style={{ width: '65%', marginTop: '-15%' }}
        />
      )
      break
    case 'bus-lane':
      imageEl = (
        <img
          src={images.get('transit--bus-inbound').src}
          style={{ width: '90%', marginTop: '0%' }}
        />
      )
      break
    case 'streetcar':
      imageEl = (
        <img
          src={images.get('transit--streetcar-inbound').src}
          style={{ width: '80%', marginTop: '-15%' }}
        />
      )
      break
  }

  return (
    <div className="slice-analytics" data-color={colorScheme}>
      <div className="capacity-icon">
        <div className="capacity-icon-image">{imageEl}</div>
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

export default SliceAnalytics
