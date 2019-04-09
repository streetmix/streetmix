/* eslint-env jest */
import React from 'react'
import { fireEvent, getByTestId, cleanup } from 'react-testing-library'

import { renderWithRedux } from '../../../../test/helpers/render'

import ConnectedSegment from '../Segment'
import { getSpriteDef, getSegmentInfo, getSegmentVariantInfo } from '../info'
// import { getVariantInfoDimensions } from '../view'
import { infoBubble } from '../../info_bubble/info_bubble'
import SEGMENT_INFO from '../info.json'
import { KEYS } from '../../app/keys'
import { setLastStreet } from '../../streets/data_model'

jest.mock('../../app/load_resources')
jest.mock('../info')
jest.mock('../view', () => {
  const actual = jest.requireActual('../view')
  return {
    ...actual,
    getVariantInfoDimensions: jest.fn(() => ({ left: 0, right: 100, center: 50 }))
  }
})
jest.mock('../../app/routing', () => {})

jest.mock('react-transition-group', () => {
  return {
    CSSTransition: jest.fn(({ children, in: show }) => (show ? children : null))
  }
})
jest.mock('react-dnd', () => {
  return {
    DragSource: (d) => (jest.fn((e) => e)),
    DropTarget: (d) => (jest.fn((e) => e))
  }
})
jest.mock('../../info_bubble/info_bubble')

function connectDropTarget (el) { return el }
function connectDragSource (el) { return el }

