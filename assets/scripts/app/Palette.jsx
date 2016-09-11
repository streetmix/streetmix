import React from 'react'

export default class Palette extends React.Component {
  render () {
    return (
      <div className='palette-container'>
        <div className='palette-trashcan' data-i18n='palette.remove'>
          Drag here to remove
        </div>
        <div className='palette-commands'>
          <button id='undo' data-i18n='btn.undo'>Undo</button>
          <button id='redo' data-i18n='btn.redo'>Redo</button>
        </div>
        <div className='palette'>
          <div className='palette-canvas' />
        </div>
      </div>
    )
  }
}
