/* eslint-env jest */
import React from 'react'

/**
 * The only functionality we care about from <Transition /> and
 * <CSSTransition /> is the `in` prop. If it's `true`, return children.
 * If `false`, return `null`.
 */
export const Transition = jest.fn(({ children, in: show }) =>
  show ? children : null
)
export const CSSTransition = jest.fn(({ children, in: show }) =>
  show ? children : null
)

/**
 * <TransitionGroup /> returns its children and adds the `in` prop to them.
 * This assumes that all children are <Transition /> or <CSSTransition />
 * components.
 */
export const TransitionGroup = jest.fn(({ children }) =>
  React.Children.map(children, (child) =>
    React.cloneElement(child, { in: true })
  )
)
