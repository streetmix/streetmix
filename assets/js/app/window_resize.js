var streetSectionCanvasLeft
var streetSectionTop

function _onResize () {
  system.viewportWidth = window.innerWidth
  system.viewportHeight = window.innerHeight

  var streetSectionHeight =
  document.querySelector('#street-section-inner').offsetHeight

  var paletteTop =
  document.querySelector('#main-screen > footer').offsetTop || system.viewportHeight

  // TODO const
  if (system.viewportHeight - streetSectionHeight > 450) {
    streetSectionTop =
      (system.viewportHeight - streetSectionHeight - 450) / 2 + 450 + 80
  } else {
    streetSectionTop = system.viewportHeight - streetSectionHeight + 70
  }

  if (readOnly) {
    streetSectionTop += 80
  }

  // TODO const
  if (streetSectionTop + document.querySelector('#street-section-inner').offsetHeight >
    paletteTop - 20 + 180) { // gallery height
    streetSectionTop = paletteTop - 20 - streetSectionHeight + 180
  }

  _updateGalleryShield()

  document.querySelector('#street-section-inner').style.top = streetSectionTop + 'px'

  document.querySelector('#street-section-sky').style.top =
    (streetSectionTop * .8) + 'px'

  document.querySelector('#street-scroll-indicator-left').style.top =
    (streetSectionTop + streetSectionHeight) + 'px'
  document.querySelector('#street-scroll-indicator-right').style.top =
    (streetSectionTop + streetSectionHeight) + 'px'

  var streetSectionDirtPos = system.viewportHeight - streetSectionTop - 400 + 180

  document.querySelector('#street-section-dirt').style.height =
    streetSectionDirtPos + 'px'

  var skyTop = streetSectionTop
  if (skyTop < 0) {
    skyTop = 0
  }
  document.querySelector('#street-section-sky').style.paddingTop = skyTop + 'px'
  document.querySelector('#street-section-sky').style.marginTop = -skyTop + 'px'

  streetSectionCanvasLeft =
    ((system.viewportWidth - street.width * TILE_SIZE) / 2) - BUILDING_SPACE
  if (streetSectionCanvasLeft < 0) {
    streetSectionCanvasLeft = 0
  }
  document.querySelector('#street-section-canvas').style.left =
    streetSectionCanvasLeft + 'px'

  document.querySelector('#street-section-editable').style.width =
    (street.width * TILE_SIZE) + 'px'

  _resizeStreetName()

  _infoBubble.show(true)
  _updateScrollButtons()

  _updateBuildingPosition()
  // TODO hack
  _createBuildings()

  _updateStreetNameCanvasPos()
  _updateStreetScrollIndicators()
}
