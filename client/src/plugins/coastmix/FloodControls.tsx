import React from 'react'

import { useSelector, useDispatch } from '~/src/store/hooks'
import {
  hideCoastmixControls,
  setSeaLevelRise,
  setStormSurge
} from '~/src/store/slices/coastmix'
import Button from '~/src/ui/Button'
import Switch from '~/src/ui/Switch'
import FloatingPanel from '~/src/ui/FloatingPanel'
import './FloodControls.css'

function FloodControls (): React.ReactElement | null {
  const { controlsVisible, seaLevelRise, stormSurge } = useSelector(
    (state) => state.coastmix
  )

  const dispatch = useDispatch()

  function handleClose (): void {
    dispatch(hideCoastmixControls())
  }

  function changeSeaLevelRise (x: number): void {
    dispatch(setSeaLevelRise(x))
  }

  return (
    <FloatingPanel
      icon="boat"
      title="Flood controls"
      show={controlsVisible}
      className="coastmix-controls"
      handleClose={handleClose}
    >
      <div className="flood-controls-content">
        <div className="info-bubble-control-row">
          <div className="info-bubble-control-label">Sea level rise</div>
          <div className="variants">
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
        <div
          className="info-bubble-control-row"
          style={{ marginTop: '0.75em' }}
        >
          <div className="info-bubble-control-label">Storm surge</div>
          <div className="variants">
            <Switch
              onCheckedChange={(checked) => {
                dispatch(setStormSurge(checked))
              }}
              checked={stormSurge}
            />
          </div>
        </div>
      </div>
    </FloatingPanel>
  )
}

export default FloodControls
