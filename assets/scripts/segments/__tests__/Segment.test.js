/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Segment } from '../Segment'
import { getSegmentInfo, getSegmentVariantInfo } from '../info'
import { infoBubble } from '../../info_bubble/info_bubble'
import { SETTINGS_UNITS_IMPERIAL } from '../../users/constants'
import {
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL,
  SEGMENT_WARNING_WIDTH_TOO_LARGE
} from '../constants'

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
    const variant = { }
    const segment = { name: 'Segment', nameKey: 'key', zIndex: 1 }
    getSegmentInfo.mockImplementation(() => segment)
    getSegmentVariantInfo.mockImplementation(() => variant)
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
    it('when segment removing or dragging action ends', () => {
      const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} isDragging />)
      wrapper.setProps({ isDragging: false })
      expect(infoBubble.considerShowing).toHaveBeenCalledTimes(1)
    })
  })
  it('renders the units correctly', () => {
    const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} units={SETTINGS_UNITS_IMPERIAL} segmentPos={1} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders active segment correctly', () => {
    const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} isDragging={false} dataNo={10} activeSegment={10} segmentPos={1} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders segment warnings outside correctly', () => {
    segment.warnings = {}
    segment.warnings[SEGMENT_WARNING_OUTSIDE] = 'warning'
    const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} isDragging={false} dataNo={10} activeSegment={10} segmentPos={1} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders segment warnings correctly', () => {
    segment.warnings = {}
    segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = 'warning'
    const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} isDragging={false} dataNo={10} activeSegment={10} segmentPos={1} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders segment warnings width too large correctly', () => {
    segment.warnings = {}
    segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = 'warning'
    const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} isDragging={false} dataNo={10} activeSegment={10} segmentPos={1} />)
    expect(wrapper).toMatchSnapshot()
  })
})
