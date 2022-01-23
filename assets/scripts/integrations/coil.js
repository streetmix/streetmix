import Cookies from 'js-cookie'
import jwtDecode from 'jwt-decode'

export function initCoil () {
  // Run this if browser has the monetization plugin installed. Logged-in
  // users will automatically get subscription benefits regardless of any
  // connected monetization providers
  if (document.monetization) {
    document.monetizationExtensionInstalled = true
    document.monetization.addEventListener('monetizationstart', () => {
      console.log('monetization start!')
    })
    // Otherwise, create a placeholder monetization object. The Coil OAuth Web
    // Monetization (OWM) script relies on this.
  } else {
    document.monetization = document.createElement('div')
    document.monetization.state = 'stopped'
  }

  const btpToken = Cookies.get('btpToken')
  if (btpToken) {
    try {
      const jwt = jwtDecode(btpToken)
      console.log(jwt)
      console.log('issued at ' + new Date(jwt.iat * 1000))
      console.log('expires at ' + new Date(jwt.exp * 1000))
      document.coilMonetizationPolyfill.init({ btpToken })

      // The btpToken lasts about 30 minutes, so every 30 minutes, refresh the token
      // Note: a btpToken is a JSON Web Token (JWT) and contains the `iat` (issued
      // at) from `exp` (expires at) values. We may be able to fine-tune the refresh
      // timer by subtracting `iat` from `exp` and setting timeouts instead of a
      // fixed interval. This might be considered for later optimization.
      window.setInterval(function () {
        document.coilMonetizationPolyfill.refreshBtpToken(btpToken)
      }, 1800000)
    } catch (err) {
      console.error('caught error doing token stuff', err)
    }
  }
}
