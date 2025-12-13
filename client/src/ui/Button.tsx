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
import React from 'react'

import './Button.css'

interface ButtonBaseProps {
  primary?: boolean
  secondary?: boolean
  tertiary?: boolean
}

// Buttons can allow all attributes of <button> element
interface ButtonInputProps
  extends ButtonBaseProps, React.ComponentPropsWithRef<'button'> {
  href?: undefined // Error if `href` is provided to buttons
}

// ...or buttons can allow all attributes of <a> element
interface ButtonLinkProps
  extends ButtonBaseProps, React.ComponentPropsWithRef<'a'> {
  type: 'link'
  href: string
}

// Button is either <button> or <a>, discriminated by `type` prop if present
type ButtonProps = ButtonInputProps | ButtonLinkProps

export function Button(props: ButtonProps) {
  const classNames = ['btn']
  const { primary, secondary, tertiary, className, ...restProps } = props
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

  // If Button type is intended to be a link, return an anchor element.
  if (restProps.type === 'link') {
    const { ref, type, href, children, ...moreProps } = restProps
    return (
      <a ref={ref} href={href} className={classNames.join(' ')} {...moreProps}>
        {children}
      </a>
    )
  }

  // Otherwise, use a button element.
  const { ref, type = 'button', children, ...moreProps } = restProps
  return (
    <button
      ref={ref}
      type={type}
      className={classNames.join(' ')}
      {...moreProps}
    >
      {children}
    </button>
  )
}
