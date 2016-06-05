/**
 * debug_info
 *
 * Displays a debugging overlay that shows the current state of the application.
 *
 * @module debug_info
 * @requires keypress
 */
import _ from 'lodash'
import { getStreet } from '../streets/data_model'
import { registerKeypress, deregisterKeypress } from './keypress'
import { loseAnyFocus } from './focus'

// Register keyboard input for show (shift-D)
registerKeypress('shift d', showDebugInfo)

export function showDebugInfo () {
  /* global undoStack, settings */
  const debugStreetData = _.cloneDeep(getStreet())
  const debugUndo = _.cloneDeep(undoStack)
  const debugSettings = _.cloneDeep(settings)
  const debugEl = document.querySelector('#debug')
  const textEl = debugEl.querySelector('textarea')

  // Some things just shouldn't be seen...
  for (let i in debugStreetData.segments) {
    delete debugStreetData.segments[i].el
  }

  for (let j in debugUndo) {
    for (let k in debugUndo[j].segments) {
      delete debugUndo[j].segments[k].el
    }
  }

  // Create a JSON object, this parses better in editors
  const debugObj = {
    'DATA': debugStreetData,
    'SETTINGS': debugSettings,
    'UNDO': debugUndo
  }

  debugEl.classList.add('visible')
  textEl.innerHTML = JSON.stringify(debugObj, null, 2)
  textEl.focus()
  textEl.select()

  // Prevent scrolling to bottom of textarea after select
  setTimeout(function () {
    textEl.scrollTop = 0
  }, 0)

  // Set up keypress listener to close debug window
  registerKeypress('esc', hideDebugInfo)
  // TODO: Register mouse inputs for hide
}

export function hideDebugInfo () {
  document.querySelector('#debug').classList.remove('visible')
  loseAnyFocus()

  // Remove keypress listener
  deregisterKeypress('esc', hideDebugInfo)
}
