// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

const whitelist = (xhr) => {
  // this function receives the xhr object in question and
  // will whitelist if it's a GET that appears to be a static resource
  return xhr.method === 'GET' && /\.(jsx?|html|css|svg|ttf)(\?.*)?$/.test(xhr.url)
}

Cypress.Server.defaults({
  delay: 500,
  force404: false,
  whitelist: whitelist
})

// Alternatively you can use CommonJS syntax:
// require('./commands')
