/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { mountWithIntl } from '../../../../test/helpers/intl-enzyme-test-helper.js'
import { ResizeGuides } from '../ResizeGuides'
import { TILE_SIZE } from '../constants'
import { getSegmentVariantInfo } from '../info'

jest.mock('../view', () => ({
  // Function returns a mock element with properties we need to read
  getSegmentEl: () => ({
    offsetLeft: 50,
    offsetWidth: 50
  })
}))

jest.mock('../info', () => ({
  // Function returns mock segment variant info of nothing
  // Specific tests can use `mockImplementation` to make it return other info
  getSegmentVariantInfo: jest.fn(() => ({}))
}))

describe('ResizeGuides', () => {
  it('does not render when nothing is being resized', () => {
    const wrapper = shallow(<ResizeGuides isResizing={false} />)
    expect(wrapper.html()).toEqual(null)
  })

  it('renders while segment is resizing', () => {
    const wrapper = mountWithIntl(<ResizeGuides isResizing segment={{}} />)
    expect(wrapper.html()).toEqual('<div class="segment-guides" style="left: 74px;"></div>')
  })

  it('renders min guide', () => {
    getSegmentVariantInfo.mockImplementationOnce(() => ({
      minWidth: 10
    }))

    const wrapper = mountWithIntl(<ResizeGuides isResizing segment={{}} />)
    expect(wrapper.find('.segment-guide-min').length).toEqual(1)
    expect(wrapper.find('.segment-guide-min-before').length).toEqual(1)
    expect(wrapper.find('.segment-guide-min-after').length).toEqual(1)
  })

  it('renders max guide when remaining width is large', () => {
    const maxWidth = 20
    getSegmentVariantInfo.mockImplementationOnce(() => ({ maxWidth }))

    // `remainingWidth` should be larger than `maxWidth`
    const wrapper = mountWithIntl(<ResizeGuides isResizing segment={{}} remainingWidth={30} />)

    // But width should be based on `maxWidth`, not `remainingWidth`
    const width = maxWidth * TILE_SIZE
    expect(wrapper.find('.segment-guide-max').first().props().style.width).toEqual(`${width}px`)

    // Also test that child elements are rendered
    expect(wrapper.find('.segment-guide-max-before').length).toEqual(1)
    expect(wrapper.find('.segment-guide-max-after').length).toEqual(1)
  })

  it('renders max guide when remaining width is small', () => {
    const maxWidth = 20
    getSegmentVariantInfo.mockImplementationOnce(() => ({ maxWidth }))

    // `remainingWidth` should be larger than `maxWidth`
    const remainingWidth = 1
    const wrapper = mountWithIntl(<ResizeGuides isResizing segment={{}} remainingWidth={remainingWidth} />)

    // But width should be based on `remainingWidth`, not `maxWidth`
    const width = remainingWidth * TILE_SIZE
    expect(wrapper.find('.segment-guide-max').first().props().style.width).toEqual(`${width}px`)
  })

  it('renders max guide with only remaining width', () => {
    const remainingWidth = 20
    const wrapper = mountWithIntl(<ResizeGuides isResizing segment={{}} remainingWidth={remainingWidth} />)

    // Width should be based on `remainingWidth`
    const width = remainingWidth * TILE_SIZE
    expect(wrapper.find('.segment-guide-max').first().props().style.width).toEqual(`${width}px`)
  })

  it('renders max and min guides', () => {
    getSegmentVariantInfo.mockImplementationOnce(() => ({
      minWidth: 10,
      maxWidth: 12
    }))

    const wrapper = mountWithIntl(<ResizeGuides isResizing segment={{}} />)
    expect(wrapper.find('.segment-guide-min').length).toEqual(1)
    expect(wrapper.find('.segment-guide-min-before').length).toEqual(1)
    expect(wrapper.find('.segment-guide-min-after').length).toEqual(1)
    expect(wrapper.find('.segment-guide-max').length).toEqual(1)
    expect(wrapper.find('.segment-guide-max-before').length).toEqual(1)
    expect(wrapper.find('.segment-guide-max-after').length).toEqual(1)
  })
})
