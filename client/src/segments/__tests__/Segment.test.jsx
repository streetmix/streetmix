import React from 'react'
import { vi } from 'vitest'
import { userEvent } from '@testing-library/user-event'

import { render, screen, act } from '~/test/helpers/render'
import { infoBubble } from '~/src/info_bubble/info_bubble'
import { setLastStreet } from '~/src/streets/data_model'
import { SETTINGS_UNITS_METRIC } from '~/src/users/constants'
import Segment from '../Segment'

// Replace all increment resolution with a simple value of 1
const __TEST_RESIZE_INCREMENT = 1

vi.mock('../resizing', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    // Note: __TEST_RESIZE_INCREMENT cannot be used here because vitest will
    // hoist this function to before it is declared, so just hard-code 1
    resolutionForResizeType: vi.fn(() => 1)
  }
})
vi.mock('../../info_bubble/info_bubble')

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
        updateSegmentData={vi.fn()}
        connectDragPreview={vi.fn()}
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
        updateSegmentData={vi.fn()}
        connectDragPreview={vi.fn()}
      />,
      {
        initialState: {
          ui: { activeSegment: activeElement },
          street: { segments: [segment] }
        }
      }
    )

    await act(async () => {
      await user.hover(screen.getByTestId('segment'))
    })

    expect(infoBubble.considerShowing).toHaveBeenCalled()
  })

  it('hides the info bubble on mouseleave', async () => {
    const user = userEvent.setup()

    render(
      <Segment
        segment={segment}
        actualWidth={currentWidth}
        dataNo={activeElement}
        updateSegmentData={vi.fn()}
        connectDragPreview={vi.fn()}
      />,
      {
        initialState: {
          ui: { activeSegment: activeElement },
          street: { segments: [segment] }
        }
      }
    )

    await act(async () => {
      await user.hover(screen.getByTestId('segment'))
      await user.unhover(screen.getByTestId('segment'))
    })

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
          updateSegmentData={vi.fn()}
          connectDragPreview={vi.fn()}
        />,
        {
          initialState: {
            ui: { activeSegment: activeElement },
            street: { segments: [segment] }
          }
        }
      )

      await act(async () => {
        await user.hover(screen.getByTestId('segment'))
        await user.keyboard('-')
      })

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
          updateSegmentData={vi.fn()}
          connectDragPreview={vi.fn()}
        />,
        {
          initialState: {
            ui: { activeSegment: activeElement },
            street: { segments: [segment] }
          }
        }
      )

      await act(async () => {
        await user.hover(screen.getByTestId('segment'))
        await user.keyboard('+')
      })

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
          updateSegmentData={vi.fn()}
          connectDragPreview={vi.fn()}
        />,
        {
          initialState: {
            ui: { activeSegment: activeElement },
            street: { segments: [segment] }
          }
        }
      )

      setLastStreet() // ToDo: needs to be refactored

      await act(async () => {
        await user.hover(screen.getByTestId('segment'))
        await user.keyboard('{Delete}')
      })

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
          updateSegmentData={vi.fn()}
          connectDragPreview={vi.fn()}
        />,
        {
          initialState: {
            ui: { activeSegment: activeElement },
            street: { segments: [segment] }
          }
        }
      )

      await act(async () => {
        await user.hover(screen.getByTestId('segment'))
        await user.keyboard('{Shift>}{Delete}{/Shift}')
      })

      expect(store.getState().street.segments.length).toEqual(0)
    })
  })
})
