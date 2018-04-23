/* eslint-env jest */
import React from 'react'
import { mountWithIntl } from '../../../../test/helpers/intl-enzyme-test-helper.js'
import { mockIntl } from '../../../../test/__mocks__/react-intl'
import { GalleryStreetItem } from '../GalleryStreetItem'

// Mock dependencies
jest.mock('../thumbnail', () => {
  return {
    drawStreetThumbnail: jest.fn()
  }
})
jest.mock('../../streets/data_model', () => {
  return {
    getStreetUrl: jest.fn()
  }
})

const MOCK_STREET_DATA = {
  data: {},
  creatorId: 'foo'
}

describe('GalleryStreetItem', () => {
  it('renders without crashing', () => {
    // Mounting is required to test that a canvas element will be rendered correctly
    // This also uses jsdom + canvas packages under the hood
    const wrapper = mountWithIntl(
      <GalleryStreetItem
        street={MOCK_STREET_DATA}
        intl={mockIntl}
      />)

    expect(wrapper.exists()).toEqual(true)
  })
})
