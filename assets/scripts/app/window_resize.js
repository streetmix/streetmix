import { infoBubble } from '../info_bubble/info_bubble'
import { app } from '../preinit/app_settings'

let streetSectionTop

export function getStreetSectionTop () {
  return streetSectionTop
}

// TODO: less reliance on querying other DOM elements, if possible
// TODO: document all magic numbers
export function setStreetSectionTop () {
  const viewportHeight = window.innerHeight
  const streetSectionHeight = document.querySelector('#street-section-inner')
    .offsetHeight
  // Find the top of the palette element. If element is not present (it
  // not be rendered in some cases, e.g. when the app is in read-only mode),
  // use the viewport height.
  const paletteTop =
    document.querySelector('.palette-container')?.offsetTop || viewportHeight

  // TODO const
  if (viewportHeight - streetSectionHeight > 450) {
    streetSectionTop =
      (viewportHeight - streetSectionHeight - 450) / 2 + 450 + 80
  } else {
    streetSectionTop = viewportHeight - streetSectionHeight + 70
  }

  if (app.readOnly) {
    streetSectionTop += 80
  }

  // TODO const
  if (streetSectionTop + streetSectionHeight > paletteTop - 20 + 180) {
    // gallery height
    streetSectionTop = paletteTop - 20 - streetSectionHeight + 180
  }
}

export function onResize () {
  setStreetSectionTop()
  infoBubble.show(true)
}
