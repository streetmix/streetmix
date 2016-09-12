import React from 'react'
import Scrollable from '../ui/Scrollable'
import { createPalette } from '../segments/palette'
import { undo, redo } from '../streets/undo_stack'
// import { getElAbsolutePos } from '../util/helpers'

export default class Palette extends React.PureComponent {
  // constructor (props) {
  //   super(props)
  //
  //   this.adjustPaletteLayout = this.adjustPaletteLayout.bind(this)
  // }

  componentDidMount () {
    // We have to run this after this event in order to give images time to load.
    window.addEventListener('stmx:everything_loaded', (event) => {
      createPalette()
      // this.adjustPaletteLayout()
      // window.addEventListener('stmx:language_changed', this.adjustPaletteLayout)
    })
  }
  //
  // adjustPaletteLayout () {
  //   const commandsWidth = this.commandsEl.getBoundingClientRect().width
  //
  //   // Manually query because it is added via normal DOM methods
  //   const rightButtonEl = document.querySelector('.palette-container button.scroll-right')
  //
  //   // Reset
  //   this.paletteEl.style.right = ''
  //   // dupe from scroll.js repositionScrollButtons()
  //   rightButtonEl.style.left = (getElAbsolutePos(this.paletteEl)[0] + this.paletteEl.offsetWidth) + 'px'
  //
  //   // Only do work if palette commands has increased in width
  //   // TODO: don't hardcode magic number
  //   const delta = commandsWidth - 105 // 105 is approx what default width is
  //
  //   if (delta > 0) {
  //     const currentScrollRightButtonPos = window.parseInt(rightButtonEl.style.left, 10)
  //     const newScrollRightButtonPos = currentScrollRightButtonPos - delta
  //     rightButtonEl.style.left = newScrollRightButtonPos + 'px'
  //
  //     const paletteRightPos = window.parseInt(window.getComputedStyle(this.paletteEl).right, 10)
  //     const newPaletteRightPos = paletteRightPos + delta
  //     this.paletteEl.style.right = newPaletteRightPos + 'px'
  //   }
  // }

  render () {
    return (
      <div className='palette-container'>
        <div className='palette-trashcan' data-i18n='palette.remove'>
          Drag here to remove
        </div>
        <div className='palette-commands' ref={(ref) => { this.commandsEl = ref }}>
          <button id='undo' data-i18n='btn.undo' onClick={undo}>Undo</button>
          <button id='redo' data-i18n='btn.redo' onClick={redo}>Redo</button>
        </div>
        <Scrollable className='palette'>
          <div className='palette-canvas' />
        </Scrollable>
      </div>
    )
  }
}
