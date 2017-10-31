/**
 * info_bubble/description
 *
 * Additional descriptive text about segments.
 */

import { trackEvent } from '../app/event_tracking'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { getStreetSectionTop } from '../app/window_resize'
import { SEGMENT_INFO } from '../segments/info'
import { infoBubble } from './info_bubble'

const DESCRIPTION_PROMPT_LABEL = 'Learn more'

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

export function showDescription () {
  infoBubble.descriptionVisible = true

  const el = infoBubble.el.querySelector('.description-canvas')
  // TODO document magic numbers
  el.style.height = (getStreetSectionTop() + 300 - infoBubble.bubbleY) + 'px'

  infoBubble.el.classList.add('show-description')
  if (infoBubble.segmentEl) {
    infoBubble.segmentEl.classList.add('hide-drag-handles-when-description-shown')
  }

  infoBubble.getBubbleDimensions()
  infoBubble.updateHoverPolygon()
  unhighlightTriangleDelayed()
  registerKeypress('esc', hideDescription)

  trackEvent('INTERACTION', 'LEARN_MORE', infoBubble.segment.type, null, false)
}

export function hideDescription () {
  infoBubble.descriptionVisible = false

  infoBubble.el.classList.remove('show-description')
  if (infoBubble.segmentEl) {
    infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown')
  }

  infoBubble.getBubbleDimensions()
  infoBubble.updateHoverPolygon()
  unhighlightTriangleDelayed()
  deregisterKeypress('esc', hideDescription)
}

function buildDescriptionDOM (description) {
  const promptEl = document.createElement('div')
  promptEl.classList.add('description-prompt')
  promptEl.innerHTML = (description.prompt) ? description.prompt : DESCRIPTION_PROMPT_LABEL

  promptEl.addEventListener('pointerdown', showDescription)
  promptEl.addEventListener('pointerenter', highlightTriangle)
  promptEl.addEventListener('pointerleave', unhighlightTriangle)

  infoBubble.transitionEl.appendChild(promptEl)

  const descriptionEl = document.createElement('div')
  descriptionEl.classList.add('description-canvas')

  const descriptionInnerEl = document.createElement('div')
  descriptionInnerEl.classList.add('description')

  if (description.image) {
    descriptionInnerEl.innerHTML += '<img src="/images/info-bubble-examples/' + description.image + '">'
  }
  if (description.lede) {
    descriptionInnerEl.innerHTML += '<p class="description-lede">' + description.lede + '</p>'
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
  triangleEl.classList.add('info-bubbble-triangle')
  descriptionEl.appendChild(triangleEl)

  infoBubble.transitionEl.appendChild(descriptionEl)
}

function destroyDescriptionDOM () {
  const el1 = infoBubble.el.querySelector('.description-prompt')
  if (el1) el1.remove()

  const el2 = infoBubble.el.querySelector('.description-canvas')
  if (el2) el2.remove()
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
