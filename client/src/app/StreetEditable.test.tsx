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
    id: '1',
    width: 400,
    type,
    slope: { on: false, values: [] },
    warnings: [],
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
            segments: [segment],
            width: 120,
            remainingWidth: 120,
          }),
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
