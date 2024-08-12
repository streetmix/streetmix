/**
 * A button component for UI buttons, or links styled to look like UI buttons.
 *
 * Sometimes you want a button to open a link, but it's better to use anchor
 * elements instead (e.g. it gives a user the choice to open in another tab.)
 * This component can conditionally render either a <button> or <a>.
 *
 * We do not globally override <button> styles because they can be used
 * semantically, in situations where we want built-in features like
 * focusability, events handling, etc. but they should not look like stylized
 * UI buttons.
 */
import React, { forwardRef } from 'react'

import './Button.css'

interface ButtonProps
  extends Partial<
  React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>
  > {
  children?: React.ReactNode
  className?: string
  type?: 'button' | 'submit'
  href?: string
  // Warning: while in theory these are mutually exclusive,
  // nothing enforces it!
  primary?: boolean
  secondary?: boolean
  tertiary?: boolean
}

const Button = forwardRef(
  (
    {
      children,
      className = '',
      type = 'button',
      href = '',
      primary = false,
      secondary = false,
      tertiary = false,
      ...props
    }: ButtonProps,
    ref: React.Ref<HTMLButtonElement | HTMLAnchorElement>
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

    // If `href` is present, return an anchor element.
    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classNames.join(' ')}
          {...props}
        >
          {children}
        </a>
      )
    }

    // Otherwise, use a button element.
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={classNames.join(' ')}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
