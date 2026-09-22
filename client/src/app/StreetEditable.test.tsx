import { createRef } from 'react'
import { vi } from 'vitest'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render.js'
import { createStreetState } from '~/test/factories/street.js'
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
    id: 'slice-id',
    width: 400,
    type,
    slope: { on: false, values: [] },
  }

  describe('segment warnings', () => {
    describe('too large', () => {
      it('Pressing `+` does not increase the width of the segment', async () => {
        const initialState = {
          flags: {
            ANALYTICS: { value: true },
            COASTMIX_MODE: { value: false },
            DEBUG_SEGMENT_CANVAS_RECTANGLES: { value: false },
            DEBUG_SLICE_SLOPE: { value: false },
          },
          street: createStreetState({
            boundary: {
              left: { variant: 'wide', elevation: 0 },
              right: { variant: 'wide', elevation: 0 },
            },
            segments: [segment],
            width: 120,
            remainingWidth: 120,
          }),
          warnings: {
            slices: {
              'slice-id': {},
            },
          },
        }

        const { getByTestId, store, container, asFragment } = render(
          <StreetEditable
            setBoundaryWidth={setBoundaryWidth}
            updatePerspective={updatePerspective}
            resizeType={undefined}
            ref={createRef()}
          />,
          { initialState }
        )

        await userEvent.hover(getByTestId('segment'))
        await userEvent.type(container, '+')

        const state = store.getState()
        expect(state.street.segments[0].width).toEqual(120)
        expect(state.warnings.slices['slice-id']).toEqual({
          tooWide: true,
        })
        expect(asFragment()).toMatchSnapshot()
      })
    })
  })
})
