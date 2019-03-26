/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import {render, fireEvent, waitForElement, cleanup} from 'react-testing-library'

import { renderWithRedux } from '../../../../test/helpers/render'

import ConnectedSegment, { Segment } from '../Segment'
import { getSpriteDef, getSegmentInfo, getSegmentVariantInfo } from '../info'
//import { getVariantInfoDimensions } from '../view'
import { infoBubble } from '../../info_bubble/info_bubble'
import { SETTINGS_UNITS_IMPERIAL } from '../../users/constants'
import SEGMENT_INFO from '../info.json'
import {
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL,
  SEGMENT_WARNING_WIDTH_TOO_LARGE
} from '../constants'
import { images } from '../../app/load_resources'

jest.mock('../../app/load_resources')
jest.mock('../info')
jest.mock('../view', () => {
  const actual = jest.requireActual('../view')
  return {
    ...actual,
    getVariantInfoDimensions: jest.fn(() => ({ left: 0, right: 100, center: 50})),
  }
})
jest.mock('../../streets/data_model', () => {})

jest.mock('react-transition-group', () => {
  return {
    CSSTransition: jest.fn(({children, in: show}) => (show ? children : null))
  };
});
jest.mock('react-dnd', () => {
  return {
    DragSource: (d) => (jest.fn((e) => e)),
    DropTarget: (d) => (jest.fn((e) => e)),
  };
});

const mockFetchPromise = Promise.resolve({ // 3
});

function connectDropTarget (el) { return el }
function connectDragSource (el) { return el }
const connectDragPreview = () => { }

describe('Segment', () => {
  const updateSegmentData = jest.fn()
  let segment = {}
  beforeEach(() => {
    const variant = {}
    const segment = { name: 'Segment', nameKey: 'key', zIndex: 1 }
    getSegmentInfo.mockImplementation(() => segment)
    getSegmentVariantInfo.mockImplementation(() => variant)
    //getVariantInfoDimensions.mockImplementation(() => ({ left: 0, right: 100, center: 50}))
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
    it('when the mouseEnter is suppressed', () => {
      const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} suppressMouseEnter />)
      wrapper.setProps({ suppressMouseEnter: false })
      expect(infoBubble.considerShowing).toHaveBeenCalledTimes(2) // should probably only be 1
    })
  })
  it('renders the units correctly', () => {
    const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} units={SETTINGS_UNITS_IMPERIAL} cssTransform={'transform'} segmentPos={1} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders active segment correctly', () => {
    const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} isDragging={false} dataNo={10} activeSegment={10} cssTransform={'transform'} segmentPos={1} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders segment warnings outside correctly', () => {
    segment.warnings = {}
    segment.warnings[SEGMENT_WARNING_OUTSIDE] = 'warning'
    const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} isDragging={false} dataNo={10} activeSegment={10} cssTransform={'transform'} segmentPos={1} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders segment warnings correctly', () => {
    segment.warnings = {}
    segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = 'warning'
    const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} isDragging={false} dataNo={10} activeSegment={10} cssTransform={'transform'} segmentPos={1} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders segment warnings width too large correctly', () => {
    segment.warnings = {}
    segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = 'warning'
    const wrapper = shallow(<Segment connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} segment={segment} actualWidth={1} updateSegmentData={updateSegmentData} connectDragPreview={connectDragPreview} isDragging={false} dataNo={10} activeSegment={10} cssTransform={'transform'} segmentPos={1} />)
    expect(wrapper).toMatchSnapshot()
  })
  it.only('renders correctly with deep render', async () => {
    const variantString = 'inbound|regular'
    const type = 'streetcar'
    const variant = SEGMENT_INFO[type].details[variantString]
    getSegmentVariantInfo.mockImplementation(() => variant)
    getSpriteDef.mockImplementation(() => ({ id: 'markings--straight-inbound', width: 4, offsetY: 11.12 }))
    //getSpriteDef should either be unmocked or be defined
    segment =  { type , variantString , segmentType: type, id: '1', width: 400 , randSeed: 1 }
    const wrapper = renderWithRedux(<ConnectedSegment connectDragSource={connectDragSource} connectDropTarget={connectDropTarget} segment={segment} actualWidth={400} updateSegmentData={jest.fn()} connectDragPreview={jest.fn()}/>, { initialState: { ui: { activeSegment: 0}, street: { segments: [segment]}}})
    wrapper.debug()
  })
})
