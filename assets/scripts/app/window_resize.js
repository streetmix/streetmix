import { infoBubble } from '../info_bubble/info_bubble'
import { app } from '../preinit/app_settings'
import { system } from '../preinit/system_capabilities'
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

  infoBubble.show(true)
}
