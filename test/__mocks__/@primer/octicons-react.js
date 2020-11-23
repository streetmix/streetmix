/**
 * Mocks @primer/octicons-react to return a simple, empty <svg> element
 * with the correct class name for the given `icon` prop. We use this to keep
 * full<svg> content out of our test snapshots.
 */
import React from 'react'
import PropTypes from 'prop-types'
import * as Icons from '@primer/octicons-react'

Mockticon.propTypes = {
  // icon: PropTypes.string.isRequired,
  className: PropTypes.string
}

export function Mockticon (props) {
  const { className = 'octicon' } = props

  return <svg className={className} />
}

// We use a `Proxy` object to override all named exports from the octicons
// module with our mock implementation. The `module.exports` syntax allows
// us to make a dynamic export, instead of a static one that the ES6 `export`
// requires. The `__esModule` property is a special case that should not be
// overridden. All other export names are replaced with a mock Octicon, or a
// "Mockticon" ;-)
module.exports = new Proxy(Icons, {
  get: (key) =>
    key === '__esModule' ? true : (props) => <Mockticon {...props} />
})
