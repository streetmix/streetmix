/**
 * Handles scrolling the street.
 *
 */
import { registerKeypress } from '../app/keypress'
import { infoBubble } from '../info_bubble/info_bubble'
import { system } from '../preinit/system_capabilities'
import { getStreet } from './data_model'
import { MAX_CUSTOM_STREET_WIDTH } from './width'
import { animate } from '../util/helpers'

export function attachStreetScrollEventListeners () {
  window.addEventListener('stmx:everything_loaded', function () {
    document.querySelector('#street-scroll-indicator-left').addEventListener('pointerdown', onStreetLeftScrollClick)
    document.querySelector('#street-scroll-indicator-right').addEventListener('pointerdown', onStreetRightScrollClick)

    // document.querySelector('#street-section-outer').addEventListener('scroll', onStreetSectionScroll)

    registerKeypress('left', function (event) {
      scrollStreet(true, event.shiftKey)
    })
    registerKeypress('right', function (event) {
      scrollStreet(false, event.shiftKey)
    })
  })

  window.addEventListener('resize', function () {
    updateStreetScrollIndicators()
  })
}

function scrollStreet (left, far = false) {
  const el = document.querySelector('#street-section-outer')
  let newScrollLeft

  if (left) {
    if (far) {
      newScrollLeft = 0
    } else {
      newScrollLeft = el.scrollLeft - (el.offsetWidth * 0.5)
    }
  } else {
    if (far) {
      newScrollLeft = el.scrollWidth - el.offsetWidth
    } else {
      newScrollLeft = el.scrollLeft + (el.offsetWidth * 0.5)
    }
  }

  animate(el, { scrollLeft: newScrollLeft }, 300)
}

function updateStreetScrollIndicators () {
  const el = document.querySelector('#street-section-outer')
  let posLeft
  let posRight

  if (el.scrollWidth <= el.offsetWidth) {
    posLeft = 0
    posRight = 0
  } else {
    var left = el.scrollLeft / (el.scrollWidth - el.offsetWidth)

    // TODO const off max width street
    var posMax = Math.round(getStreet().width / MAX_CUSTOM_STREET_WIDTH * 6)
    if (posMax < 2) {
      posMax = 2
    }

    posLeft = Math.round(posMax * left)
    if ((left > 0) && (posLeft === 0)) {
      posLeft = 1
    }
    if ((left < 1.0) && (posLeft === posMax)) {
      posLeft = posMax - 1
    }
    posRight = posMax - posLeft
  }

  document.querySelector('#street-scroll-indicator-left').innerHTML = Array(posLeft + 1).join('‹')
  document.querySelector('#street-scroll-indicator-right').innerHTML = Array(posRight + 1).join('›')
}

export function onStreetSectionScroll (event) {
  infoBubble.suppress()

  var scrollPos = document.querySelector('#street-section-outer').scrollLeft

  var frontPos = -scrollPos * 0.5
  document.querySelector('#street-section-sky .front-clouds').style[system.cssTransform] =
    'translateX(' + frontPos + 'px)'

  var rearPos = -scrollPos * 0.25
  document.querySelector('#street-section-sky .rear-clouds').style[system.cssTransform] =
    'translateX(' + rearPos + 'px)'

  updateStreetScrollIndicators()

  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function onStreetLeftScrollClick (event) {
  scrollStreet(true, event.shiftKey)
}

function onStreetRightScrollClick (event) {
  scrollStreet(false, event.shiftKey)
}
