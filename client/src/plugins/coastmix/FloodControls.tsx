import React from 'react'

import { useSelector, useDispatch } from '~/src/store/hooks'
import {
  hideCoastmixControls,
  setSeaLevelRise
} from '~/src/store/slices/coastmix'
import Button from '~/src/ui/Button'
import FloatingPanel from '~/src/ui/FloatingPanel'
import './FloodControls.css'

function FloodControls (): React.ReactElement | null {
  const show = useSelector((state) => state.coastmix.controlsVisible)
  const seaLevelRise = useSelector((state) => state.coastmix.seaLevelRise)

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
      show={show}
      className="coastmix-controls"
      handleClose={handleClose}
    >
      <div className="flood-controls-content">
        <div className="info-bubble-control-row">
          <div className="info-bubble-control-label">Sea level rise</div>
          <div className="variants">
            <Button
              className="sea-level-button"
              onClick={() => {
                changeSeaLevelRise(0)
              }}
            >
              Current
            </Button>
            <Button
              className="sea-level-button"
              onClick={() => {
                changeSeaLevelRise(2030)
              }}
            >
              2030
            </Button>
            <Button
              className="sea-level-button"
              onClick={() => {
                changeSeaLevelRise(2050)
              }}
            >
              2050
            </Button>
            <Button
              className="sea-level-button"
              onClick={() => {
                changeSeaLevelRise(2070)
              }}
            >
              2070
            </Button>
          </div>
        </div>
      </div>
    </FloatingPanel>
  )
}

export default FloodControls
