/* global URL_NEW_STREET, URL_EXAMPLE_STREET, URL_NEW_STREET_COPY_LAST, URL_SIGN_IN_REDIRECT */
// Split from js/app/routing
// TODO: Gradually migrate the rest of it here

export function goReload () {
  window.location.reload()
}

export function goHome () {
  window.location.href = '/'
}

export function goNewStreet (sameWindow) {
  if (sameWindow) {
    window.location.replace('/' + URL_NEW_STREET)
  } else {
    window.location.href = '/' + URL_NEW_STREET
  }
}

export function goExampleStreet () {
  window.location.href = '/' + URL_EXAMPLE_STREET
}

// NOTE: This does not seem to be used anywhere
export function goCopyLastStreet () {
  window.location.href = '/' + URL_NEW_STREET_COPY_LAST
}

export function goSignIn () {
  window.location.href = '/' + URL_SIGN_IN_REDIRECT
}
