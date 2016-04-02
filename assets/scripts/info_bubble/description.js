/**
 * info_bubble/description
 *
 * Additional descriptive text about segments.
 */
/* global street, streetSectionTop */
/* global SEGMENT_INFO */
import { infoBubble } from './info_bubble'
import { removeElFromDOM } from '../util/dom_helpers'
import { trackEvent } from '../app/event_tracking'

const TRACK_ACTION_LEARN_MORE = 'Learn more about segment'

export function updateDescription (segment) {
  const description = getDescriptionData(segment)

  destroyDescriptionDOM()
  if (description) {
    buildDescriptionDOM(description)
  }
}

function getDescriptionData (segment) {
  const segmentInfo = SEGMENT_INFO[segment.type]
  const variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString]

  if (variantInfo && variantInfo.description) {
    return variantInfo.description
  } else if (segmentInfo && segmentInfo.description) {
    return segmentInfo.description
  } else {
    return null
  }
}

function showDescription () {
  infoBubble.descriptionVisible = true

  var el = infoBubble.el.querySelector('.description-canvas')
  el.style.height = (streetSectionTop + 200 + 50 - infoBubble.bubbleY) + 'px'

  infoBubble.el.classList.add('show-description')
  if (infoBubble.segmentEl) {
    infoBubble.segmentEl.classList.add('hide-drag-handles-when-description-shown')
  }

  unhighlightTriangleDelayed()

  window.setTimeout(function () {
    infoBubble.getBubbleDimensions()
    infoBubble.updateHoverPolygon()
  }, 500)

  trackEvent('Interaction', TRACK_ACTION_LEARN_MORE,
    infoBubble.segment.type, null, false)
}

function hideDescription () {
  infoBubble.descriptionVisible = false
  infoBubble.el.classList.remove('show-description')
  if (infoBubble.segmentEl) {
    infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown')
  }

  infoBubble.getBubbleDimensions()
  infoBubble.updateHoverPolygon()

  unhighlightTriangleDelayed()
}

function buildDescriptionDOM (description) {
  const promptEl = document.createElement('div')
  promptEl.classList.add('description-prompt')
  promptEl.innerHTML = (description.prompt) ? description.prompt : 'Learn more'

  promptEl.addEventListener('pointerdown', showDescription)
  promptEl.addEventListener('pointerenter', highlightTriangle)
  promptEl.addEventListener('pointerleave', unhighlightTriangle)

  infoBubble.el.appendChild(promptEl)

  const descriptionEl = document.createElement('div')
  descriptionEl.classList.add('description-canvas')

  const descriptionInnerEl = document.createElement('div')
  descriptionInnerEl.classList.add('description')

  if (description.image) {
    descriptionInnerEl.innerHTML += '<img src="/images/info-bubble-examples/' + description.image + '">'
  }
  if (description.lede) {
    descriptionInnerEl.innerHTML += '<p class="lede">' + description.lede + '</p>'
  }
  for (let i = 0; i < description.text.length; i++) {
    descriptionInnerEl.innerHTML += '<p>' + description.text[i] + '</p>'
  }
  if (description.imageCaption) {
    descriptionInnerEl.innerHTML += '<footer>Photo: ' + description.imageCaption + '</footer>'
  }
  descriptionEl.appendChild(descriptionInnerEl)

  // Links should open in a new window
  const anchorEls = descriptionInnerEl.querySelectorAll('a')
  for (let anchorEl of anchorEls) {
    anchorEl.target = '_blank'
  }

  // Lower close button
  const closeEl = document.createElement('div')
  closeEl.classList.add('description-close')
  closeEl.innerHTML = 'Close'
  closeEl.addEventListener('pointerdown', hideDescription)
  closeEl.addEventListener('pointerenter', highlightTriangle)
  closeEl.addEventListener('pointerleave', unhighlightTriangle)
  descriptionEl.appendChild(closeEl)

  // Decoration: a triangle pointing down
  const triangleEl = document.createElement('div')
  triangleEl.classList.add('triangle')
  descriptionEl.appendChild(triangleEl)

  infoBubble.el.appendChild(descriptionEl)
}

function destroyDescriptionDOM () {
  removeElFromDOM(infoBubble.el.querySelector('.description-prompt'))
  removeElFromDOM(infoBubble.el.querySelector('.description-canvas'))
}

function highlightTriangle () {
  infoBubble.el.classList.add('highlight-triangle')
}

function unhighlightTriangle () {
  infoBubble.el.classList.remove('highlight-triangle')
}

function unhighlightTriangleDelayed () {
  window.setTimeout(function () {
    unhighlightTriangle()
  }, 200)
}
