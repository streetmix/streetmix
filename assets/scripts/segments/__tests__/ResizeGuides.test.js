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
    const wrapper = shallow(<ResizeGuides isVisible={false} />)
    expect(wrapper.html()).toEqual(null)
  })

  it('renders while segment is resizing', () => {
    const wrapper = mountWithIntl(<ResizeGuides isVisible segment={{}} />)
    expect(wrapper.html()).toEqual('<div class="resize-guides" style="left: 74px;"></div>')
  })

  it('renders min guide', () => {
    getSegmentVariantInfo.mockImplementationOnce(() => ({
      minWidth: 10
    }))

    const wrapper = mountWithIntl(<ResizeGuides isVisible segment={{}} />)
    expect(wrapper.find('.resize-guide-min').length).toEqual(1)
    expect(wrapper.find('.resize-guide-min-before').length).toEqual(1)
    expect(wrapper.find('.resize-guide-min-after').length).toEqual(1)
  })

  it('renders max guide when remaining width is large', () => {
    const maxWidth = 20
    getSegmentVariantInfo.mockImplementationOnce(() => ({ maxWidth }))

    // `remainingWidth` should be larger than `maxWidth`
    const wrapper = mountWithIntl(<ResizeGuides isVisible segment={{}} remainingWidth={30} />)

    // But width should be based on `maxWidth`, not `remainingWidth`
    const width = maxWidth * TILE_SIZE
    expect(wrapper.find('.resize-guide-max').first().props().style.width).toEqual(`${width}px`)

    // Also test that child elements are rendered
    expect(wrapper.find('.resize-guide-max-before').length).toEqual(1)
    expect(wrapper.find('.resize-guide-max-after').length).toEqual(1)
  })

  it('renders max guide when remaining width is small', () => {
    const maxWidth = 20
    getSegmentVariantInfo.mockImplementationOnce(() => ({ maxWidth }))

    // `remainingWidth` should be smaller than `maxWidth`
    // `segment` is given a `width` property so that calculations can be performed
    const remainingWidth = 1
    const segmentWidth = 1
    const wrapper = mountWithIntl(<ResizeGuides isVisible segment={{ width: segmentWidth }} remainingWidth={remainingWidth} />)

    // Width should be based on `remainingWidth` + `segmentWidth`, not `maxWidth`
    const width = (remainingWidth + segmentWidth) * TILE_SIZE
    expect(wrapper.find('.resize-guide-max').first().props().style.width).toEqual(`${width}px`)
  })

  it('renders max guide with only remaining width', () => {
    const remainingWidth = 19
    const segmentWidth = 1
    const wrapper = mountWithIntl(<ResizeGuides isVisible segment={{ width: segmentWidth }} remainingWidth={remainingWidth} />)

    // Width should be based on `remainingWidth` + `segmentWidth`
    const width = (remainingWidth + segmentWidth) * TILE_SIZE
    expect(wrapper.find('.resize-guide-max').first().props().style.width).toEqual(`${width}px`)
  })

  it('renders max and min guides', () => {
    getSegmentVariantInfo.mockImplementationOnce(() => ({
      minWidth: 10,
      maxWidth: 12
    }))

    const wrapper = mountWithIntl(<ResizeGuides isVisible segment={{}} />)
    expect(wrapper.find('.resize-guide-min').length).toEqual(1)
    expect(wrapper.find('.resize-guide-min-before').length).toEqual(1)
    expect(wrapper.find('.resize-guide-min-after').length).toEqual(1)
    expect(wrapper.find('.resize-guide-max').length).toEqual(1)
    expect(wrapper.find('.resize-guide-max-before').length).toEqual(1)
    expect(wrapper.find('.resize-guide-max-after').length).toEqual(1)
  })
})
