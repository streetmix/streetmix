import Cookies from 'js-cookie'

if (document.monetization) {
  document.monetizationExtensionInstalled = true
} else {
  document.monetization = document.createElement('div')
  document.monetization.state = 'stopped'
}

document.addEventListener(
  'load',
  document.coilMonetizationPolyfill.init({ btpToken: passToken() })
)

function passToken () {
  const cookies = Cookies.get()
  if (cookies.btpToken !== undefined) {
    const btpToken = cookies.btpToken
    return btpToken
  } else {
    return null
  }
}
