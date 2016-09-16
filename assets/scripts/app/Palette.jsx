import React from 'react'
import Scrollable from '../ui/Scrollable'
import { createPalette } from '../segments/palette'
import { undo, redo } from '../streets/undo_stack'

export default class Palette extends React.PureComponent {
  constructor (props) {
    super(props)

    this.setScrollableRef = this.setScrollableRef.bind(this)
    this.adjustPaletteLayout = this.adjustPaletteLayout.bind(this)
  }

  componentDidMount () {
    // We have to run this after this event in order to give images time to load.
    window.addEventListener('stmx:everything_loaded', (event) => {
      createPalette()
      this.adjustPaletteLayout()
      window.addEventListener('stmx:language_changed', this.adjustPaletteLayout)
    })
  }

  setScrollableRef (ref) {
    this.paletteEl = ref
  }

  adjustPaletteLayout () {
    const commandsWidth = this.commandsEl.getBoundingClientRect().width

    // Only do work if palette commands has increased in width
    // TODO: don't hardcode magic number
    const delta = commandsWidth - 105 // 105 is approx what default width is

    // Reset palette right position
    this.paletteEl.style.right = ''

    if (delta > 0) {
      const paletteRightPos = window.parseInt(window.getComputedStyle(this.paletteEl).right, 10)
      const newPaletteRightPos = paletteRightPos + delta
      this.paletteEl.style.right = newPaletteRightPos + 'px'
    }
  }

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
        <Scrollable className='palette' setRef={this.setScrollableRef}>
          <div className='palette-canvas' />
        </Scrollable>
      </div>
    )
  }
}
