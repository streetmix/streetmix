import React, { useEffect } from 'react'

import { useDispatch, useSelector } from '~/src/store/hooks.js'
import { setFloodDistance } from '~/src/store/slices/coastmix.js'
import { GROUND_BASELINE_HEIGHT, TILE_SIZE } from '~/src/segments/constants.js'
import { SEA_LEVEL_RISE_FEET } from './constants.js'
import { calculateSeaLevelRise, checkSeaLevel } from './sea_level.js'
import './SeaLevel.css'

interface SeaLevelProps {
  boundaryWidth: number
  scrollPos: number
  slicesRef: React.RefObject<HTMLDivElement | null>
}

// Wave image is rendered at 8px tall, so we half it to render an "average".
// It is doubled again in a surge.
const HALF_OF_WAVE_HEIGHT = 8 / 2
const WAVE_OPACITY = 0.4

export function SeaLevel({
  boundaryWidth,
  scrollPos,
  slicesRef,
}: SeaLevelProps) {
  const street = useSelector((state) => state.street)
  const coastmixState = useSelector((state) => state.coastmix)
  const dispatch = useDispatch()
  const { seaLevelRise, floodDirection, floodDistance, stormSurge } =
    coastmixState

  // Baseline height
  let height =
    GROUND_BASELINE_HEIGHT - HALF_OF_WAVE_HEIGHT * (stormSurge ? 2 : 1)

  // Calculate how much sea level rises
  const rise = calculateSeaLevelRise(seaLevelRise, stormSurge)

  // Total height added together
  height += rise * TILE_SIZE

  // Show visually when sea level rises
  const opacity = seaLevelRise in SEA_LEVEL_RISE_FEET ? WAVE_OPACITY : 0

  // Default style -- floods full width of section
  const styles: React.CSSProperties = {
    height: `${height}px`,
    opacity,
    left: `-${boundaryWidth}px`,
    right: `-${boundaryWidth}px`,
  }

  // Get and set flood distance
  useEffect(() => {
    if (slicesRef.current === null) return

    const floodDistance = checkSeaLevel(
      street.segments,
      coastmixState,
      slicesRef.current
    )
    dispatch(setFloodDistance(floodDistance))
  }, [street.segments, coastmixState, dispatch, slicesRef])

  // Affect the rain canvas when storm surging
  // TODO: don't do DOM manip
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.rain-canvas')
    if (!el) return
    if (stormSurge) {
      el.style.top = `-${height - 45}px`
    } else {
      el.style.top = 'auto'
    }
  }, [stormSurge, height])

  // If flood direction comes from the left
  if (floodDirection === 'left' && floodDistance !== null) {
    styles.width = `${boundaryWidth + floodDistance}px`
    styles.right = 'auto'
  }
  if (floodDirection === 'right' && floodDistance !== null) {
    styles.left = 'auto'
    styles.width = `${boundaryWidth + floodDistance}px`
  }

  const classNames = ['sea-level-waves']
  if (stormSurge) {
    classNames.push('sea-level-surge')
  }

  return (
    <div className="sea-level-rise" style={styles}>
      <div className={classNames.join(' ')}>
        <div style={getWavePosition(scrollPos)} />
      </div>
    </div>
  )
}

// Wave position for parallax scrolling
function getWavePosition(scrollPos: number): React.CSSProperties {
  const speed = 0.5
  const pos = scrollPos * speed

  return {
    backgroundPosition: `-${pos}px 0`,
  }
}
