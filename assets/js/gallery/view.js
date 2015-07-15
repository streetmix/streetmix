var THUMBNAIL_WIDTH = 180
var THUMBNAIL_HEIGHT = 110
var THUMBNAIL_MULTIPLIER = .1 * 2
var BACKGROUND_DIRT_COLOUR = 'rgb(53, 45, 39)'

var TRACK_ACTION_OPEN_GALLERY = 'Open gallery'

var galleryVisible = false

var galleryUserId = null
var galleryStreetId = null
var galleryStreetLoaded = false

function _repeatReceiveGalleryData () {
  _loadGalleryContents()
}

function _updateGallerySelection () {
  var els = document.querySelectorAll('#gallery .streets .selected')
  for (var i = 0, el; el = els[i]; i++) {
    el.classList.remove('selected')
  }

  var el = document.querySelector('#gallery .streets [streetId="' +
    galleryStreetId + '"]')
  if (el) {
    el.classList.add('selected')
  }
}

function _switchGalleryStreet (id) {
  galleryStreetId = id

  _updateGallerySelection()
  _fetchGalleryStreet(galleryStreetId)
}

function _onGalleryStreetClick (event) {
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    return
  }

  var el = this
  _switchGalleryStreet(el.getAttribute('streetId'))

  event.preventDefault()
}

function _updateGalleryStreetCount () {
  if (galleryUserId) {
    var streetCount = document.querySelectorAll('#gallery .streets li').length

    switch (streetCount) {
      case 0:
        var text = msg('STREET_COUNT_0')
        break
      case 1:
        var text = msg('STREET_COUNT_1')
        break
      default:
        var text = msg('STREET_COUNT_MANY', { streetCount: streetCount })
        break
    }
  } else {
    var text = ''
  }
  document.querySelector('#gallery .street-count').innerHTML = text
}

function _receiveGalleryData (transmission) {
  document.querySelector('#gallery .loading').classList.remove('visible')

  for (var i in transmission.streets) {
    var galleryStreet = transmission.streets[i]

    // There is a bug where sometimes street data is non-existent for an unknown reason
    // Skip over so that the rest of gallery will display
    if (!galleryStreet.data) continue

    _updateToLatestSchemaVersion(galleryStreet.data.street)

    var el = document.createElement('li')

    var anchorEl = document.createElement('a')

    /*if (!galleryUserId && (galleryStreet.data.undoStack.length <= 4)) {
      anchorEl.classList.add('virgin')
    }*/

    galleryStreet.creatorId =
      (galleryStreet.creator && galleryStreet.creator.id)

    galleryStreet.name = galleryStreet.name || DEFAULT_NAME

    anchorEl.href = _getStreetUrl(galleryStreet)

    anchorEl.streetName = galleryStreet.name
    anchorEl.setAttribute('streetId', galleryStreet.id)

    if (galleryStreetId == galleryStreet.id) {
      anchorEl.classList.add('selected')
    }

    $(anchorEl).click(_onGalleryStreetClick)

    var thumbnailEl = document.createElement('canvas')
    thumbnailEl.width = THUMBNAIL_WIDTH * system.hiDpi * 2
    thumbnailEl.height = THUMBNAIL_HEIGHT * system.hiDpi * 2
    var ctx = thumbnailEl.getContext('2d')
    _drawStreetThumbnail(ctx, galleryStreet.data.street,
      THUMBNAIL_WIDTH * 2, THUMBNAIL_HEIGHT * 2, THUMBNAIL_MULTIPLIER, true, false, true, false, false)
    anchorEl.appendChild(thumbnailEl)

    var nameEl = document.createElement('div')
    nameEl.className = 'street-name'
    anchorEl.appendChild(nameEl)

    var streetName = new StreetName(nameEl, galleryStreet.name)

    var date = moment(galleryStreet.updatedAt)
    var dateEl = document.createElement('span')
    dateEl.classList.add('date')
    dateEl.innerHTML = _formatDate(date)
    anchorEl.appendChild(dateEl)

    if (!galleryUserId) {
      var creatorEl = document.createElement('span')
      creatorEl.classList.add('creator')

      var creatorName = galleryStreet.creatorId || msg('USER_ANONYMOUS')

      creatorEl.innerHTML = creatorName
      anchorEl.appendChild(creatorEl)
    }

    // Only show delete links if you own the street
    if (signedIn && (galleryStreet.creatorId == signInData.userId)) {
      var removeEl = document.createElement('button')
      removeEl.classList.add('remove')
      removeEl.addEventListener('pointerdown', _onDeleteGalleryStreet)
      removeEl.innerHTML = msg('UI_GLYPH_X')
      removeEl.title = msg('TOOLTIP_DELETE_STREET')
      anchorEl.appendChild(removeEl)
    }

    el.appendChild(anchorEl)
    document.querySelector('#gallery .streets').appendChild(el)
  }

  var streetCount = document.querySelectorAll('#gallery .streets li').length

  if (((mode == MODES.USER_GALLERY) && streetCount) || (mode == MODES.GLOBAL_GALLERY)) {
    _switchGalleryStreet(transmission.streets[0].id)
  }

  var el = document.querySelector('#gallery .selected')
  if (el) {
    el.scrollIntoView()
    document.querySelector('#gallery').scrollTop = 0
  }

  _updateScrollButtons()

  _updateGalleryStreetCount()
}

