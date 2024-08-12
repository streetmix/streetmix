import React from 'react'

import { useSelector } from '../store/hooks'
import PaletteItems from './PaletteItems'
import PaletteTrashcan from './PaletteTrashcan'
import EnvironmentButton from './EnvironmentButton'
import UndoRedo from './UndoRedo'
import './PaletteContainer.css'

function PaletteContainer (): React.ReactElement | null {
  const readOnly = useSelector((state) => state.app.readOnly)
  const everythingLoaded = useSelector((state) => state.app.everythingLoaded)

  // Do not render the palette if app is in read-only mode
  if (readOnly) return null

  return (
    <div className="palette-container-outer">
      <div className="palette-container">
        <div className="palette-commands palette-commands-left">
          <EnvironmentButton />
        </div>
        {everythingLoaded && <PaletteItems />}
        <div className="palette-commands palette-commands-right">
          <UndoRedo />
        </div>
        <PaletteTrashcan />
      </div>
    </div>
  )
}

export default PaletteContainer
