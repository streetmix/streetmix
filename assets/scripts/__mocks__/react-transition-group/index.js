/* eslint-env jest */

export const CSSTransition = jest.fn(({ children, in: show }) => (show ? children : null))
export const TransitionGroup = jest.fn(({ children }) => (children))
export const Transition = jest.fn(({ children }) => (children))
