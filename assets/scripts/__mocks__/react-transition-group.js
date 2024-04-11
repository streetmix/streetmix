import React from 'react'
import { vi } from 'vitest'

/**
 * The only functionality we care about from <Transition /> and
 * <CSSTransition /> is the `in` prop. If it's `true`, return children.
 * If `false`, return `null`.
 */
export const Transition = vi.fn(({ children, in: show }) =>
  show ? children : null
)
export const CSSTransition = vi.fn(({ children, in: show }) =>
  show ? children : null
)

/**
 * <TransitionGroup /> returns its children and adds the `in` prop to them.
 * This assumes that all children are <Transition /> or <CSSTransition />
 * components.
 */
export const TransitionGroup = vi.fn(({ children }) =>
  React.Children.map(children, (child) =>
    React.cloneElement(child, { in: true })
  )
)
