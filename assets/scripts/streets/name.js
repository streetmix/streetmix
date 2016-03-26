/* global street, app */
/* global _unifyUndoStack, _updatePageUrl, _saveStreetToServerIfNecessary */

import { msg } from '../app/messages'
import { updatePageTitle } from '../app/page_title'
import { getElAbsolutePos } from '../util/helpers'
import { updateStreetMetadata } from './metadata'

// Output using cmap2file as per
// http://www.typophile.com/node/64147#comment-380776
const STREET_NAME_FONT_GLYPHS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĆćĈĉĊċČčĎďĒĔĕĖėĜĝĞğĠġĤĥĨĩĪīĬĭİıĴĵĹĺĽľŁłŃŇňŌōŎŏŐőŒœŔŕŘřŚśŜŝŞşŠšŤťŨũŪūŬŭŮůŰűŴŵŶŷŸŹźŻżŽžƒˆˇ˘˙˚˛˜˝–—‘’‚“”„†‡•…‰‹›⁄€™−'
const MAX_STREET_NAME_WIDTH = 50

/**
 * Creates a StreetName object given a containing element
 * and an optional street name.
 *
 * @constructor
 * @param {element} el - Reference to the street name DOM element.
 * @param {string} [name] - Name of the street to display.
 */
export class StreetName {
  constructor (el, name = '') {
    this.el = el
    this.textEl = constructTextElement(el)

    // Set the name of the street, if given
    this.text = name
  }

  /**
   * Gets the display name currently set inside the element
   * (in case an external script modifies DOM directly)
   */
  get text () {
    return this.textEl.textContent
  }

  /**
   * Sets the display name inside the street name element
   * This affects display only, not the street's raw data
   */
  set text (value) {
    let name = normalizeStreetName(value)
    this.name = name
    this.textEl.textContent = name
    this.updateFont()
  }

  /**
   * Check if street name requires a Unicode font to render correctly
   *
   * @public
   * @params {string} name - Street name to check
   */
  updateFont () {
    let needUnicodeFont = this.needsUnicodeFont(this.name)

    if (!needUnicodeFont) {
      this.el.classList.remove('fallback-unicode-font')
    } else {
      this.el.classList.add('fallback-unicode-font')
    }
  }

  /**
   * Check if street name requires a Unicode font to render correctly
   *
   * @static
   * @params {string} name - Street name to check
   */
  needsUnicodeFont (name) {
    let needUnicodeFont = false

    for (let character of name) {
      if (STREET_NAME_FONT_GLYPHS.indexOf(character) === -1) {
        needUnicodeFont = true
        break
      }
    }

    return needUnicodeFont
  }
}

/**
 * Some processing needed to display street name
 *
 * @private
 * @params {string} name - Street name to check
 */
function normalizeStreetName (name) {
  name = name.trim()

  if (name.length > MAX_STREET_NAME_WIDTH) {
    name = name.substr(0, MAX_STREET_NAME_WIDTH) + '…'
  }

  return name
}

/**
 * Builds the element where the text will be stored
 * Returns a reference to that element
 *
 * @private
 */
function constructTextElement (containerEl) {
  let textEl

  // Construct an element for the text name
  if (containerEl.nodeName === 'SPAN') {
    textEl = document.createElement('span')
  } else {
    textEl = document.createElement('div')
  }

  textEl.className = 'street-name-text'

  // Clear container element then append
  containerEl.innerHTML = ''
  containerEl.appendChild(textEl)

  // Return a reference to the constructed element
  return textEl
}

// The following are only for the main street name
// We can cache selectors outside the functions here.
const streetNameCanvasEl = document.getElementById('street-name-canvas')
const streetNameEl = document.getElementById('street-name')

// Reference to the main street name instance
let streetName

// This is called everywhere.
// TODO: Create a specific init / create function?
// TODO: Updating the street name as a response to events?
export function updateStreetName () {
  streetName = new StreetName(streetNameEl, street.name)
  streetName.text = street.name

  resizeStreetName()

  updateStreetMetadata(street)
  updateStreetNameCanvasPos()

  _unifyUndoStack()
  _updatePageUrl()
  updatePageTitle()
}

function askForStreetName () {
  const newName = window.prompt(msg('PROMPT_NEW_STREET_NAME'), street.name)

  if (newName) {
    street.name = normalizeStreetName(newName)

    updateStreetName()
    updateStreetNameCanvasPos()

    _saveStreetToServerIfNecessary()
  }
}

function resizeStreetName () {
  const streetNameCanvasWidth = streetNameCanvasEl.offsetWidth
  const streetNameWidth = streetName.textEl.scrollWidth

  if (streetNameWidth > streetNameCanvasWidth) {
    streetName.el.style.width = streetNameCanvasWidth + 'px'
  } else {
    streetName.el.style.width = 'auto'
  }
}

function updateStreetNameCanvasPos () {
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

// Add window listeners to resize and reposition the street name when it resizes
window.addEventListener('resize', (e) => {
  resizeStreetName()
  updateStreetNameCanvasPos()
})

// Add prompt event to main street name
if (!app.readOnly) {
  streetNameEl.addEventListener('pointerdown', askForStreetName)
}

