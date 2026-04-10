import { useSelector } from '~/src/store/hooks.js'
import { SlopeControlTemp } from './SlopeControlTemp.js'
import { SlopeControlPin } from './SlopeControlPin.js'

interface SlopeControlProps {
  position: number
}

export function SlopeControl({ position }: SlopeControlProps) {
  const units = useSelector((state) => state.street.units)
  const slope = useSelector((state) => {
    return state.street.segments[position].slope
  })

  return (
    <>
      <div className="popup-control-row" data-tour-id="elevation-control">
        <div className="popup-control-label" style={{ marginRight: '0.25em' }}>
          left
        </div>
        <SlopeControlTemp
          key={position}
          anchor={0}
          position={position}
          elevation={slope.values[0]}
          units={units}
        />
        <SlopeControlPin position={position} anchor={0} />
      </div>
      <div className="popup-control-row" data-tour-id="elevation-control">
        <div className="popup-control-label" style={{ marginRight: '0.25em' }}>
          right
        </div>
        <SlopeControlTemp
          key={position}
          anchor={1}
          position={position}
          elevation={slope.values[1]}
          units={units}
        />
        <SlopeControlPin position={position} anchor={1} />
      </div>
    </>
  )
}
