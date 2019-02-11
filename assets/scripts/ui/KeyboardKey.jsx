import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './KeyboardKey.scss'

const KeyboardKey = (props) => {
  if (props.icon && props.label) {
    // The `title` property on <kbd> is suggested to provide
    // accessible text for the icon being displayed.
    return (
      <kbd
        className="key key-icon"
        title={props.label}
      >
        <FontAwesomeIcon icon={props.icon} />
      </kbd>
    )
  }

  // A `title` property is not required here because the
  // child elements provide their own text
  return (
    <kbd className="key">
      {props.children}
    </kbd>
  )
}

KeyboardKey.propTypes = {
  children: PropTypes.any,
  label: PropTypes.string,
  icon: PropTypes.string
}

export default KeyboardKey
