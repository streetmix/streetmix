/* eslint-env jest */
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import EnvironmentBadge from '../EnvironmentBadge'

describe('EnvironmentBadge', () => {
  afterEach(cleanup)

  it('renders nothing in standard conditions', () => {
    const wrapper = render(<EnvironmentBadge />)
    expect(wrapper.container.firstChild).toEqual(null)
  })

  it('renders a specific label if given', () => {
    const wrapper = render(<EnvironmentBadge label="foo" />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  // It's impossible (or very, very hard) in Jest to mock `ENV` (imported
  // from `../app/config`) to be different values across different tests.
  // Don't ask me why, it's Just The Way It Is (TM). So instead, we pass
  // in the intended value of `ENV` in the `env` prop. Now we just need to
  // ensure that `props.env` and `ENV` are always intended to do the same
  // thing in the implementation.
  it('renders correctly in development environment', () => {
    const wrapper = render(<EnvironmentBadge env="development" />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders correctly in staging environment', () => {
    const wrapper = render(<EnvironmentBadge env="staging" />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders correctly in sandbox environment', () => {
    const wrapper = render(<EnvironmentBadge env="sandbox" />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
