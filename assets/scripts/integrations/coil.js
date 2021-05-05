if (document.monetization) {
  document.monetizationExtensionInstalled = true
} else {
  document.monetization = document.createElement('div')
  document.monetization.state = 'stopped'
}

document.addEventListener(
  'load',
  document.coilMonetizationPolyfill.init({ btpToken: '{{btpToken}}' })
)
