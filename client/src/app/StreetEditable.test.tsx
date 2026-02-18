import { vi } from 'vitest'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render.js'
import { SETTINGS_UNITS_METRIC } from '../users/constants.js'
import { StreetEditable } from './StreetEditable.js'

describe('StreetEditable', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  const setBoundaryWidth = vi.fn()
  const updatePerspective = (): void => {}
  const type = 'streetcar'
  const variantString = 'inbound|regular'
  const segment = {
    variantString,
    id: '1',
    width: 400,
    type,
    slope: { on: false, values: [] },
    warnings: [],
  }

  describe('segment warnings', () => {
    describe('too large', () => {
      it('Pressing `+` does not increase the width of the segment', async () => {
        const street = {
          boundary: {
            left: {
              id: '',
              variant: '',
              floors: 0,
              elevation: 0,
            },
            right: {
              id: '',
              variant: '',
              floors: 0,
              elevation: 0,
            },
          },
          segments: [segment],
          width: 120,
          units: SETTINGS_UNITS_METRIC,
          showAnalytics: true,
        }

        const { getByTestId, store, container, asFragment } = render(
          <StreetEditable
            setBoundaryWidth={setBoundaryWidth}
            updatePerspective={updatePerspective}
            resizeType={undefined}
          />,
          {
            initialState: {
              flags: {
                ANALYTICS: { value: true },
                COASTMIX_MODE: { value: false },
                DEBUG_SEGMENT_CANVAS_RECTANGLES: { value: false },
                DEBUG_SLICE_SLOPE: { value: false },
              },
              street,
            },
          }
        )

        await userEvent.hover(getByTestId('segment'))
        await userEvent.type(container, '+')

        expect(store.getState().street.segments[0].width).toEqual(120)
        expect(store.getState().street.segments[0].warnings).toEqual([
          false,
          false,
          false,
          true,
          false,
          false,
          false,
        ])
        expect(asFragment()).toMatchSnapshot()
      })
    })
  })
})
