/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import EnvironmentBadge from '../EnvironmentBadge'

describe('EnvironmentBadge', () => {
  it('renders nothing in standard conditions', () => {
    const wrapper = shallow(<EnvironmentBadge />)
    expect(wrapper.text()).toEqual('')
  })

  it('displays a specific label if given', () => {
    const wrapper = shallow(<EnvironmentBadge label="foo" />)
    expect(wrapper.text()).toEqual('foo')
  })

  it.skip('displays correctly in development environment', () => {
    // This doesn't work
    jest.mock('../../app/config', () => ({
      ENV: 'development'
    }))

    const wrapper = shallow(<EnvironmentBadge />)
    expect(wrapper.text()).toEqual('Dev')
    expect(wrapper.find('.environment-label-development').length).toEqual(1)
  })

  it.skip('displays correctly in staging environment', () => {
    // This doesn't work
    jest.mock('../../app/config', () => ({
      ENV: 'staging'
    }))

    const wrapper = shallow(<EnvironmentBadge />)
    expect(wrapper.text()).toEqual('Staging')
    expect(wrapper.find('.environment-label-staging').length).toEqual(1)
  })

  it.skip('displays correctly in sandbox environment', () => {
    // This doesn't work
    jest.mock('../../app/config', () => ({
      ENV: 'sandbox'
    }))

    const wrapper = shallow(<EnvironmentBadge />)
    expect(wrapper.text()).toEqual('Sandbox')
    expect(wrapper.find('.environment-label-sandbox').length).toEqual(1)
  })
})
