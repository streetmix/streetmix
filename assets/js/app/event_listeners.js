function _addEventListeners () {
  document.querySelector('#street-section-left-building').addEventListener('pointerenter', _onBuildingMouseEnter)
  document.querySelector('#street-section-left-building').addEventListener('pointerleave', _onBuildingMouseLeave)
  document.querySelector('#street-section-right-building').addEventListener('pointerenter', _onBuildingMouseEnter)
  document.querySelector('#street-section-right-building').addEventListener('pointerleave', _onBuildingMouseLeave)

  document.querySelector('.info-bubble').addEventListener('pointerenter', _infoBubble.onMouseEnter)
  document.querySelector('.info-bubble').addEventListener('pointerleave', _infoBubble.onMouseLeave)
  document.querySelector('.info-bubble').addEventListener('pointerdown', _infoBubble.onTouchStart)

  document.querySelector('#no-connection-try-again').addEventListener('pointerdown', _nonblockingAjaxTryAgain)

  // The following do not seem to work on pointerdown
  // click should also be fired by other input methods
  document.querySelector('#new-street-default').addEventListener('click', _onNewStreetDefaultClick)
  document.querySelector('#new-street-empty').addEventListener('click', _onNewStreetEmptyClick)
  document.querySelector('#new-street-last').addEventListener('click', _onNewStreetLastClick)

  window.addEventListener('storage', _onStorageChange)

  document.querySelector('#sign-out-link').addEventListener('pointerdown', _onSignOutClick)

  if (system.pageVisibility) {
    document.addEventListener(system.visibilityChange, _onVisibilityChange, false)
  } else {
    window.addEventListener('focus', _onWindowFocus)
    window.addEventListener('blur', _onWindowBlur)
  }

  window.addEventListener('beforeunload', _onWindowBeforeUnload)

  document.querySelector('#undo').addEventListener('pointerdown', _undo)
  document.querySelector('#redo').addEventListener('pointerdown', _redo)

  if (!app.readOnly) {
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
