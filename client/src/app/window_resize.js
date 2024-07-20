import { infoBubble } from '../info_bubble/info_bubble'
import { app } from '../preinit/app_settings'

let streetSectionTop

export function getStreetSectionTop () {
  return streetSectionTop
}

// TODO: less reliance on querying other DOM elements, if possible
// TODO: document all magic numbers
export function setStreetSectionTop () {
  // not _always_ equal to 100vh, but for our purposes, it is
  const viewportHeight = window.innerHeight

  // TODO this will always be the same, since in CSS this is a fixed number.
  const streetSectionHeight = document.querySelector(
    '#street-section-inner'
  )?.offsetHeight

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
}

export function onResize () {
  setStreetSectionTop()
  infoBubble.show(true)
}
