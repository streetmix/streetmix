function _addEventListeners() {
  window.addEventListener('beforeprint', function() { _onBeforePrint(false); } );
  window.addEventListener('afterprint', function() { _onAfterPrint(false); } );

  var mediaQueryList = window.matchMedia('print');
  mediaQueryList.addListener(function(mql) {
    if (mql.matches) {
      _onBeforePrint(true);
    } else {
      _onAfterPrint(true);
    }
  });

  document.querySelector('#invoke-print').addEventListener('click', _print);

  document.querySelector('#share-via-twitter').addEventListener('click', _shareViaTwitter);
  document.querySelector('#share-via-facebook').addEventListener('click', _shareViaFacebook);

  if (system.touch) {
    document.querySelector('#dialog-box-shield').addEventListener('touchstart', _hideDialogBoxes);
  } else {
    document.querySelector('#dialog-box-shield').addEventListener('click', _hideDialogBoxes);
  }
  document.querySelector('#about .close').addEventListener('click', _hideAboutDialogBox);

  document.querySelector('#about-streetmix').addEventListener('click', _showAboutDialogBox);

  document.querySelector('#street-scroll-indicator-left').addEventListener('click', _onStreetLeftScrollClick);
  document.querySelector('#street-scroll-indicator-right').addEventListener('click', _onStreetRightScrollClick);

  if (system.touch) {
    document.querySelector('#welcome .close').addEventListener('touchstart', _hideWelcome);
  } else {
    document.querySelector('#welcome .close').addEventListener('click', _hideWelcome);
  }
  document.querySelector('#save-as-image-dialog .close').addEventListener('click', _hideSaveAsImageDialogBox);

  document.querySelector('#save-as-image').addEventListener('click', _showSaveAsImageDialogBox);

  document.querySelector('#save-as-image-transparent-sky').addEventListener('click', _updateSaveAsImageOptions);
  document.querySelector('#save-as-image-segment-names').addEventListener('click', _updateSaveAsImageOptions);
  document.querySelector('#save-as-image-street-name').addEventListener('click', _updateSaveAsImageOptions);

  document.querySelector('#street-section-outer').addEventListener('scroll', _onStreetSectionScroll);

  if (!system.touch) {
    $('#street-section-left-building').mouseenter(_onBuildingMouseEnter);
    $('#street-section-left-building').mouseleave(_onBuildingMouseLeave);
    $('#street-section-right-building').mouseenter(_onBuildingMouseEnter);
    $('#street-section-right-building').mouseleave(_onBuildingMouseLeave);
  } else {
    document.querySelector('#street-section-left-building').addEventListener('touchstart', _onBuildingMouseEnter);
    document.querySelector('#street-section-right-building').addEventListener('touchstart', _onBuildingMouseEnter);
  }

  if (!system.touch) {
    $('.info-bubble').mouseenter(_infoBubble.onMouseEnter);
    $('.info-bubble').mouseleave(_infoBubble.onMouseLeave);
  }
  document.querySelector('.info-bubble').addEventListener('touchstart', _infoBubble.onTouchStart);

  document.querySelector('#feedback-form-message').addEventListener('input', _onFeedbackFormInput);
  document.querySelector('#feedback-form-email').addEventListener('input', _onFeedbackFormInput);
  document.querySelector('#feedback-form-email').addEventListener('keydown', _onFeedbackFormEmailKeyDown);
  document.querySelector('#feedback-form-send').addEventListener('click', _feedbackFormSend);

  document.querySelector('#gallery-try-again').addEventListener('click', _repeatReceiveGalleryData);

  document.querySelector('#no-connection-try-again').addEventListener('click', _nonblockingAjaxTryAgain);

  document.querySelector('#blocking-shield-cancel').addEventListener('click', _blockingCancel);
  document.querySelector('#blocking-shield-try-again').addEventListener('click', _blockingTryAgain);
  document.querySelector('#blocking-shield-reload').addEventListener('click', _goReload);
  document.querySelector('#gallery-shield').addEventListener('click', _onGalleryShieldClick);

  document.querySelector('#new-street-default').addEventListener('click', _onNewStreetDefaultClick);
  document.querySelector('#new-street-empty').addEventListener('click', _onNewStreetEmptyClick);
  document.querySelector('#new-street-last').addEventListener('click', _onNewStreetLastClick);

  window.addEventListener('storage', _onStorageChange);

  if (system.touch) {
    document.querySelector('#gallery-link a').addEventListener('touchstart', _onMyStreetsClick);
  } else {
    document.querySelector('#gallery-link a').addEventListener('click', _onMyStreetsClick);
  }

  document.querySelector('#sign-out-link').addEventListener('click', _onSignOutClick);

  /*if (system.pageVisibility) {
    document.addEventListener('visibilitychange', _onVisibilityChange, false);
    document.addEventListener('webkitvisibilitychange', _onVisibilityChange, false);
    document.addEventListener('mozvisibilitychange', _onVisibilityChange, false);
    document.addEventListener('msvisibilitychange', _onVisibilityChange, false);
  }*/
  window.addEventListener('focus', _onWindowFocus);
  window.addEventListener('blur', _onWindowBlur);

  window.addEventListener('beforeunload', _onWindowBeforeUnload);

  if (!readOnly) {
    if (system.touch) {
      document.querySelector('#street-name').addEventListener('touchstart', _askForStreetName);
    } else {
      document.querySelector('#street-name').addEventListener('click', _askForStreetName);
    }
  }

  if (system.touch) {
    document.querySelector('#undo').addEventListener('touchstart', _undo);
    document.querySelector('#redo').addEventListener('touchstart', _redo);
  } else {
    document.querySelector('#undo').addEventListener('click', _undo);
    document.querySelector('#redo').addEventListener('click', _redo);
  }

  if (!readOnly) {
    document.querySelector('#street-width-read').addEventListener('click', _onStreetWidthClick);

    document.querySelector('#street-width').
        addEventListener('change', _onStreetWidthChange);
  }

  window.addEventListener('resize', _onResize);

  $(document).mouseleave(_onBodyMouseOut);

  if (!system.touch) {
    window.addEventListener('mousedown', _onBodyMouseDown);
    window.addEventListener('mousemove', _onBodyMouseMove);
    window.addEventListener('mouseup', _onBodyMouseUp);
  } else {
    window.addEventListener('touchstart', _onBodyMouseDown);
    window.addEventListener('touchmove', _onBodyMouseMove);
    window.addEventListener('touchend', _onBodyMouseUp);
  }
  window.addEventListener('keydown', _onGlobalKeyDown);

  /*if (system.touch) {
    document.querySelector('#share-menu-button').
        addEventListener('touchstart', _onShareMenuClick);
    document.querySelector('#feedback-menu-button').
        addEventListener('touchstart', _onFeedbackMenuClick);
    if (document.querySelector('#identity-menu-button')) {
      document.querySelector('#identity-menu-button').
          addEventListener('touchstart', _onIdentityMenuClick);
    }
  } else {*/
    // Firefox sometimes disables some buttons… unsure why
    document.querySelector('#share-menu-button').disabled = false;
    document.querySelector('#help-menu-button').disabled = false;
    document.querySelector('#feedback-menu-button').disabled = false;
    if (document.querySelector('#identity-menu-button')) {
      document.querySelector('#identity-menu-button').disabled = false;
    }

    document.querySelector('#share-menu-button').
        addEventListener('click', _onShareMenuClick);
    document.querySelector('#help-menu-button').
        addEventListener('click', _onHelpMenuClick);
    document.querySelector('#feedback-menu-button').
        addEventListener('click', _onFeedbackMenuClick);
    if (document.querySelector('#identity-menu-button')) {
      document.querySelector('#identity-menu-button').
          addEventListener('click', _onIdentityMenuClick);
    }
  //}
}
