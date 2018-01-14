import React from 'react'
import Scrollable from '../ui/Scrollable'
import { createPalette } from '../segments/palette'
import { undo, redo } from '../streets/undo_stack'
import { t } from '../app/locale'
import { emptyEl } from '../util/dom_helpers'

export default class Palette extends React.PureComponent {
  componentDidMount () {
    let runOnce = 0
    // We have to run this after this event in order to give images time to load.
    window.addEventListener('stmx:everything_loaded', (event) => {
      if (runOnce) return
      createPalette()
      this.adjustPaletteLayout()
      window.addEventListener('stmx:language_changed', this.onLocaleChange)
      window.addEventListener('stmx:force_palette_redraw', this.onForceRedraw)
      runOnce = 1
    })
  }

  onLocaleChange = () => {
    this.forceUpdate() // Forces translated text to re-render
    this.adjustPaletteLayout()
  }

  // Todo: remove this method (and the paletteXEl ref) after palette contents are drawn via React
  onForceRedraw = () => {
    if (this.paletteXEl) {
      emptyEl(this.paletteXEl)
    }
    createPalette()
    this.adjustPaletteLayout()
  }

  setScrollableRef = (ref) => {
    this.paletteEl = ref
  }

  adjustPaletteLayout = () => {
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

    // Check button visibility state by calling this method on the Scrollable
    // component directly.
    this.scrollable.checkButtonVisibilityState()
  }

  render () {
    return (
      <div className="palette-container">
        <div className="palette-trashcan">
          {t('palette.remove', 'Drag here to remove')}
        </div>
        <div className="palette-commands" ref={(ref) => { this.commandsEl = ref }}>
          <button id="undo" onClick={undo}>{t('btn.undo', 'Undo')}</button>
          <button id="redo" onClick={redo}>{t('btn.redo', 'Redo')}</button>
        </div>
        <Scrollable className="palette" setRef={this.setScrollableRef} ref={(ref) => { this.scrollable = ref }}>
          <div className="palette-canvas" ref={(ref) => { this.paletteXEl = ref }} />
        </Scrollable>
      </div>
    )
  }
}
