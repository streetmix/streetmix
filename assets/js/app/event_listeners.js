function _addEventListeners () {
  window.addEventListener('beforeprint', function () { _onBeforePrint(false); })
  window.addEventListener('afterprint', function () { _onAfterPrint(false); })

  var mediaQueryList = window.matchMedia('print')
  mediaQueryList.addListener(function (mql) {
    if (mql.matches) {
      _onBeforePrint(true)
    } else {
      _onAfterPrint(true)
    }
  })

  document.querySelector('#invoke-print').addEventListener('pointerdown', _print)

  document.querySelector('#street-scroll-indicator-left').addEventListener('pointerdown', _onStreetLeftScrollClick)
  document.querySelector('#street-scroll-indicator-right').addEventListener('pointerdown', _onStreetRightScrollClick)

  document.querySelector('#welcome .close').addEventListener('pointerdown', _hideWelcome)

  document.querySelector('#street-section-outer').addEventListener('scroll', _onStreetSectionScroll)

  document.querySelector('#street-section-left-building').addEventListener('pointerenter', _onBuildingMouseEnter)
  document.querySelector('#street-section-left-building').addEventListener('pointerleave', _onBuildingMouseLeave)
  document.querySelector('#street-section-right-building').addEventListener('pointerenter', _onBuildingMouseEnter)
  document.querySelector('#street-section-right-building').addEventListener('pointerleave', _onBuildingMouseLeave)

  document.querySelector('.info-bubble').addEventListener('pointerenter', _infoBubble.onMouseEnter)
  document.querySelector('.info-bubble').addEventListener('pointerleave', _infoBubble.onMouseLeave)
  document.querySelector('.info-bubble').addEventListener('pointerdown', _infoBubble.onTouchStart)

  document.querySelector('#feedback-form-message').addEventListener('input', _onFeedbackFormInput)
  document.querySelector('#feedback-form-email').addEventListener('input', _onFeedbackFormInput)
  document.querySelector('#feedback-form-email').addEventListener('keydown', _onFeedbackFormEmailKeyDown)
  document.querySelector('#feedback-form-send').addEventListener('pointerdown', _feedbackFormSend)

  document.querySelector('#gallery-try-again').addEventListener('pointerdown', _repeatReceiveGalleryData)

  document.querySelector('#no-connection-try-again').addEventListener('pointerdown', _nonblockingAjaxTryAgain)

  document.querySelector('#blocking-shield-cancel').addEventListener('pointerdown', _blockingCancel)
  document.querySelector('#blocking-shield-try-again').addEventListener('pointerdown', _blockingTryAgain)
  document.querySelector('#blocking-shield-reload').addEventListener('pointerdown', _goReload)
  document.querySelector('#gallery-shield').addEventListener('pointerdown', _onGalleryShieldClick)

  document.querySelector('#new-street-default').addEventListener('pointerdown', _onNewStreetDefaultClick)
  document.querySelector('#new-street-empty').addEventListener('pointerdown', _onNewStreetEmptyClick)
  document.querySelector('#new-street-last').addEventListener('pointerdown', _onNewStreetLastClick)

  window.addEventListener('storage', _onStorageChange)

  document.querySelector('#gallery-link a').addEventListener('pointerdown', _onMyStreetsClick)

  document.querySelector('#sign-out-link').addEventListener('pointerdown', _onSignOutClick)

  if (system.pageVisibility) {
    document.addEventListener(system.visibilityChange, _onVisibilityChange, false)
  } else {
    window.addEventListener('focus', _onWindowFocus)
    window.addEventListener('blur', _onWindowBlur)
  }

  window.addEventListener('beforeunload', _onWindowBeforeUnload)

  if (!readOnly) {
    document.querySelector('#street-name').addEventListener('pointerdown', _askForStreetName)
  }

  document.querySelector('#undo').addEventListener('pointerdown', _undo)
  document.querySelector('#redo').addEventListener('pointerdown', _redo)

  if (!readOnly) {
    document.querySelector('#street-width-read').addEventListener('pointerdown', _onStreetWidthClick)
    document.querySelector('#street-width').addEventListener('change', _onStreetWidthChange)
  }

  window.addEventListener('resize', _onResize)

  // This listener hides the info bubble when the mouse leaves the
  // document area. Do not normalize it to a pointerleave event
  // because it doesn't make sense for other pointer types
  document.addEventListener('mouseleave', _onBodyMouseOut)

  window.addEventListener('pointerdown', _onBodyMouseDown)
  window.addEventListener('pointermove', _onBodyMouseMove)
  window.addEventListener('pointerup', _onBodyMouseUp)
  window.addEventListener('keydown', _onGlobalKeyDown)

}
