/* eslint-env jest */
import React from 'react'
import { userEvent } from '@testing-library/user-event'
import { render, screen } from '../../../../test/helpers/render'
import Segment from '../Segment'
import { infoBubble } from '../../info_bubble/info_bubble'
import { setLastStreet } from '../../streets/data_model'
import { SETTINGS_UNITS_METRIC } from '../../users/constants'

// Replace all increment resolution with a simple value of 1
const __TEST_RESIZE_INCREMENT = 1

jest.mock('../resizing', () => {
  const actual = jest.requireActual('../resizing')
  return {
    ...actual,
    // Note: __TEST_RESIZE_INCREMENT cannot be used here because jest wants to
    // hoist this function to before it is declared, so just hard-code 1
    resolutionForResizeType: jest.fn(() => 1)
  }
})
jest.mock('../../info_bubble/info_bubble')

describe('Segment', () => {
  let variantString, type, currentWidth, increment, activeElement, segment

  beforeEach(() => {
    variantString = 'inbound|regular'
    type = 'streetcar'
    currentWidth = 5
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
  })

  it('renders correctly', () => {
    const { asFragment } = render(
      <Segment
        segment={segment}
        actualWidth={currentWidth}
        units={SETTINGS_UNITS_METRIC}
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

  it('shows the info bubble on mouseover', async () => {
    const user = userEvent.setup()

    render(
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

    await user.hover(screen.getByTestId('segment'))

    expect(infoBubble.considerShowing).toHaveBeenCalled()
  })

  it('hides the info bubble on mouseleave', async () => {
    const user = userEvent.setup()

    render(
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

    await user.hover(screen.getByTestId('segment'))
    await user.unhover(screen.getByTestId('segment'))

    expect(infoBubble.dontConsiderShowing).toHaveBeenCalledTimes(1)
  })

  describe('keyboard events', () => {
    it('decreases the width of the segment when minus key is pressed', async () => {
      const user = userEvent.setup()
      const { store } = render(
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

      await user.hover(screen.getByTestId('segment'))
      await user.keyboard('-')

      expect(store.getState().street.segments[activeElement].width).toEqual(
        currentWidth - increment
      )
    })

    it('increases the width of the segment when plus key is pressed', async () => {
      const user = userEvent.setup()
      const { store } = render(
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

      await user.hover(screen.getByTestId('segment'))
      await user.keyboard('+')

      expect(store.getState().street.segments[activeElement].width).toEqual(
        currentWidth + increment
      )
    })

    it('removes segment when delete key is pressed', async () => {
      const user = userEvent.setup()
      const { store } = render(
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

      await user.hover(screen.getByTestId('segment'))
      await user.keyboard('{Delete}')

      expect(infoBubble.hide).toHaveBeenCalledTimes(1)
      expect(infoBubble.hideSegment).toHaveBeenCalledTimes(1)
      expect(store.getState().street.segments.length).toEqual(0)
    })

    it('removes all segments when shift+delete keys are pressed', async () => {
      const user = userEvent.setup()
      const { store } = render(
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

      await user.hover(screen.getByTestId('segment'))
      await user.keyboard('{Shift>}{Delete}{/Shift}')

      expect(infoBubble.hide).toHaveBeenCalledTimes(2) // toDo: should this be 1?
      expect(infoBubble.hideSegment).toHaveBeenCalledTimes(1)
      expect(store.getState().street.segments.length).toEqual(0)
    })
  })
})
