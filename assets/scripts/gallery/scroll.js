/**
 * Adds scroll buttons to gallery and palette.
 *
 */
import $ from 'jquery'
import { getElAbsolutePos } from '../util/helpers'

// This file is in the gallery directory but the same scroll buttons
// are also added to the palette as well.
window.addEventListener('stmx:everything_loaded', function () {
  addScrollButtons(document.querySelector('.palette'))
  addScrollButtons(document.querySelector('#gallery .streets'))
})

window.addEventListener('resize', function () {
  updateScrollButtons()
})

function addScrollButtons (el) {
  const leftButtonEl = document.createElement('button')
  leftButtonEl.innerHTML = '«'
  leftButtonEl.classList.add('scroll')
  leftButtonEl.classList.add('scroll-left')
  leftButtonEl.el = el
  leftButtonEl.disabled = true
  leftButtonEl.addEventListener('pointerdown', onScrollButtonLeft)
  el.parentNode.appendChild(leftButtonEl)

  const rightButtonEl = document.createElement('button')
  rightButtonEl.innerHTML = '»'
  rightButtonEl.classList.add('scroll')
  rightButtonEl.classList.add('scroll-right')
  rightButtonEl.el = el
  rightButtonEl.disabled = true
  rightButtonEl.addEventListener('pointerdown', onScrollButtonRight)
  el.parentNode.appendChild(rightButtonEl)

  el.setAttribute('data-scroll-buttons', true)
  el.addEventListener('scroll', onScrollButtonScroll)

  repositionScrollButtons(el)
  scrollButtonScroll(el)
}

export function updateScrollButtons () {
  const els = document.querySelectorAll('[data-scroll-buttons]')
  for (let el of els) {
    repositionScrollButtons(el)
    scrollButtonScroll(el)
  }
}

function onScrollButtonLeft (event) {
  const el = event.target.el
  const position = el.scrollLeft - (el.offsetWidth - 150) // TODO: document magic number
  const duration = 300

  $(el).animate({ scrollLeft: position }, duration)
}

function onScrollButtonRight (event) {
  const el = event.target.el
  const position = el.scrollLeft + (el.offsetWidth - 150) // TODO: document magic number
  const duration = 300

  $(el).animate({ scrollLeft: position }, duration)
}

function onScrollButtonScroll (event) {
  scrollButtonScroll(event.target)
}

function scrollButtonScroll (el) {
  if (el.scrollLeft === 0) {
    el.parentNode.querySelector('button.scroll-left').disabled = true
  } else {
    el.parentNode.querySelector('button.scroll-left').disabled = false
  }

  if (el.scrollLeft === el.scrollWidth - el.offsetWidth) {
    el.parentNode.querySelector('button.scroll-right').disabled = true
  } else {
    el.parentNode.querySelector('button.scroll-right').disabled = false
  }
}

function repositionScrollButtons (el) {
  const leftButtonEl = el.parentNode.querySelector('button.scroll-left')
  leftButtonEl.style.left = getElAbsolutePos(el)[0] + 'px'

  const rightButtonEl = el.parentNode.querySelector('button.scroll-right')
  rightButtonEl.style.left = (getElAbsolutePos(el)[0] + el.offsetWidth) + 'px'
}
