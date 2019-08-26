/* eslint-env jest */

/**
 * The only functionality we care about from <Transition /> and <CSSTransition /> is the
 * `in` prop. If it's `true`, return children. If `false`, return `null`. If `in` prop
 * is not provided, assume it is injected by `TransitionGroup` and use the default
 * value of `true`.
 */
export const Transition = jest.fn(({ children, in: show = true }) => (show ? children : null))
export const CSSTransition = jest.fn(({ children, in: show = true }) => (show ? children : null))

/**
 * <TransitionGroup /> just returns its children.
 */
export const TransitionGroup = jest.fn(({ children }) => children)
