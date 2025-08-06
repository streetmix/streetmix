import React from 'react'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { hideCoastmixControls } from '~/src/store/slices/coastmix'
import FloatingPanel from '~/src/ui/FloatingPanel'
import './CoastmixControls.css'

function CoastmixControls (): React.ReactElement | null {
  const show = useSelector((state) => state.coastmix.controlsVisible)
  const waterLevel = useSelector((state) => state.coastmix.waterLevel)

  const dispatch = useDispatch()

  function handleClose (): void {
    dispatch(hideCoastmixControls())
  }

  return (
    <FloatingPanel
      icon="boat"
      title="Coastmix controls"
      show={show}
      className="coastmix-controls"
      handleClose={handleClose}
    >
      <button>Coastmix</button>
    </FloatingPanel>
  )
}

export default CoastmixControls
