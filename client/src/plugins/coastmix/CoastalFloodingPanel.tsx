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
import { TutorialPopover } from '~/src/ui/TutorialPopover.js'
import './CoastalFloodingPanel.css'

import type { FloodDirection } from '@streetmix/types'

export function CoastalFloodingPanel() {
  const coastmix = useSelector((state) => state.coastmix)
  const tutorialStep = useSelector((state) => state.app.tutorialStep)
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
      show={tutorialStep !== 1 && controlsVisible}
      className="coastmix-controls"
      handleClose={handleClose}
      position={{ x: 30, y: 65 }}
    >
      <div className="popup-controls flood-controls-content">
        <div className="popup-control-group">
          <div className="popup-control-label">Sea level rise</div>
          <TutorialPopover
            isOpen={tutorialStep === 3}
            label={`Sea level rise is a permanent rise in ocean height relative to land due to
melting glaciers and thermal expansion. As sea levels rise over time, we
must design for near- and long-term flood risk. We can block flooding
by strategically elevating parts of a coastal area to reach a target Design
Flood Elevation (DFE) based on sea level rise projections. In Coastmix,
you can design for the current sea level or the future sea level expected in
2030, 2050, and 2070.`}
            placement="right"
          >
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
          </TutorialPopover>
        </div>
        <div className="popup-control-group">
          <div className="popup-control-label">Storm surge</div>
          <TutorialPopover
            isOpen={tutorialStep === 4}
            label={`When a coastal storm occurs, strong winds push water onto land near
the coast. This temporarily raises sea levels above normal and can cause
significant flood damage. It is important to factor in storm surge on top
of higher average sea levels when we design ways to adapt to coastal
flooding. In Coastmix, you can toggle on the Storm Surge feature to add
additional water height on top of the current and future sea level rise
time horizons.`}
            placement="right"
          >
            <Switch onCheckedChange={toggleStormSurge} checked={stormSurge} />
          </TutorialPopover>
        </div>
        <div className="popup-control-group">
          <div className="popup-control-label">Flood direction</div>
          <TutorialPopover
            isOpen={tutorialStep === 5}
            label={`In Coastmix, you can choose which direction the flooding comes from
based on how you design your waterfront and where the coast is located.
This feature will react when you build something high enough to block
flood waters.`}
            placement="right"
          >
            <div>
              <select value={floodDirection} onChange={changeFloodDirection}>
                <option value="none">None</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                {/* <option value="both">Both</option> */}
              </select>
            </div>
          </TutorialPopover>
        </div>
        <div className={messageClassNames.join(' ')}>{message}</div>
      </div>
    </FloatingPanel>
  )
}
