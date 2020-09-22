import React from 'react'
import { useSelector } from 'react-redux'
import PaletteItems from './PaletteItems'
import PaletteTrashcan from './PaletteTrashcan'
import EnvironmentButton from './EnvironmentButton'
import UndoRedo from './UndoRedo'
import './PaletteContainer.scss'

function PaletteContainer (props) {
  const everythingLoaded = useSelector((state) => state.app.everythingLoaded)

  // Render an empty container before assets for palette items have loaded.
  // (Another part of the app depends on this element for layout calculation.)
  if (!everythingLoaded) {
    return <div className="palette-container" />
  }

  return (
    <div className="palette-container">
      <div className="palette-commands palette-commands-left">
        <EnvironmentButton />
      </div>
      <PaletteItems />
      <div className="palette-commands palette-commands-right">
        <UndoRedo />
      </div>
      <PaletteTrashcan />
    </div>
  )
}

export default PaletteContainer
