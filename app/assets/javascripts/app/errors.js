var abortEverything;
var errorUrl = '';
var currentErrorType;

var ERRORS = {
  NOT_FOUND: 1,
  SIGN_OUT: 2,
  NO_STREET: 3, // for gallery if you delete the street you were looking at
  FORCE_RELOAD_SIGN_IN: 4,
  FORCE_RELOAD_SIGN_OUT: 5,
  STREET_DELETED_ELSEWHERE: 6,
  NEW_STREET_SERVER_FAILURE: 7,
  FORCE_RELOAD_SIGN_OUT_401: 8,
  TWITTER_ACCESS_DENIED: 9,
  AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN: 10,
  AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN: 11,
  AUTH_PROBLEM_API_PROBLEM: 12,
  GENERIC_ERROR: 13,
  UNSUPPORTED_BROWSER: 14,
  STREET_404: 15,
  STREET_404_BUT_LINK_TO_USER: 16,
  STREET_410_BUT_LINK_TO_USER: 17,
  CANNOT_CREATE_NEW_STREET_ON_PHONE: 18,
  SIGN_IN_SERVER_FAILURE: 19,
  SIGN_IN_401: 20,
  STREET_DATA_FAILURE: 21
};

function _showError(errorType, newAbortEverything) {

  // NOTE:
  // This function might be called on very old browsers. Please make
  // sure not to use modern faculties.

  var title;
  var description = '';

  _hideLoadingScreen();

  abortEverything = newAbortEverything;

  switch (errorType) {
    case ERRORS.NOT_FOUND:
      title = 'Page not found.';
      description = 'Oh, boy. There is no page with this address!<br><button id="error-home">Go to the homepage</button>';
      break;
    case ERRORS.STREET_404:
      title = 'Street not found.';
      description = 'Oh, boy. There is no street with this link!<br><button id="error-home">Go to the homepage</button>';
      break;
    case ERRORS.STREET_404_BUT_LINK_TO_USER:
      title = 'Street not found.';
      description =
          'There is no street with this link! But you can look at other streets by ' +
          '<a href="/' + street.creatorId + '"><div class="avatar" userId="' + street.creatorId + '"></div>' + street.creatorId + '</a>.' +
          '<br><button id="error-home">Go to the homepage</button>';
      break;
    case ERRORS.STREET_410_BUT_LINK_TO_USER:
      title = 'This street has been deleted.';
      description = 'There is no longer a street with this link, but you can look at other streets by ' +
          '<a href="/' + street.creatorId + '"><div class="avatar" userId="' + street.creatorId + '"></div>' + street.creatorId + '</a>.' +
          '<br><button id="error-home">Go to the homepage</button>';
      break;
    case ERRORS.SIGN_OUT:
      title = 'You are now signed out.';
      description = '<button id="error-sign-in">Sign in again</button> <button id="error-home">Go to the homepage</button>';
      break;
    case ERRORS.NO_STREET:
      title = 'No street selected.';
      break;
    case ERRORS.FORCE_RELOAD_SIGN_OUT:
      title = 'You signed out in another window.';
      description = 'Please reload this page before continuing.<br><button id="error-reload">Reload the page</button>';
      break;
    case ERRORS.FORCE_RELOAD_SIGN_OUT_401:
      title = 'You signed out in another window.';
      description = 'Please reload this page before continuing.<br>(Error RM2.)<br><button id="error-clear-sign-in-reload">Reload the page</button>';
      break;
    case ERRORS.FORCE_RELOAD_SIGN_IN:
      title = 'You signed in in another window.';
      description = 'Please reload this page before continuing.<br><button id="error-reload">Reload the page</button>';
      break;
    case ERRORS.STREET_DELETED_ELSEWHERE:
      title = 'This street has been deleted elsewhere.';
      description = 'This street has been deleted in another browser.<br><button id="error-home">Go to the homepage</button>';
      break;
    case ERRORS.NEW_STREET_SERVER_FAILURE:
      title = 'Having trouble…';
      description = 'We’re having trouble loading Streetmix.<br><button id="error-new">Try again</button>';
      break;
    case ERRORS.SIGN_IN_SERVER_FAILURE:
      title = 'Having trouble…';
      description = 'We’re having trouble loading Streetmix.<br>(Error 15A.)<br><button id="error-new">Try again</button>';
      break;
    case ERRORS.SIGN_IN_401:
      title = 'Having trouble…';
      description = 'We’re having trouble loading Streetmix.<br>(Error RM1.)<br><button id="error-new">Try again</button>';
      break;
    case ERRORS.STREET_DATA_FAILURE:
      title = 'Having trouble…';
      description = 'We’re having trouble loading Streetmix.<br>(Error 9B.)<br><button id="error-new">Try again</button>';
      break;
    case ERRORS.TWITTER_ACCESS_DENIED:
      title = 'You are not signed in.';
      description = 'You cancelled the Twitter sign in process.<br><button id="error-home">Go to the homepage</button>';
      break;
    case ERRORS.AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN:
    case ERRORS.AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN:
    case ERRORS.AUTH_PROBLEM_API_PROBLEM:
      title = 'There was a problem with signing you in.';
      // TODO const for feedback
      description = 'There was a problem with Twitter authentication. Please try again later or let us know via <a target="_blank" href="mailto:streetmix@codeforamerica.org">email</a> or <a target="_blank" href="https://twitter.com/intent/tweet?text=@streetmix">Twitter</a>.<br><button id="error-home">Go to the homepage</button>';
      break;
    case ERRORS.UNSUPPORTED_BROWSER:
      title = 'Streetmix doesn’t work on your browser… yet.';
      // TODO const for feedback
      description = 'Sorry about that. You might want to try <a target="_blank" href="http://www.google.com/chrome">Chrome</a>, <a target="_blank" href="http://www.mozilla.org/firefox">Firefox</a>, or Safari. <br><br>Are you on Internet Explorer? <a target="_blank" href="http://guidebook.streetmix.net/faq/#internet-explorer">Find out why IE is not supported.</a> <br><br>If you think your browser should be supported, please contact us via <a target="_blank" href="mailto:streetmix@codeforamerica.org">email</a>.';
      break;
    case ERRORS.CANNOT_CREATE_NEW_STREET_ON_PHONE:
      title = 'Streetmix works on tablets and desktops only.';
      description = 'If you follow another link to a specific street, you can view it on your phone – but you cannot yet create new streets.<br><button id="error-example">View an example street</button>';
      break;
    default: // also ERRORS.GENERIC_ERROR
      title = 'Something went wrong.';
      // TODO const for feedback
      description = 'We’re sorry – something went wrong. Please try again later or let us know via <a target="_blank" href="mailto:streetmix@codeforamerica.org">email</a> or <a target="_blank" href="https://twitter.com/intent/tweet?text=@streetmix">Twitter</a>.<br><button id="error-home">Go to the homepage</button>';
      break;
  }

  if (abortEverything) {
    // Opera
    _removeElFromDom(document.getElementById('gallery'));
  }

  if (navigator.userAgent.indexOf('MSIE 6.') != -1) {
    document.body.style.display = 'none';
    alert('Streetmix doesn’t work on your browser. Please update to a newer browser such as Chrome, Firefox, or Safari.');
    return;
  }

  document.getElementById('error-title').innerHTML = title;
  document.getElementById('error-description').innerHTML = description;

  var el = document.getElementById('error-home');
  if (el) {
    el.addEventListener('click', _goHome);
  }

  var el = document.getElementById('error-sign-in');
  if (el) {
    el.addEventListener('click', _goSignIn);
  }

  var el = document.getElementById('error-reload');
  if (el) {
    el && el.addEventListener('click', _goReload);
  }

  var el = document.getElementById('error-clear-sign-in-reload');
  if (el) {
    el.addEventListener('click', _goReloadClearSignIn);
  }

  var el = document.getElementById('error-new');
  if (el) {
    el.addEventListener('click', _goNewStreet);
  }

  var el = document.getElementById('error-example');
  if (el) {
    el.addEventListener('click', _goExampleStreet);
  }

  document.getElementById('error').className += ' visible';

  _fetchAvatars();

  currentErrorType = errorType;
}

function _hideError() {
  document.querySelector('#error').classList.remove('visible');

  currentErrorType = null;
}

function _showErrorFromUrl() {
  // TODO const
  switch (errorUrl) {
    case URL_ERROR_TWITTER_ACCESS_DENIED:
      var errorType = ERRORS.TWITTER_ACCESS_DENIED;
      break;
    case URL_ERROR_NO_TWITTER_REQUEST_TOKEN:
      var errorType = ERRORS.AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN;
      break;
    case URL_ERROR_NO_TWITTER_ACCESS_TOKEN:
      var errorType = ERRORS.AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN;
      break;
    case URL_ERROR_AUTHENTICATION_API_PROBLEM:
      var errorType = ERRORS.AUTH_PROBLEM_API_PROBLEM;
      break;
    default:
      var errorType = ERRORS.GENERIC_ERROR;
      break;
  }

  _showError(errorType, true);
}
