var MODES = {
  CONTINUE: 1,
  NEW_STREET: 2,
  NEW_STREET_COPY_LAST: 3,
  JUST_SIGNED_IN: 4,
  EXISTING_STREET: 5,
  NOT_FOUND: 6,
  SIGN_OUT: 7,
  FORCE_RELOAD_SIGN_IN: 8,
  FORCE_RELOAD_SIGN_OUT: 9,
  USER_GALLERY: 10,
  GLOBAL_GALLERY: 11,
  FORCE_RELOAD_SIGN_OUT_401: 12,
  ERROR: 13,
  UNSUPPORTED_BROWSER: 14,
  STREET_404: 15,
  STREET_404_BUT_LINK_TO_USER: 16,
  STREET_410_BUT_LINK_TO_USER: 17,
  ABOUT: 18
};

var mode;

function _processMode() {
  serverContacted = true;

  switch (mode) {
    case MODES.ERROR:
      _showErrorFromUrl();
      break;
    case MODES.UNSUPPORTED_BROWSER:
      _showError(ERRORS.UNSUPPORTED_BROWSER, true);
      break;
    case MODES.NOT_FOUND:
      _showError(ERRORS.NOT_FOUND, true);
      break;
    case MODES.STREET_404:
      _showError(ERRORS.STREET_404, true);
      break;
    case MODES.STREET_404_BUT_LINK_TO_USER:
      _showError(ERRORS.STREET_404_BUT_LINK_TO_USER, true);
      break;
    case MODES.STREET_410_BUT_LINK_TO_USER:
      _showError(ERRORS.STREET_410_BUT_LINK_TO_USER, true);
      break;
    case MODES.SIGN_OUT:
      _showError(ERRORS.SIGN_OUT, true);
      break;
    case MODES.FORCE_RELOAD_SIGN_OUT:
      _showError(ERRORS.FORCE_RELOAD_SIGN_OUT, true);
      break;
    case MODES.FORCE_RELOAD_SIGN_OUT_401:
      _showError(ERRORS.FORCE_RELOAD_SIGN_OUT_401, true);
      break;
    case MODES.FORCE_RELOAD_SIGN_IN:
      _showError(ERRORS.FORCE_RELOAD_SIGN_IN, true);
      break;
    case MODES.NEW_STREET:
      serverContacted = false;
      break;
    case MODES.NEW_STREET_COPY_LAST:
      serverContacted = false;
      break;
    case MODES.CONTINUE:
    case MODES.USER_GALLERY:
    case MODES.ABOUT:
    case MODES.GLOBAL_GALLERY:
      serverContacted = false;
      break;
    case MODES.JUST_SIGNED_IN:
      serverContacted = false;
      break;
    case MODES.EXISTING_STREET:
      serverContacted = false;
      break;
  }
}
