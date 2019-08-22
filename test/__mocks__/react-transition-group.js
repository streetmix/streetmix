/* eslint-env jest */

export const Transition = jest.fn((props) => props.in ? props.children : null)
export const CSSTransition = jest.fn((props) => props.in ? props.children : null)
export const TransitionGroup = jest.fn(({ children }) => children)
