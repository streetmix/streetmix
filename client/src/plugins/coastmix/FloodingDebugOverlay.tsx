import { convertMetricMeasurementToImperial } from '@streetmix/utils'
import { SliceTypes } from '@streetmix/parts'

import { useSelector } from '~/src/store/hooks.js'

import type { FloodDetails } from '@streetmix/types'
import './FloodingDebugOverlay.css'

const disallowFlooding = [
  SliceTypes.CAR,
  SliceTypes.BIKE,
  SliceTypes.TRANSIT,
  SliceTypes.BIKE,
  // Maybe okay to flood, if we're lax about it!
  // SliceTypes.FURNITURE,
  // SliceTypes.FLEX,
  SliceTypes.UTILITY,
]

function Details({
  details,
  remainingWidth,
}: {
  details: FloodDetails | null
  remainingWidth: number
}) {
  if (details === null)
    return (
      <>
        <br />
        Not a waterfront
      </>
    )

  const distance =
    typeof details.distance === 'number'
      ? details.distance + remainingWidth / 2
      : details.distance
  const distanceDisplay =
    typeof distance === 'number'
      ? `${convertMetricMeasurementToImperial(distance)} ft`
      : distance

  const styledTypes = []
  if (details.floodedTypes.length > 0) {
    for (let i = 0; i < details.floodedTypes.length; i++) {
      const type = details.floodedTypes[i]
      if (disallowFlooding.includes(type)) {
        styledTypes.push(
          <span style={{ color: 'red' }} key={type}>
            {type}
          </span>
        )
      } else {
        styledTypes.push(
          <span style={{ color: 'lightgreen' }} key={type}>
            {type}
          </span>
        )
      }
    }
  } else {
    styledTypes.push(<span key="none">none</span>)
  }

  return (
    <>
      <br />
      Distance flooded: {distanceDisplay}
      <br />
      Flooded areas:{' '}
      <span style={{ textTransform: 'lowercase' }}>
        {styledTypes.map((el, i) => [i > 0 && ', ', el])}
      </span>
      <br />
      Bad?{' '}
      {details.flooded ? (
        <span style={{ color: 'red' }}>yes</span>
      ) : (
        <span style={{ color: 'lightgreen' }}>no</span>
      )}
    </>
  )
}

export function FloodingDebugOverlay({ on }: { on: boolean }) {
  const { remainingWidth } = useSelector((state) => state.street)
  const { floodDetails } = useSelector((state) => state.coastmix)
  const [left, right] = floodDetails

  if (!on) {
    return null
  }

  return (
    <div className="flooding-debug-overlay">
      <h2>Flooding debug</h2>
      <p>
        Left:
        <Details details={left} remainingWidth={remainingWidth} />
      </p>
      <p>
        Right:
        <Details details={right} remainingWidth={remainingWidth} />
      </p>
    </div>
  )
}
