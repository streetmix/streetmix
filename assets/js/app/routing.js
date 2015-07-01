// TODO replace the URLs in index.html dynamically
var URL_SIGN_IN = 'twitter-sign-in'

var URL_SIGN_IN_CALLBACK_ABS =
location.protocol + '//' + location.host + URL_SIGN_IN_CALLBACK_REL
var URL_SIGN_IN_CALLBACK = URL_SIGN_IN_CALLBACK_REL.replace(/^\//, '')

var URL_JUST_SIGNED_IN_REL = '/just-signed-in'
var URL_JUST_SIGNED_IN_ABS =
location.protocol + '//' + location.host + URL_JUST_SIGNED_IN_REL
var URL_JUST_SIGNED_IN = URL_JUST_SIGNED_IN_REL.replace(/^\//, '')

var URL_JUST_SIGNED_IN = 'just-signed-in' // TODO fix this
var URL_NEW_STREET = 'new'
var URL_NEW_STREET_COPY_LAST = 'copy-last'
var URL_GLOBAL_GALLERY = 'gallery'
var URL_LOCALES = 'locales'
var URL_ERROR = 'error'
var URL_NO_USER = '-'
var URL_HELP = 'help'
var URL_ABOUT = 'about'
var URL_HELP_ABOUT = '/' + URL_HELP + '/' + URL_ABOUT

var URL_ERROR_TWITTER_ACCESS_DENIED = 'twitter-access-denied'
var URL_ERROR_NO_TWITTER_REQUEST_TOKEN = 'no-twitter-request-token'
var URL_ERROR_NO_TWITTER_ACCESS_TOKEN = 'no-twitter-access-token'
var URL_ERROR_AUTHENTICATION_API_PROBLEM = 'authentication-api-problem'

var URL_EXAMPLE_STREET = 'streetmix/7'

var URL_SIGN_IN_REDIRECT = URL_SIGN_IN + '?callbackUri=' +
  URL_SIGN_IN_CALLBACK_ABS + '&redirectUri=' + URL_JUST_SIGNED_IN_ABS

// Since URLs like “streetmix.net/new” are reserved, but we still want
// @new to be able to use Streetmix, we prefix any reserved URLs with ~
var RESERVED_URLS =
[URL_SIGN_IN, URL_SIGN_IN_CALLBACK,
  URL_NEW_STREET, URL_NEW_STREET_COPY_LAST,
  URL_JUST_SIGNED_IN,
  URL_LOCALES,
  URL_HELP, URL_GLOBAL_GALLERY, URL_ERROR, 'streets']
var URL_RESERVED_PREFIX = '~'

function _goReload () {
  location.reload()
}

function _goHome () {
  location.href = '/'
}

function _goNewStreet (sameWindow) {
  if (sameWindow) {
    location.replace('/' + URL_NEW_STREET)
  } else {
    location.href = '/' + URL_NEW_STREET
  }
}

function _goExampleStreet () {
  location.href = '/' + URL_EXAMPLE_STREET
}

function _goCopyLastStreet () {
  location.href = '/' + URL_NEW_STREET_COPY_LAST
}

function _goSignIn () {
  location.href = '/' + URL_SIGN_IN_REDIRECT
}
