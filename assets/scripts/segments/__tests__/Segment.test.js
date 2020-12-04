/* eslint-env jest */
import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRedux } from '../../../../test/helpers/render'
import Segment from '../Segment'
import { getSpriteDef, getSegmentInfo, getSegmentVariantInfo } from '../info'
import SEGMENT_INFO from '../info.json'
import { infoBubble } from '../../info_bubble/info_bubble'
import { setLastStreet } from '../../streets/data_model'

// Replace all increment resolution with a simple value of 1
const __TEST_RESIZE_INCREMENT = 1

jest.mock('../info')
jest.mock('../view', () => {
  const actual = jest.requireActual('../view')
  return {
    ...actual,
    getVariantInfoDimensions: jest.fn(() => ({
      left: 0,
      right: 100,
      center: 50
    }))
  }
})
jest.mock('../resizing', () => {
  const actual = jest.requireActual('../resizing')
  return {
    ...actual,
    // Note: __TEST_RESIZE_INCREMENT cannot be used here because jest wants to
    // hoist this function to before it is declared, so just hard-code 1
    resolutionForResizeType: jest.fn(() => 1)
  }
})
jest.mock('../../app/load_resources')
jest.mock('../../app/routing', () => {})
jest.mock('../../info_bubble/info_bubble')

// ToDo: Remove this once refactoring of redux action saveStreetToServerIfNecessary is complete
jest.mock('../../streets/data_model', () => {
  const actual = jest.requireActual('../../streets/data_model')
  return {
    ...actual,
    saveStreetToServerIfNecessary: jest.fn()
  }
})

describe('Segment', () => {
  let variantString,
    type,
    variant,
    currentWidth,
    increment,
    activeElement,
    segment

  beforeEach(() => {
    variantString = 'inbound|regular'
    type = 'streetcar'
    variant = SEGMENT_INFO[type].details[variantString]
    currentWidth = 200
    increment = __TEST_RESIZE_INCREMENT
    activeElement = 0
    segment = {
      type,
      variantString,
      segmentType: type,
      id: '1',
      width: currentWidth,
      randSeed: 1
    }
    const segmentInfo = { name: 'Segment', nameKey: 'key', zIndex: 1 }
    getSegmentInfo.mockImplementation(() => segmentInfo)
    getSegmentVariantInfo.mockImplementation(() => variant)
    getSpriteDef.mockImplementation(() => ({
      id: 'markings--straight-inbound',
      width: 4,
      offsetY: 11.12
    }))
  })

  it('renders correctly', () => {
    const { asFragment } = renderWithRedux(
      <Segment
        segment={segment}
        actualWidth={currentWidth}
        dataNo={activeElement}
        updateSegmentData={jest.fn()}
        connectDragPreview={jest.fn()}
      />,
      {
        initialState: {
          ui: { activeSegment: activeElement },
          street: { segments: [segment] }
        }
      }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('shows the info bubble on mouseover', () => {
    renderWithRedux(
      <Segment
        segment={segment}
        actualWidth={currentWidth}
        dataNo={activeElement}
        updateSegmentData={jest.fn()}
        connectDragPreview={jest.fn()}
      />,
      {
        initialState: {
          ui: { activeSegment: activeElement },
          street: { segments: [segment] }
        }
      }
    )
    userEvent.hover(screen.getByTestId('segment'))
    expect(infoBubble.considerShowing).toHaveBeenCalledTimes(1)
  })

  it('hides the info bubble on mouseleave', () => {
    renderWithRedux(
      <Segment
        segment={segment}
        actualWidth={currentWidth}
        dataNo={activeElement}
        updateSegmentData={jest.fn()}
        connectDragPreview={jest.fn()}
      />,
      {
        initialState: {
          ui: { activeSegment: activeElement },
          street: { segments: [segment] }
        }
      }
    )
    userEvent.hover(screen.getByTestId('segment'))
    userEvent.unhover(screen.getByTestId('segment'))
    expect(infoBubble.dontConsiderShowing).toHaveBeenCalledTimes(1)
  })

  describe('keyboard events', () => {
    it('decreases the width of the segment when minus key is pressed', () => {
      const { store } = renderWithRedux(
        <Segment
          segment={segment}
          actualWidth={currentWidth}
          dataNo={activeElement}
          updateSegmentData={jest.fn()}
          connectDragPreview={jest.fn()}
        />,
        {
          initialState: {
            ui: { activeSegment: activeElement },
            street: { segments: [segment] }
          }
        }
      )
      userEvent.hover(screen.getByTestId('segment'))
      userEvent.type(document.body, '-')
      expect(store.getState().street.segments[activeElement].width).toEqual(
        currentWidth - increment
      )
    })

    it('increases the width of the segment when plus key is pressed', () => {
      const { store } = renderWithRedux(
        <Segment
          segment={segment}
          actualWidth={currentWidth}
          dataNo={activeElement}
          updateSegmentData={jest.fn()}
          connectDragPreview={jest.fn()}
        />,
        {
          initialState: {
            ui: { activeSegment: activeElement },
            street: { segments: [segment] }
          }
        }
      )
      userEvent.hover(screen.getByTestId('segment'))
      userEvent.type(document.body, '+')
      expect(store.getState().street.segments[activeElement].width).toEqual(
        currentWidth + increment
      )
    })

    it('removes segment when delete key is pressed', () => {
      const { store } = renderWithRedux(
        <Segment
          segment={segment}
          actualWidth={currentWidth}
          dataNo={activeElement}
          updateSegmentData={jest.fn()}
          connectDragPreview={jest.fn()}
        />,
        {
          initialState: {
            ui: { activeSegment: activeElement },
            street: { segments: [segment] }
          }
        }
      )
      setLastStreet() // ToDo: needs to be refactored
      userEvent.hover(screen.getByTestId('segment'))
      // cannot port this to userEvent yet, see: https://github.com/testing-library/user-event/issues/506
      fireEvent.keyDown(document, { key: 'Delete' })
      expect(infoBubble.hide).toHaveBeenCalledTimes(1)
      expect(infoBubble.hideSegment).toHaveBeenCalledTimes(1)
      expect(store.getState().street.segments.length).toEqual(0)
    })

    it('removes all segments when shift+delete keys are pressed', () => {
      const { store } = renderWithRedux(
        <Segment
          segment={segment}
          actualWidth={currentWidth}
          dataNo={activeElement}
          updateSegmentData={jest.fn()}
          connectDragPreview={jest.fn()}
        />,
        {
          initialState: {
            ui: { activeSegment: activeElement },
            street: { segments: [segment] }
          }
        }
      )
      setLastStreet() // ToDo: needs to be refactored
      userEvent.hover(screen.getByTestId('segment'))
      // cannot port this to userEvent yet, see: https://github.com/testing-library/user-event/issues/506
      fireEvent.keyDown(document, { key: 'Delete', shiftKey: true })
      expect(infoBubble.hide).toHaveBeenCalledTimes(2) // toDo: should this be 1?
      expect(infoBubble.hideSegment).toHaveBeenCalledTimes(1)
      expect(store.getState().street.segments.length).toEqual(0)
    })
  })
})
