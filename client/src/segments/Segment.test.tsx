import { vi } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { screen } from '@testing-library/dom'

import { render } from '~/test/helpers/render.js'
import { setLastStreet, trimStreetData } from '~/src/streets/data_model.js'
import { SETTINGS_UNITS_METRIC } from '~/src/users/constants.js'
import { Segment } from './Segment.js'

import type { SliceItem } from '@streetmix/types'

vi.mock('../info_bubble/info_bubble.js')

describe('Segment', () => {
  const increment = 0.1
  let variantString,
    type,
    activeElement: number,
    segment: SliceItem,
    initialState: Record<string, unknown>

  beforeEach(() => {
    variantString = 'inbound|regular'
    type = 'streetcar'
    activeElement = 0
    segment = {
      type,
      variantString,
      variant: {
        direction: 'inbound',
        'public-transit-asphalt': 'regular',
      },
      id: 'slice-id',
      width: 5,
      elevation: 0,
      slope: {
        on: false,
        values: [],
      },
    }
    initialState = {
      flags: {
        ANALYTICS: { value: true },
        COASTMIX_MODE: { value: false },
        DEBUG_SEGMENT_CANVAS_RECTANGLES: { value: false },
        DEBUG_SLICE_SLOPE: { value: false },
        UNIVERSAL_ELEVATION_CONTROLS: { value: false },
      },
      ui: { activeSegment: activeElement },
      street: {
        id: 'street-id',
        showAnalytics: true,
        boundary: {
          left: { variant: 'wide', elevation: 0 },
          right: { variant: 'wide', elevation: 0 },
        },
        segments: [segment],
        width: 5,
      },
      warnings: {
        slices: {
          'slice-id': {},
        },
      },
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

  it('saves a segment note through the info bubble', async () => {
    const user = userEvent.setup()
    const { store } = render(
      <>
        <div id="street-section-popup-boundary" />
        <Segment
          segment={segment}
          sliceIndex={0}
          segmentLeft={0}
          units={SETTINGS_UNITS_METRIC}
        />
      </>,
      { initialState }
    )

    await user.click(screen.getByRole('button', { name: /Streetcar/ }))
    await user.click(await screen.findByRole('button', { name: 'Add note' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Segment note' }),
      'Leave room for trees'
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    await user.unhover(screen.getByRole('textbox', { name: 'Segment note' }))
    expect(screen.getByRole('textbox', { name: 'Segment note' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(trimStreetData(store.getState().street).segments?.[0].note).toBe(
      'Leave room for trees'
    )
    expect(screen.getByText('Leave room for trees')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Edit note' }))
    await user.clear(screen.getByRole('textbox', { name: 'Segment note' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Segment note' }),
      'Discard this draft'
    )
    await user.click(document.body)
    expect(screen.getByRole('textbox', { name: 'Segment note' })).toHaveValue(
      'Discard this draft'
    )
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('Leave room for trees')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Edit note' }))
    await user.clear(screen.getByRole('textbox', { name: 'Segment note' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(
      trimStreetData(store.getState().street).segments?.[0].note
    ).toBeUndefined()
    await user.click(screen.getByRole('button', { name: 'Add note' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Segment note' }),
      'Delete this note'
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await user.click(screen.getByRole('button', { name: 'Delete note' }))
    expect(
      trimStreetData(store.getState().street).segments?.[0].note
    ).toBeUndefined()
    expect(screen.queryByText('Delete this note')).toBeNull()
    expect(screen.getByRole('button', { name: 'Add note' })).toBeVisible()
  })

  it('shows the segment note without editing controls on a view-only street', async () => {
    const user = userEvent.setup()
    segment.note = 'Leave room for trees'
    render(
      <>
        <div id="street-section-popup-boundary" />
        <Segment
          segment={segment}
          sliceIndex={0}
          segmentLeft={0}
          units={SETTINGS_UNITS_METRIC}
        />
      </>,
      { initialState: { ...initialState, app: { readOnly: true } } }
    )

    await user.click(screen.getByRole('button', { name: /Streetcar/ }))

    expect(await screen.findByText('Leave room for trees')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Edit note' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Delete note' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Increase width' })).toBeNull()
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
