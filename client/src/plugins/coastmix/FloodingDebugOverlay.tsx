import { convertMetricMeasurementToImperial } from '@streetmix/utils'
import { SliceTypes } from '@streetmix/parts'
import type { FloodDetails } from '@streetmix/types'

import { useSelector } from '~src/store/hooks.js'
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

function Details({ details }: { details: FloodDetails }) {
  if (details === null) return

  const distance = details.distance ?? 0
  const distanceDisplay =
    typeof distance === 'number' && distance !== Infinity
      ? `${convertMetricMeasurementToImperial(distance)} ft`
      : 'max'

  const styledTypes = []
  if (details.floodedTypes.length > 0) {
    for (let i = 0; i < details.floodedTypes.length; i++) {
      const type = details.floodedTypes[i]
      if (disallowFlooding.includes(type)) {
        styledTypes.push(<span style={{ color: 'red' }}>{type}</span>)
      } else {
        styledTypes.push(<span style={{ color: 'lightgreen' }}>{type}</span>)
      }
    }
  } else {
    styledTypes.push(<span>none</span>)
  }

  return (
    <>
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

export function FloodingDebugOverlay() {
  const { floodDetails } = useSelector((state) => state.coastmix)
  const [left, right] = floodDetails

  return (
    <div className="flooding-debug-overlay">
      <h2>Flooding debug</h2>
      <p>
        Left:
        <br />
        {left === null ? 'Not a waterfront' : <Details details={left} />}
      </p>
      <p>
        Right:
        <br />
        {right === null ? 'Not a waterfront' : <Details details={right} />}
      </p>
    </div>
  )
}
