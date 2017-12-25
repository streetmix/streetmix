/* eslint-env jest */
import React from 'react'
import { mount } from 'enzyme'
import Avatar from '../Avatar'

describe('Avatar', () => {
  it.skip('shows avatar image', () => {
    window.fetch.mockResponse('')

    const component = mount(<Avatar userId="foo" />)
    // expect(component.state('image')).toEqual(null)

    window.fetch.resetMocks()
  })

  /**
   * Successful fetch request, but response is not an image
   */
  it('shows a placeholder image if the avatar image is not a valid image file', () => {
    window.fetch.mockResponse(JSON.stringify({ foo: 'bar' }))
    const component = mount(<Avatar userId="foo" />)

    // Component should not store any value for the image url
    expect(component.state('image')).toEqual(null)

    // Component should include a class to render placeholder image
    expect(component.find('div').instance().className).toContain('avatar-blank')

    window.fetch.resetMocks()
  })

  /**
   * Failed fetch request
   */
  it('shows a placeholder image if the avatar image fails to fetch', () => {
    window.fetch.mockReject(new Error('like 404 or smth'))
    const component = mount(<Avatar userId="bar" />)

    // Component should not store any value for the image url
    expect(component.state('image')).toEqual(null)

    // Component should include a class to render placeholder image
    expect(component.find('div').instance().className).toContain('avatar-blank')

    window.fetch.resetMocks()
  })
})
