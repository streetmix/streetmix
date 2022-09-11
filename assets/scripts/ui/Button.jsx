/**
 * A button component for buttons styled to be UI buttons.
 * This is a shift from how we have defined buttons in the past,
 * which are just the same as HTML <button>s or <a> elements with
 * button-like properties. This component should be able to handle
 * both, and we're making <Button> separate from <button> so that
 * the <button> can be used for situations where semantically or
 * for accessibility you need <button> mechanics without being
 * styled like a <Button>.
 */
import React from 'react'
import PropTypes from 'prop-types'
import './Button.scss'

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  // Most buttons are "button" type and sometimes it's "submit".
  // We can use this and default prop values to always set button
  // type when omitted.
  type: PropTypes.oneOf(['button', 'submit']),
  // Note: while in theory these are mutually exclusive, nothing enforces it
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  tertiary: PropTypes.bool
}

function Button ({
  children,
  className = '',
  type = 'button',
  primary,
  secondary,
  tertiary,
  ...props
}) {
  const classNames = ['btn']
  if (primary) {
    classNames.push('btn-primary')
  }
  if (secondary) {
    classNames.push('btn-secondary')
  }
  if (tertiary) {
    classNames.push('btn-tertiary')
  }
  if (className) {
    classNames.push(className)
  }

  return (
    <button type={type} className={classNames.join(' ')} {...props}>
      {children}
    </button>
  )
}

export default Button
