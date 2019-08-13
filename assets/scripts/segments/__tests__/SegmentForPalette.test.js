/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { createIntl, createIntlCache } from 'react-intl'
import { SegmentForPalette } from '../SegmentForPalette'
import { getSegmentInfo, getSegmentVariantInfo } from '../info'
import { getVariantInfoDimensions } from '../view'

jest.mock('../../streets/data_model', () => {})
jest.mock('../info')
jest.mock('../view')

function connectDropTarget (el) { return el }
function connectDragSource (el) { return el }

describe('SegmentForPalette', () => {
  const connectDragPreview = jest.fn()

  const cache = createIntlCache()
  const intl = createIntl({
    locale: 'en',
    messages: {}
  }, cache)

  beforeEach(() => {
    const dimensions = { left: 100, right: 200 }
    getVariantInfoDimensions.mockImplementation(() => dimensions)
  })
  describe('on mount', () => {
    it('connects to drag', () => {
      shallow(<SegmentForPalette connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} connectDragPreview={connectDragPreview} type={''} variantString={''} intl={intl} randSeed={42} />)
      expect(connectDragPreview).toHaveBeenCalledTimes(1)
    })
  })
  it('renders width correctly depending on the dimension', () => {
    const wrapper = shallow(<SegmentForPalette connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} connectDragPreview={connectDragPreview} type={''} variantString={''} intl={intl} randSeed={42} />)
    expect(wrapper).toMatchSnapshot()
  })
  describe('mouseover', () => {
    it('calls onPointerOver with Variant name', () => {
      const onPointerOver = jest.fn()
      const event = { target: { getBoundingClientRect: () => 1 } }
      const variant = { name: 'Variant' }
      const segment = { nameKey: 'key' }
      getSegmentInfo.mockImplementation(() => segment)
      getSegmentVariantInfo.mockImplementation(() => variant)
      const wrapper = shallow(<SegmentForPalette connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} connectDragPreview={connectDragPreview} type={''} variantString={''} intl={intl} onPointerOver={onPointerOver} randSeed={42} />)
      wrapper.simulate('pointerover', event)
      expect(onPointerOver).toHaveBeenCalledTimes(1)
      expect(onPointerOver).toHaveBeenCalledWith(event, 'Variant', 1)
    })
    it('calls onPointerOver with Segment name', () => {
      const onPointerOver = jest.fn()
      const event = { target: { getBoundingClientRect: () => 1 } }
      const variant = { }
      const segment = { name: 'Segment', nameKey: 'key' }
      getSegmentInfo.mockImplementation(() => segment)
      getSegmentVariantInfo.mockImplementation(() => variant)
      const wrapper = shallow(<SegmentForPalette connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} connectDragPreview={connectDragPreview} type={''} variantString={''} intl={intl} onPointerOver={onPointerOver} randSeed={42} />)
      wrapper.simulate('pointerover', event)
      expect(onPointerOver).toHaveBeenCalledTimes(1)
      expect(onPointerOver).toHaveBeenCalledWith(event, 'Segment', 1)
    })
  })
})
