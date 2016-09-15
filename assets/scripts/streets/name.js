import { msg } from '../app/messages'
import { updatePageTitle } from '../app/page_title'
import { updatePageUrl } from '../app/page_url'
import { app } from '../preinit/app_settings'
import { getElAbsolutePos } from '../util/helpers'
import { getStreet, saveStreetToServerIfNecessary } from './data_model'
import { updateStreetMetadata } from './metadata'
import { StreetName, normalizeStreetName } from './name_sign'
import { unifyUndoStack } from './undo_stack'

// Reference to the main street name instance
let streetName

export function attachStreetNameEventListeners () {
  // Add window listeners to resize and reposition the street name when it resizes
  // Only do this after everything is loaded because you don't want to
  // fire it before the street name is ready
  window.addEventListener('stmx:everything_loaded', function (e) {
    window.addEventListener('resize', (e) => {
      resizeStreetName()
      updateStreetNameCanvasPos()
    })
  })

  // Add prompt event to main street name
  if (!app.readOnly) {
    const streetNameEl = document.getElementById('street-name')
    streetNameEl.addEventListener('pointerdown', askForStreetName)
  }
}

// This is called everywhere.
// TODO: Create a specific init / create function?
// TODO: Updating the street name as a response to events?
export function updateStreetName () {
  const streetNameEl = document.getElementById('street-name')
  let street = getStreet()
  streetName = new StreetName(streetNameEl, street.name)
  streetName.text = street.name

  resizeStreetName()

  updateStreetMetadata(street)
  updateStreetNameCanvasPos()

  unifyUndoStack()
  updatePageUrl()
  updatePageTitle()
}

function askForStreetName () {
  let street = getStreet()
  const newName = window.prompt(msg('PROMPT_NEW_STREET_NAME'), street.name)

  if (newName) {
    street.name = normalizeStreetName(newName)

    updateStreetName()
    updateStreetNameCanvasPos()

    saveStreetToServerIfNecessary()
  }
}

function resizeStreetName () {
  const streetNameCanvasEl = document.getElementById('street-name-canvas')
  const streetNameCanvasWidth = streetNameCanvasEl.offsetWidth
  const streetNameWidth = streetName.textEl.scrollWidth

  if (streetNameWidth > streetNameCanvasWidth) {
    streetName.el.style.width = streetNameCanvasWidth + 'px'
  } else {
    streetName.el.style.width = 'auto'
  }
}

function updateStreetNameCanvasPos () {
  const streetNameCanvasEl = document.getElementById('street-name-canvas')
  const streetNameEl = document.getElementById('street-name')
  const menuEl = document.querySelector('.menu-bar-right')
  const menuElPos = getElAbsolutePos(menuEl)
  const streetNameElPos = getElAbsolutePos(streetName.el)

  streetNameCanvasEl.classList.add('no-movement')
  if (streetNameElPos[0] + streetNameEl.offsetWidth > menuElPos[0]) {
    streetNameCanvasEl.classList.add('move-down-for-menu')
  } else {
    streetNameCanvasEl.classList.remove('move-down-for-menu')
  }

  window.setTimeout(function () {
    streetNameCanvasEl.classList.remove('no-movement')
  }, 50)
}

