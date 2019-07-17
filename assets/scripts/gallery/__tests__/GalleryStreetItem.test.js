/* eslint-env jest */
import React from 'react'
import { mountWithIntl as mount } from '../../../../test/helpers/intl-enzyme-test-helper.js'
import { GalleryStreetItemWithIntl as GalleryStreetItem } from '../GalleryStreetItem'

// Mock dependencies
jest.mock('../thumbnail', () => {
  return {
    drawStreetThumbnail: jest.fn()
  }
})
jest.mock('../../app/page_url', () => {
  return {
    getStreetUrl: jest.fn()
  }
})

const MOCK_STREET_DATA = {
  data: {},
  creatorId: 'foo',
  updatedAt: '2018-04-27T20:47:03.477Z'
}

describe('GalleryStreetItem', () => {
  it('renders without crashing', () => {
    // Mounting is required to test that a canvas element will be rendered correctly
    // This also uses jsdom + canvas packages under the hood
    const wrapper = mount(<GalleryStreetItem street={MOCK_STREET_DATA} />)

    expect(wrapper.exists()).toEqual(true)
  })

  it('displays street owner', () => {
    const wrapper = mount(<GalleryStreetItem street={MOCK_STREET_DATA} />)

    expect(wrapper.find('.gallery-street-item-creator').text()).toEqual('foo')
  })

  it('does not display street owner when specified', () => {
    const wrapper = mount(
      <GalleryStreetItem
        street={MOCK_STREET_DATA}
        showStreetOwner={false}
      />)

    expect(wrapper.find('.gallery-street-item-creator').length).toEqual(0)
  })

  it('handles select', () => {})
  it('handles delete', () => {})
})
