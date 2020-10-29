import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './KeyboardKey.scss'

KeyboardKey.propTypes = {
  children: PropTypes.any,
  icon: PropTypes.object
}

function KeyboardKey ({ icon, children }) {
  if (icon) {
    // The `title` property on <kbd> is suggested to provide
    // accessible text for the icon being displayed. In this
    // case we use the `children` prop as the `title`, which
    // means it's necessary for this to be a simple string content
    // and not a React component
    return (
      <kbd className="key key-icon" title={children}>
        <FontAwesomeIcon icon={icon} />
      </kbd>
    )
  }

  // A `title` property is not required here because the
  // child elements provide their own text
  return <kbd className="key">{children}</kbd>
}

export default KeyboardKey
