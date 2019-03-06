/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Segment } from '../Segment'
import { getSegmentInfo, getSegmentVariantInfo } from '../info'
import { infoBubble } from '../../info_bubble/info_bubble'

jest.mock('../../app/routing')
jest.mock('../info')
jest.mock('../../streets/data_model', () => {})
jest.mock('../../info_bubble/info_bubble')

function connectDropTarget (el) { return el }
function connectDragSource (el) { return el }
const connectDragPreview = () => { }

describe('Segment', () => {
  const updateSegmentData = jest.fn()
  let segment = {}
  beforeEach(() => {
    getSegmentInfo.mockResolvedValue('test')
    getSegmentVariantInfo.mockResolvedValue({ name: 'test' })
  })
  describe('on mount', () => {
    it('updates the left position for this segment', () => {
      shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} />)
      expect(updateSegmentData).toHaveBeenCalledTimes(1)
    })
  })
  describe('if the segment variant is updated', () => {
    let updatePerspective
    beforeEach(() => {
      segment.variantString = 'variant'
      updatePerspective = jest.fn()
    })
    describe('variant is different', () => {
      it('updates perspective', () => {
        const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} updatePerspective={updatePerspective} />)
        wrapper.setProps({ segment: { variantString: 'other' } })
        expect(updatePerspective).toHaveBeenCalledTimes(4) // should probably only be 2
      })
    })
    it('updates the left position for this segment', () => {
      const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} updatePerspective={updatePerspective} />)
      wrapper.setProps({ segment: { variantString: 'other' } })
      expect(updateSegmentData).toHaveBeenCalledTimes(7) // should probably only be 1
    })
  })
  describe('shows the infobubble', () => {
    it('on inital render and segement is active', () => {
      shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} activeSegment={1} dataNo={1} />)
      expect(infoBubble.considerShowing).toHaveBeenCalledTimes(1)
    })
    it('when segment removing or dragging action ends', () => {
      const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} isDragging />)
      wrapper.setProps({ isDragging: false })
      expect(infoBubble.considerShowing).toHaveBeenCalledTimes(1)
    })
    it('when the mouseEnter is suppressed', () => {
      const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} suppressMouseEnter />)
      console.log('change mouse')
      wrapper.setProps({ suppressMouseEnter: false })
      expect(infoBubble.considerShowing).toHaveBeenCalledTimes(2) // should probably only be 1
    })
  })
  // ToDo: Snapshot test for
  // this.props.units
  // segment.warnings
  // this.props.activeSegment === this.props.dataNo
})
