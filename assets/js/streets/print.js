var printingNeedsUpdating = true

function _updatePrintImage () {
  if (printingNeedsUpdating) {
    // Chrome fires _onBeforePrint twice.
    document.querySelector('#print > div').innerHTML = ''

    var el = _getStreetImage(true, true)
    var dataUrl = el.toDataURL('image/png')

    var imgEl = document.createElement('img')
    imgEl.src = dataUrl
    document.querySelector('#print > div').appendChild(imgEl)

    printingNeedsUpdating = false
  }
}

function _onBeforePrint (mediaMatch) {
  // So that max-height: 100% works
  if (mediaMatch) {
    document.querySelector('#print > div').style.width = window.innerWidth + 'px'
    document.querySelector('#print > div').style.height = window.innerHeight + 'px'
  }

  _updatePrintImage()

  if (!mediaMatch) {
    document.querySelector('#print > div > img').style.width = '100%'
  }
}

function _onAfterPrint () {
}

function _print (event) {
  MenuManager.hideAll()
  _infoBubble.hide()
  _infoBubble.hideSegment(true)

  window.setTimeout(function () {
    _onBeforePrint()
    window.print()
  }, 50)
  event.preventDefault()
}
