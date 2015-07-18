function _scrollStreet (left, far) {
  var el = document.querySelector('#street-section-outer')
  $(el).stop(true, true)

  if (left) {
    if (far) {
      var newScrollLeft = 0
    } else {
      var newScrollLeft = el.scrollLeft - (el.offsetWidth * .5)
    }
  } else {
    if (far) {
      var newScrollLeft = el.scrollWidth - el.offsetWidth
    } else {
      var newScrollLeft = el.scrollLeft + (el.offsetWidth * .5)
    }
  }

  // TODO const
  $(el).animate({ scrollLeft: newScrollLeft }, 300)
}

function _onScrollButtonLeft (event) {
  var el = event.target.el
  // TODO const
  $(el).animate({ scrollLeft: el.scrollLeft - (el.offsetWidth - 150) }, 300)
}

function _onScrollButtonRight (event) {
  var el = event.target.el

  // TODO const
  $(el).animate({ scrollLeft: el.scrollLeft + (el.offsetWidth - 150) }, 300)
}

function _onScrollButtonScroll (event) {
  _scrollButtonScroll(event.target)
}

function _scrollButtonScroll (el) {
  if (el.scrollLeft == 0) {
    el.parentNode.querySelector('button.scroll-left').disabled = true
  } else {
    el.parentNode.querySelector('button.scroll-left').disabled = false
  }

  if (el.scrollLeft == el.scrollWidth - el.offsetWidth) {
    el.parentNode.querySelector('button.scroll-right').disabled = true
  } else {
    el.parentNode.querySelector('button.scroll-right').disabled = false
  }
}

function _repositionScrollButtons (el) {
  var buttonEl = el.parentNode.querySelector('button.scroll-left')
  buttonEl.style.left = _getElAbsolutePos(el)[0] + 'px'

  var buttonEl = el.parentNode.querySelector('button.scroll-right')
  buttonEl.style.left = (_getElAbsolutePos(el)[0] + el.offsetWidth) + 'px'
}

function _addScrollButtons (el) {
  var buttonEl = document.createElement('button')
  buttonEl.innerHTML = '«'
  buttonEl.classList.add('scroll-left')
  buttonEl.el = el
  buttonEl.disabled = true
  buttonEl.addEventListener('pointerdown', _onScrollButtonLeft)
  el.parentNode.appendChild(buttonEl)

  var buttonEl = document.createElement('button')
  buttonEl.innerHTML = '»'
  buttonEl.classList.add('scroll-right')
  buttonEl.el = el
  buttonEl.disabled = true
  buttonEl.addEventListener('pointerdown', _onScrollButtonRight)
  el.parentNode.appendChild(buttonEl)

  el.setAttribute('scroll-buttons', true)
  el.addEventListener('scroll', _onScrollButtonScroll)

  _repositionScrollButtons(el)
  _scrollButtonScroll(el)
}

function _updateScrollButtons () {
  var els = document.querySelectorAll('[scroll-buttons]')
  for (var i = 0, el; el = els[i]; i++) {
    _repositionScrollButtons(el)
    _scrollButtonScroll(el)
  }
}

function _updateStreetScrollIndicators () {
  var el = document.querySelector('#street-section-outer')

  if (el.scrollWidth <= el.offsetWidth) {
    var posLeft = 0
    var posRight = 0
  } else {
    var left = el.scrollLeft / (el.scrollWidth - el.offsetWidth)

    // TODO const off max width street
    var posMax = Math.round(street.width / MAX_CUSTOM_STREET_WIDTH * 6)
    if (posMax < 2) {
      posMax = 2
    }

    var posLeft = Math.round(posMax * left)
    if ((left > 0) && (posLeft == 0)) {
      posLeft = 1
    }
    if ((left < 1.0) && (posLeft == posMax)) {
      posLeft = posMax - 1
    }
    var posRight = posMax - posLeft
  }

  document.querySelector('#street-scroll-indicator-left').innerHTML = Array(posLeft + 1).join('‹')
  document.querySelector('#street-scroll-indicator-right').innerHTML = Array(posRight + 1).join('›')
}

function _onStreetSectionScroll (event) {
  _infoBubble.suppress()

  var scrollPos = document.querySelector('#street-section-outer').scrollLeft

  var pos = -scrollPos * 0.5
  document.querySelector('#street-section-sky .front-clouds').style[system.cssTransform] =
    'translateX(' + pos + 'px)'

  var pos = -scrollPos * 0.25
  document.querySelector('#street-section-sky .rear-clouds').style[system.cssTransform] =
    'translateX(' + pos + 'px)'

  _updateStreetScrollIndicators()

  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function _onStreetLeftScrollClick (event) {
  _scrollStreet(true, event.shiftKey)
}
function _onStreetRightScrollClick (event) {
  _scrollStreet(false, event.shiftKey)
}
