/* global street, msg */

var StreetName = (function () {
  /* global DEFAULT_NAME */

  // Output using cmap2file as per
  // http://www.typophile.com/node/64147#comment-380776
  var STREET_NAME_FONT_GLYPHS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĆćĈĉĊċČčĎďĒĔĕĖėĜĝĞğĠġĤĥĨĩĪīĬĭİıĴĵĹĺĽľŁłŃŇňŌōŎŏŐőŒœŔŕŘřŚśŜŝŞşŠšŤťŨũŪūŬŭŮůŰűŴŵŶŷŸŹźŻżŽžƒˆˇ˘˙˚˛˜˝–—‘’‚“”„†‡•…‰‹›⁄€™−'
  var MAX_STREET_NAME_WIDTH = 50

  /*
   *  Creates a StreetName object given a containing element
   *  and an optional street name.
   *
   *  @constructor
   *  @param {element} el - Reference to the street name DOM element.
   *  @param {string} [name] - Name of the street to display.
   */
  var StreetName = function (el, name) {
    this.el = el
    this.textEl = _constructTextElement(el)

    Object.defineProperty(this, 'text', {
      /*
       *  Gets the display name currently set inside the element
       *  (in case an external script modifies DOM directly)
       */
      get: function () {
        return this.textEl.textContent
      },
      /*
       *  Sets the display name inside the street name element
       *  This affects display only, not the street's raw data
       */
      set: function (value) {
        var name = this.normalize(value)
        this.name = name
        this.textEl.textContent = name
        this.updateFont()
      }
    })

    // Set the name of the street, if given
    this.text = name || DEFAULT_NAME
  }

  /*
   *  Check if street name requires a Unicode font to render correctly
   *
   *  @public
   *  @params {string} name - Street name to check
   */
  StreetName.prototype.updateFont = function () {
    var needUnicodeFont = this.needsUnicodeFont(this.name)

    if (!needUnicodeFont) {
      this.el.classList.remove('fallback-unicode-font')
    } else {
      this.el.classList.add('fallback-unicode-font')
    }
  }

  /*
   *  Check if street name requires a Unicode font to render correctly
   *
   *  @static
   *  @params {string} name - Street name to check
   */
  StreetName.prototype.needsUnicodeFont = function (name) {
    var needUnicodeFont = false

    for (var i in name) {
      if (STREET_NAME_FONT_GLYPHS.indexOf(name.charAt(i)) === -1) {
        needUnicodeFont = true
        break
      }
    }

    return needUnicodeFont
  }

  /*
   *  Some processing needed to display street name
   *
   *  @static
   *  @params {string} name - Street name to check
   */
  StreetName.prototype.normalize = function (name) {
    name = name.trim()

    if (name.length > MAX_STREET_NAME_WIDTH) {
      name = name.substr(0, MAX_STREET_NAME_WIDTH) + '…'
    }

    return name
  }


  /*
   *  Builds the element where the text will be stored
   *  Returns a reference to that element
   *
   *  @private
   */
  _constructTextElement = function (containerEl) {
    var textEl

    // Construct an element for the text name
    if (containerEl.nodeName === 'SPAN') {
      textEl = document.createElement('span')
    } else {
      textEl = document.createElement('div')
    }

    textEl.className = 'street-name-text'

    // Clear container element then append
    containerEl.innerHTML = '' // TODO: replace with something less expensive
    containerEl.appendChild(textEl)

    // Return a reference to the constructed element
    return textEl
  }

  return StreetName

})()

// TODO: The following are only for the main street name
// This should be treated separately and not included on the
// generic street name class.

function _updateStreetName () {
  var streetName = new StreetName(document.getElementById('street-name'), street.name)

  _resizeStreetName()

  _updateStreetMetadata()
  _updateStreetNameCanvasPos()

  _unifyUndoStack()
  _updatePageUrl()
  _updatePageTitle()
}

function _askForStreetName () {
  _ignoreWindowFocusMomentarily()

  var newName = prompt(msg('PROMPT_NEW_STREET_NAME'), street.name)

  if (newName) {
    street.name = StreetName.prototype.normalize(newName)

    _updateStreetName()
    _saveStreetToServerIfNecessary()
    _updateStreetNameCanvasPos()
  }
}

function _resizeStreetName () {
  var streetNameCanvasWidth = document.querySelector('#street-name-canvas').offsetWidth
  var streetName = document.querySelector('#street-name > .street-name-text')
  // Sometimes this function is called before .street-name-text exists
  var streetNameWidth = (streetName) ? streetName.scrollWidth : 0

  if (streetNameWidth > streetNameCanvasWidth) {
    document.querySelector('#street-name').style.width = streetNameCanvasWidth + 'px'
  } else {
    document.querySelector('#street-name').style.width = 'auto'
  }
}

function _updateStreetNameCanvasPos () {
  var menuEl = document.querySelector('.menu-bar-right')
  var menuElPos = _getElAbsolutePos(menuEl)

  var streetNameEl = document.querySelector('#street-name')
  var streetNameElPos = _getElAbsolutePos(streetNameEl)

  document.querySelector('#street-name-canvas').classList.add('no-movement')
  if (streetNameElPos[0] + streetNameEl.offsetWidth > menuElPos[0]) {
    document.querySelector('#street-name-canvas').classList.add('move-down-for-menu')
  } else {
    document.querySelector('#street-name-canvas').classList.remove('move-down-for-menu')
  }

  window.setTimeout(function () {
    document.querySelector('#street-name-canvas').classList.remove('no-movement')
  }, 50)
}