function _loadGalleryContents () {
  var els = document.querySelectorAll('#gallery .streets li')
  for (var i = 0, el; el = els[i]; i++) {
    _removeElFromDom(el)
  }

  // document.querySelector('#gallery .streets').innerHTML = ''
  document.querySelector('#gallery .loading').classList.add('visible')
  document.querySelector('#gallery .error-loading').classList.remove('visible')

  _fetchGalleryData()
}

function _showGallery (userId, instant, signInPromo) {
  if (readOnly) {
    return
  }

  EventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_OPEN_GALLERY,
    userId, null, false)

  galleryVisible = true
  galleryStreetLoaded = true
  galleryStreetId = street.id
  galleryUserId = userId

  if (signInPromo) {
  } else {
    if (userId) {
      document.querySelector('#gallery .avatar').setAttribute('userId', galleryUserId)
      document.querySelector('#gallery .avatar').removeAttribute('loaded')
      _fetchAvatars()
      document.querySelector('#gallery .user-id').innerHTML = galleryUserId

      var linkEl = document.createElement('a')
      // TODO const
      linkEl.href = 'https://twitter.com/' + galleryUserId
      linkEl.innerHTML = 'Twitter profile »'
      linkEl.classList.add('twitter-profile')
      linkEl.target = '_blank'
      document.querySelector('#gallery .user-id').appendChild(linkEl)

    } else {
      document.querySelector('#gallery .user-id').innerHTML = 'All streets'
    }

    document.querySelector('#gallery .street-count').innerHTML = ''

    // TODO no class, but type?
    if (!userId) {
      document.querySelector('#gallery').classList.add('all-streets')
      document.querySelector('#gallery').classList.remove('another-user')
    } else if (signedIn && (userId == signInData.userId)) {
      document.querySelector('#gallery').classList.remove('another-user')
      document.querySelector('#gallery').classList.remove('all-streets')
    } else {
      document.querySelector('#gallery').classList.add('another-user')
      document.querySelector('#gallery').classList.remove('all-streets')
    }
  }

  _hideControls()
  _statusMessage.hide()
  document.querySelector('#gallery .sign-in-promo').classList.remove('visible')

  if (instant) {
    document.body.classList.add('gallery-no-move-transition')
  }
  document.body.classList.add('gallery-visible')

  if (instant) {
    window.setTimeout(function () {
      document.body.classList.remove('gallery-no-move-transition')
    }, 0)
  }

  if ((mode == MODES.USER_GALLERY) || (mode == MODES.GLOBAL_GALLERY)) {
    // Prevents showing old street before the proper street loads
    _showError(ERRORS.NO_STREET, false)
  }

  if (!signInPromo) {
    _loadGalleryContents()
    _updatePageUrl(true)
  } else {
    document.querySelector('#gallery .sign-in-promo').classList.add('visible')
  }
}

function _onGalleryShieldClick (event) {
  _hideGallery(false)
}

function _hideGallery (instant) {
  if ((currentErrorType != ERRORS.NO_STREET) && galleryStreetLoaded) {
    galleryVisible = false

    if (instant) {
      document.body.classList.add('gallery-no-move-transition')
    }
    document.body.classList.remove('gallery-visible')

    if (instant) {
      window.setTimeout(function () {
        document.body.classList.remove('gallery-no-move-transition')
      }, 0)
    }

    _onWindowFocus()

    if (!abortEverything) {
      _updatePageUrl()
    }

    mode = MODES.CONTINUE
  }
}

function _updateGalleryShield () {
  document.querySelector('#gallery-shield').style.width = 0
  window.setTimeout(function () {
    document.querySelector('#gallery-shield').style.height =
      system.viewportHeight + 'px'
    document.querySelector('#gallery-shield').style.width =
      document.querySelector('#street-section-outer').scrollWidth + 'px'
  }, 0)
}

function _onDeleteGalleryStreet (event) {
  var el = event.target.parentNode
  var name = el.streetName

  _ignoreWindowFocusMomentarily()
  // TODO escape name
  if (confirm(msg('PROMPT_DELETE_STREET', { name: name }))) {
    if (el.getAttribute('streetId') == street.id) {
      _showError(ERRORS.NO_STREET, false)
    }

    _sendDeleteStreetToServer(el.getAttribute('streetId'))

    _removeElFromDom(el.parentNode)
    _updateGalleryStreetCount()
  }

  event.preventDefault()
  event.stopPropagation()
}

function _onMyStreetsClick (event) {
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    return
  }

  if (signedIn) {
    _showGallery(signInData.userId, false)
  } else {
    _showGallery(false, false, true)
  }

  event.preventDefault()
}
