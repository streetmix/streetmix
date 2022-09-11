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

const Button = React.forwardRef(
  (
    {
      children,
      className = '',
      type = 'button',
      href,
      primary,
      secondary,
      tertiary,
      ...props
    },
    ref
  ) => {
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

    // If this is present, return an <a> element instead that looks like
    // a button. Not sure if this is something we should continue to use
    // but it's been around forever
    if (href) {
      classNames.push('btn-like')

      return (
        <a ref={ref} href={href} className={classNames.join(' ')} {...props}>
          {children}
        </a>
      )
    }

    return (
      <button ref={ref} type={type} className={classNames.join(' ')} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  // Most buttons are "button" type and sometimes it's "submit".
  // We can use this and default prop values to always set button
  // type when omitted.
  type: PropTypes.oneOf(['button', 'submit']),
  href: PropTypes.string,
  // Note: while in theory these are mutually exclusive, nothing enforces it
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  tertiary: PropTypes.bool
}

export default Button
