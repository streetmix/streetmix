import { infoBubble } from '../info_bubble/info_bubble'
import { app } from '../preinit/app_settings'
import { system } from '../preinit/system_capabilities'
import { BUILDING_SPACE } from '../segments/buildings'
import { TILE_SIZE } from '../segments/view'
import store from '../store'
import { windowResize } from '../store/actions/system'

let streetSectionTop

export function getStreetSectionTop () {
  return streetSectionTop
}

export function onResize () {
  store.dispatch(windowResize(window.innerWidth, window.innerHeight))
  system.viewportWidth = window.innerWidth
  system.viewportHeight = window.innerHeight

  var streetSectionHeight =
  document.querySelector('#street-section-inner').offsetHeight

  var paletteTop =
  document.querySelector('.palette-container').offsetTop || system.viewportHeight

  // TODO const
  if (system.viewportHeight - streetSectionHeight > 450) {
    streetSectionTop =
      ((system.viewportHeight - streetSectionHeight - 450) / 2) + 450 + 80
  } else {
    streetSectionTop = system.viewportHeight - streetSectionHeight + 70
  }

  if (app.readOnly) {
    streetSectionTop += 80
  }

  // TODO const
  if (streetSectionTop + document.querySelector('#street-section-inner').offsetHeight >
    paletteTop - 20 + 180) { // gallery height
    streetSectionTop = paletteTop - 20 - streetSectionHeight + 180
  }

  var streetSectionDirtPos = system.viewportHeight - streetSectionTop - 400 + 180

  document.querySelector('#street-section-dirt').style.height =
    streetSectionDirtPos + 'px'

  // The following lines were removed in 7f6ea939fd50c6bcb7cb31200cfd1888f31550a9
  // but it caused the drag/drop of elements to not work anymore.
  const street = store.getState().street

  streetSectionCanvasLeft =
    ((system.viewportWidth - (street.width * TILE_SIZE)) / 2) - BUILDING_SPACE
  if (streetSectionCanvasLeft < 0) {
    streetSectionCanvasLeft = 0
  }
  document.querySelector('#street-section-canvas').style.left =
    streetSectionCanvasLeft + 'px'

  document.querySelector('#street-section-editable').style.width =
    (street.width * TILE_SIZE) + 'px'
  // end trouble lines

  infoBubble.show(true)
}
