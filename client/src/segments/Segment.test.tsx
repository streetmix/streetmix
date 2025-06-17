import React from 'react'
import { vi } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { screen } from '@testing-library/dom'

import { render } from '~/test/helpers/render'
import { infoBubble } from '~/src/info_bubble/info_bubble'
import { setLastStreet } from '~/src/streets/data_model'
import { SETTINGS_UNITS_METRIC } from '~/src/users/constants'
import Segment from './Segment'
import type { SliceItem } from '@streetmix/types'

vi.mock('../info_bubble/info_bubble')

describe('Segment', () => {
  const increment = 0.05
  let variantString,
    type,
    activeElement: number,
    segment: SliceItem,
    initialState

  beforeEach(() => {
    variantString = 'inbound|regular'
    type = 'streetcar'
    activeElement = 0
    segment = {
      type,
      variantString,
      variant: {
        direction: 'inbound',
        'public-transit-asphalt': 'regular'
      },
      id: '1',
      width: 5,
      elevation: 0,
      warnings: []
    }
    initialState = {
      flags: {
        ANALYTICS: { value: true },
        COASTMIX_MODE: { value: false },
        DEBUG_SEGMENT_CANVAS_RECTANGLES: { value: false }
      },
      ui: { activeSegment: activeElement },
      street: { showAnalytics: true, segments: [segment] }
    }
  })

  it('renders correctly', () => {
    const { asFragment } = render(
      <Segment
        segment={segment}
        sliceIndex={activeElement}
        segmentLeft={0}
        units={SETTINGS_UNITS_METRIC}
      />,
      { initialState }
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('shows the info bubble on mouseover', async () => {
    const user = userEvent.setup()

    render(
      <Segment
        segment={segment}
        sliceIndex={activeElement}
        segmentLeft={0}
        units={SETTINGS_UNITS_METRIC}
      />,
      { initialState }
    )

    await user.hover(screen.getByTestId('segment'))

    expect(infoBubble.considerShowing).toHaveBeenCalled()
  })

  it('hides the info bubble on mouseleave', async () => {
    const user = userEvent.setup()

    render(
      <Segment
        segment={segment}
        sliceIndex={activeElement}
        segmentLeft={0}
        units={SETTINGS_UNITS_METRIC}
      />,
      { initialState }
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
          sliceIndex={activeElement}
          segmentLeft={0}
          units={SETTINGS_UNITS_METRIC}
        />,
        { initialState }
      )

      await user.hover(screen.getByTestId('segment'))
      await user.keyboard('-')

      expect(store.getState().street.segments[activeElement].width).toEqual(
        segment.width - increment
      )
    })

    it('increases the width of the segment when plus key is pressed', async () => {
      const user = userEvent.setup()
      const { store } = render(
        <Segment
          segment={segment}
          sliceIndex={activeElement}
          segmentLeft={0}
          units={SETTINGS_UNITS_METRIC}
        />,
        { initialState }
      )

      await user.hover(screen.getByTestId('segment'))
      await user.keyboard('+')

      expect(store.getState().street.segments[activeElement].width).toEqual(
        segment.width + increment
      )
    })

    it('removes segment when delete key is pressed', async () => {
      const user = userEvent.setup()
      const { store } = render(
        <Segment
          segment={segment}
          sliceIndex={activeElement}
          segmentLeft={0}
          units={SETTINGS_UNITS_METRIC}
        />,
        { initialState }
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
          sliceIndex={activeElement}
          segmentLeft={0}
          units={SETTINGS_UNITS_METRIC}
        />,
        { initialState }
      )

      await user.hover(screen.getByTestId('segment'))
      await user.keyboard('{Shift>}{Delete}{/Shift}')

      expect(store.getState().street.segments.length).toEqual(0)
    })
  })
})
