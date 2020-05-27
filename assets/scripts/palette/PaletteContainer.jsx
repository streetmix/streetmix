import React from 'react'
import { useSelector } from 'react-redux'
import UndoRedo from './UndoRedo'
import Palette from './Palette'
import PaletteTrashcan from './PaletteTrashcan'
import PaletteCommandsLeft from './PaletteCommandsLeft'
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
      <PaletteCommandsLeft />
      <PaletteTrashcan />
      <div className="palette-commands">
        <UndoRedo />
      </div>
      <Palette />
    </div>
  )
}

export default PaletteContainer
