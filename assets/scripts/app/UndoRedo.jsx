import React from 'react'
import { undo, redo } from '../streets/undo_stack'
import { t } from '../app/locale'

export default class UndoRedo extends React.PureComponent {
  render () {
    return (
      <React.Fragment>
        <button id="undo" onClick={undo}>{t('btn.undo', 'Undo')}</button>
        <button id="redo" onClick={redo}>{t('btn.redo', 'Redo')}</button>
      </React.Fragment>
    )
  }
}
