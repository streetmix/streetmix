import { infoBubble } from '../info_bubble/info_bubble'
import { app } from '../preinit/app_settings'
import store from '../store'
import { windowResize } from '../store/actions/system'

let streetSectionTop

export function getStreetSectionTop () {
  return streetSectionTop
}

// TODO: less stop relying on querying other DOM elements
export function setStreetSectionTop () {
  const viewportHeight = window.innerHeight
  const streetSectionHeight = document.querySelector('#street-section-inner').offsetHeight
  const paletteTop = document.querySelector('.palette-container').offsetTop || viewportHeight

  // TODO const
  if (viewportHeight - streetSectionHeight > 450) {
    streetSectionTop = ((viewportHeight - streetSectionHeight - 450) / 2) + 450 + 80
  } else {
    streetSectionTop = viewportHeight - streetSectionHeight + 70
  }

  if (app.readOnly) {
    streetSectionTop += 80
  }

  // TODO const
  if (streetSectionTop + document.querySelector('#street-section-inner').offsetHeight > paletteTop - 20 + 180) { // gallery height
    streetSectionTop = paletteTop - 20 - streetSectionHeight + 180
  }
}

export function onResize () {
  store.dispatch(windowResize(window.innerWidth, window.innerHeight))
  setStreetSectionTop()
  infoBubble.show(true)
}
