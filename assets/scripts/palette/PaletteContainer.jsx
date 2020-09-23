import React from 'react'
import { useSelector } from 'react-redux'
import PaletteItems from './PaletteItems'
import PaletteTrashcan from './PaletteTrashcan'
import EnvironmentButton from './EnvironmentButton'
import UndoRedo from './UndoRedo'
import './PaletteContainer.scss'

// NOTE: The "palette-container" div element is used to recalculate layout
// inside the global window resize handler. If you rename the element, you
// must also update the querySelector in that handler. Also, please do not
// introduce logic that conditionally renders the palette during app usage,
// as it will not call the resize handler to update layout positioning.
function PaletteContainer (props) {
  const readOnly = useSelector((state) => state.app.readOnly)
  const everythingLoaded = useSelector((state) => state.app.everythingLoaded)

  // Do not render the palette if app is in read-only mode
  if (readOnly) return null

  return (
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
  )
}

export default PaletteContainer