describe('Segment', () => {
  let variantString, type, variant, currentWidth, increment, activeElement, segment
  beforeEach(() => {
    variantString = 'inbound|regular'
    type = 'streetcar'
    variant = SEGMENT_INFO[type].details[variantString]
    currentWidth = 200
    increment = 1
    activeElement = 0
    segment = { type, variantString, segmentType: type, id: '1', width: currentWidth, randSeed: 1 }
    const segmentInfo = { name: 'Segment', nameKey: 'key', zIndex: 1 }
    getSegmentInfo.mockImplementation(() => segmentInfo)
    getSegmentVariantInfo.mockImplementation(() => variant)
    getSpriteDef.mockImplementation(() => ({ id: 'markings--straight-inbound', width: 4, offsetY: 11.12 }))
  })
  afterEach(cleanup)
  it('renders correctly', () => {
    const wrapper = renderWithRedux(<ConnectedSegment connectDragSource={connectDragSource} connectDropTarget={connectDropTarget} segment={segment} actualWidth={currentWidth} dataNo={activeElement} updateSegmentData={jest.fn()} connectDragPreview={jest.fn()} />, { initialState: { ui: { activeSegment: activeElement, unitSettings: { resolution: 1, clickIncrement: 1 } }, street: { segments: [segment] } } })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
  // maybe test this with StreetEditable as well
  it('updates the left position for this segment', () => {
    const updateSegmentData = jest.fn()
    renderWithRedux(<ConnectedSegment connectDragSource={connectDragSource} connectDropTarget={connectDropTarget} segment={segment} actualWidth={currentWidth} dataNo={activeElement} updateSegmentData={updateSegmentData} connectDragPreview={jest.fn()} />, { initialState: { ui: { activeSegment: activeElement, unitSettings: { resolution: 1, clickIncrement: 1 } }, street: { segments: [segment] } } })
    expect(updateSegmentData).toHaveBeenCalledTimes(1)
  })
  it('shows the info bubble on mouseover', () => {
    const wrapper = renderWithRedux(<ConnectedSegment connectDragSource={connectDragSource} connectDropTarget={connectDropTarget} segment={segment} actualWidth={currentWidth} dataNo={activeElement} updateSegmentData={jest.fn()} connectDragPreview={jest.fn()} />, { initialState: { ui: { activeSegment: activeElement, unitSettings: { resolution: 1, clickIncrement: 1 } }, street: { segments: [segment] } } })
    fireEvent.mouseOver(getByTestId(wrapper.container, 'segment'))
    expect(infoBubble.considerShowing).toHaveBeenCalledTimes(1)
  })
  it('hides the info bubble on mouseleave', () => {
    const wrapper = renderWithRedux(<ConnectedSegment connectDragSource={connectDragSource} connectDropTarget={connectDropTarget} segment={segment} actualWidth={currentWidth} dataNo={activeElement} updateSegmentData={jest.fn()} connectDragPreview={jest.fn()} />, { initialState: { ui: { activeSegment: activeElement, unitSettings: { resolution: 1, clickIncrement: 1 } }, street: { segments: [segment] } } })
    fireEvent.mouseOver(getByTestId(wrapper.container, 'segment'))
    fireEvent.mouseLeave(getByTestId(wrapper.container, 'segment'))
    expect(infoBubble.dontConsiderShowing).toHaveBeenCalledTimes(1)
  })
  describe('keyboard events', () => {
    it('KEY.MINUS decreases the width of the segment', () => {
      const wrapper = renderWithRedux(<ConnectedSegment connectDragSource={connectDragSource} connectDropTarget={connectDropTarget} segment={segment} actualWidth={currentWidth} dataNo={activeElement} updateSegmentData={jest.fn()} connectDragPreview={jest.fn()} />, { initialState: { ui: { activeSegment: activeElement, unitSettings: { resolution: 1, clickIncrement: 1 } }, street: { segments: [segment] } } })
      fireEvent.mouseOver(getByTestId(wrapper.container, 'segment'))
      fireEvent.keyDown(document, { key: 'Minus', keyCode: KEYS.MINUS, code: KEYS.MINUS, charCode: KEYS.MINUS })
      expect(wrapper.store.getState().street.segments[activeElement].width).toEqual(currentWidth - increment)
    })
    it('KEY.EQUAL increases the width of the segment', () => {
      const wrapper = renderWithRedux(<ConnectedSegment connectDragSource={connectDragSource} connectDropTarget={connectDropTarget} segment={segment} actualWidth={currentWidth} dataNo={activeElement} updateSegmentData={jest.fn()} connectDragPreview={jest.fn()} />, { initialState: { ui: { activeSegment: activeElement, unitSettings: { resolution: 1, clickIncrement: 1 } }, street: { segments: [segment] } } })
      fireEvent.mouseOver(getByTestId(wrapper.container, 'segment'))
      fireEvent.keyDown(document, { key: 'Equal', keyCode: KEYS.EQUAL, code: KEYS.EQUAL, charCode: KEYS.EQUAL })
      expect(wrapper.store.getState().street.segments[activeElement].width).toEqual(currentWidth + increment)
    })
    it('removes segment when delete key is pressed', () => {
      const wrapper = renderWithRedux(<ConnectedSegment connectDragSource={connectDragSource} connectDropTarget={connectDropTarget} segment={segment} actualWidth={currentWidth} dataNo={activeElement} updateSegmentData={jest.fn()} connectDragPreview={jest.fn()} />, { initialState: { ui: { activeSegment: activeElement, unitSettings: { resolution: 1, clickIncrement: 1 } }, street: { segments: [segment] } } })
      setLastStreet() // ToDo: needs to be refactored
      fireEvent.mouseOver(getByTestId(wrapper.container, 'segment'))
      fireEvent.keyDown(document, { key: 'Delete', keyCode: KEYS.DELETE, code: KEYS.DELETE, charCode: KEYS.DELETE })
      expect(infoBubble.hide).toHaveBeenCalledTimes(1)
      expect(infoBubble.hideSegment).toHaveBeenCalledTimes(1)
      expect(wrapper.store.getState().street.segments.length).toEqual(0)
    })
    it('removes all segments when shift+delete keys are pressed', () => {
      const wrapper = renderWithRedux(<ConnectedSegment connectDragSource={connectDragSource} connectDropTarget={connectDropTarget} segment={segment} actualWidth={currentWidth} dataNo={activeElement} updateSegmentData={jest.fn()} connectDragPreview={jest.fn()} />, { initialState: { ui: { activeSegment: activeElement, unitSettings: { resolution: 1, clickIncrement: 1 } }, street: { segments: [segment] } } })
      setLastStreet() // ToDo: needs to be refactored
      fireEvent.mouseOver(getByTestId(wrapper.container, 'segment'))
      fireEvent.keyDown(document, { key: 'Delete', keyCode: KEYS.DELETE, code: KEYS.DELETE, charCode: KEYS.DELETE, shiftKey: true })
      expect(infoBubble.hide).toHaveBeenCalledTimes(2) // toDo: should this be 1?
      expect(infoBubble.hideSegment).toHaveBeenCalledTimes(1)
      expect(wrapper.store.getState().street.segments.length).toEqual(0)
    })
  })
  describe('warnings', () => {
    describe('too large', () => {
      it('KEY.EQUAL does not increase the width of the segment', () => {
        const wrapper = renderWithRedux(<ConnectedSegment connectDragSource={connectDragSource} connectDropTarget={connectDropTarget} segment={segment} actualWidth={400} dataNo={activeElement} updateSegmentData={jest.fn()} connectDragPreview={jest.fn()} />, { initialState: { ui: { activeSegment: activeElement, unitSettings: { resolution: 1, clickIncrement: 1 } }, street: { segments: [segment] } } })
        fireEvent.mouseOver(getByTestId(wrapper.container, 'segment'))
        fireEvent.keyDown(document, { key: 'Equal', keyCode: KEYS.EQUAL, code: KEYS.EQUAL, charCode: KEYS.EQUAL })
        expect(wrapper.store.getState().street.segments[activeElement].width).toEqual(400)
        expect(wrapper.store.getState().street.segments[activeElement].warnings).toEqual([undefined, false, false, true])
        expect(wrapper.asFragment()).toMatchSnapshot()
      })
    })
  })
})
