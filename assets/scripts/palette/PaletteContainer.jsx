import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import UndoRedo from './UndoRedo'
import Palette from './Palette'
import PaletteTooltips from './PaletteTooltips'
import PaletteTrashcan from './PaletteTrashcan'
import PaletteCommandsLeft from './PaletteCommandsLeft'
import './PaletteContainer.scss'

function PaletteContainer (props) {
  const everythingLoaded = useSelector((state) => state.app.everythingLoaded)
  const draggingState = useSelector((state) => state.ui.draggingState)
  const [tooltip, setTooltip] = useState({
    label: null,
    visible: false,
    position: {}
  })

  // Prevent tooltips from displaying during a drag action
  useEffect(() => {
    if (draggingState) {
      setTooltip((state) => ({
        ...state,
        visible: false
      }))
    }
  }, [draggingState])

  /**
   * Each segment in palette calls this function when the pointer hovers over it so we know
   * what to display in the tooltip
   *
   * @param {Object} event - event handler object
   * @param {string} label - text to display inside the tooltip
   * @param {Object} rect - result of getBoundingClientRect() on segment element
   */
  function onPointerOver (event, label, rect) {
    // x is the position right above the middle of the segment element to point at
    const x = rect.x + rect.width / 2

    setTooltip({
      label: label,
      visible: true,
      position: { x }
    })
  }

  /**
   * When the pointer leaves the segment area, hide tooltip.
   */
  function onPointerOut (event) {
    setTooltip({
      ...tooltip,
      visible: false
    })
  }

  /**
   * When the segment area is being scrolled, hide tooltip.
   */
  function onScroll (event) {
    setTooltip({
      ...tooltip,
      visible: false
    })
  }

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
      <Palette
        handlePointerOver={onPointerOver}
        handlePointerOut={onPointerOut}
        handleScroll={onScroll}
      />
      <PaletteTooltips
        label={tooltip.label}
        visible={tooltip.visible}
        pointAt={tooltip.position}
      />
    </div>
  )
}

export default PaletteContainer
