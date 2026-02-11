import { useEffect } from 'react'

import { useSelector, useDispatch } from '~/src/store/hooks.js'
import {
  hideCoastalFloodingPanel,
  setSeaLevelRise,
  setStormSurge,
  setFloodDirection,
} from '~/src/store/slices/coastmix.js'
import { segmentsChanged } from '~/src/store/actions/street.js'
import { setWeather } from '~/src/store/slices/street.js'
import { Button } from '~/src/ui/Button.js'
import { Switch } from '~/src/ui/Switch.js'
import { FloatingPanel } from '~/src/ui/FloatingPanel.js'
import './CoastalFloodingPanel.css'

import type { FloodDirection } from '@streetmix/types'

export function CoastalFloodingPanel() {
  const coastmix = useSelector((state) => state.coastmix)
  const dispatch = useDispatch()

  const {
    controlsVisible,
    seaLevelRise,
    floodDirection,
    floodDistance,
    stormSurge,
  } = coastmix

  function handleClose(): void {
    dispatch(hideCoastalFloodingPanel())
  }

  function changeSeaLevelRise(x: number): void {
    dispatch(setSeaLevelRise(x))
  }

  function changeFloodDirection(
    event: React.ChangeEvent<HTMLSelectElement>
  ): void {
    dispatch(setFloodDirection(event.target.value as FloodDirection))
  }

  function toggleStormSurge(checked: boolean): void {
    dispatch(setStormSurge(checked))
    if (checked) {
      dispatch(setWeather('rain'))
    } else {
      dispatch(setWeather(null))
    }
  }

  // Updates state and saves to server
  useEffect(() => {
    dispatch(segmentsChanged(true))
  }, [floodDirection, seaLevelRise, stormSurge, dispatch])

  let message
  const messageClassNames = ['flood-controls-message']
  if (seaLevelRise === 0) {
    message = '👉 Select a sea level rise target to visualize flooding.'
  } else if (floodDirection === 'none') {
    message = '👉 Select a flooding direction.'
  } else {
    if (floodDistance === null) {
      message = '❌ This scenario does not address sea level rise!'
      messageClassNames.push('flood-controls-warning')
    } else {
      message = '✅ This scenario is addressing sea level rise!'
      messageClassNames.push('flood-controls-success')
    }
  }

  return (
    <FloatingPanel
      icon="boat"
      title="Coastal flooding"
      show={controlsVisible}
      className="coastmix-controls"
      handleClose={handleClose}
      position={{ x: 30, y: 65 }}
    >
      <div className="popup-controls flood-controls-content">
        <div className="popup-control-group">
          <div className="popup-control-label">Sea level rise</div>
          <div>
            <Button
              className={`sea-level-button${seaLevelRise === 0 ? ' sea-level-selected' : ''}`}
              onClick={() => {
                changeSeaLevelRise(0)
              }}
            >
              Current
            </Button>
            <Button
              className={`sea-level-button${seaLevelRise === 2030 ? ' sea-level-selected' : ''}`}
              onClick={() => {
                changeSeaLevelRise(2030)
              }}
            >
              2030
            </Button>
            <Button
              className={`sea-level-button${seaLevelRise === 2050 ? ' sea-level-selected' : ''}`}
              onClick={() => {
                changeSeaLevelRise(2050)
              }}
            >
              2050
            </Button>
            <Button
              className={`sea-level-button${seaLevelRise === 2070 ? ' sea-level-selected' : ''}`}
              onClick={() => {
                changeSeaLevelRise(2070)
              }}
            >
              2070
            </Button>
          </div>
        </div>
        <div className="popup-control-group">
          <div className="popup-control-label">Storm surge</div>
          <Switch onCheckedChange={toggleStormSurge} checked={stormSurge} />
        </div>
        <div className="popup-control-group">
          <div className="popup-control-label">Flood direction</div>
          <div>
            <select value={floodDirection} onChange={changeFloodDirection}>
              <option value="none">None</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              {/* <option value="both">Both</option> */}
            </select>
          </div>
        </div>
        <div className={messageClassNames.join(' ')}>{message}</div>
      </div>
    </FloatingPanel>
  )
}
