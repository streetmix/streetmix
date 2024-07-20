import React from 'react'
import { vi } from 'vitest'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import { SETTINGS_UNITS_METRIC } from '../users/constants'
import StreetEditable from './StreetEditable'

describe('StreetEditable', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  const setBuildingWidth = vi.fn()
  const updatePerspective = () => {}
  const type = 'streetcar'
  const variantString = 'inbound|regular'
  const segment = { variantString, id: '1', width: 400, type }

  it('calls setBuildingsWidth', () => {
    const street = {
      segments: [segment],
      width: 100,
      units: SETTINGS_UNITS_METRIC
    }

    render(
      <StreetEditable
        setBuildingWidth={setBuildingWidth}
        updatePerspective={updatePerspective}
      />,
      { street }
    )

    expect(setBuildingWidth).toHaveBeenCalledTimes(1)
  })

  describe('segment warnings', () => {
    describe('too large', () => {
      it('Pressing `+` does not increase the width of the segment', async () => {
        const street = {
          segments: [segment],
          width: 120,
          units: SETTINGS_UNITS_METRIC
        }

        const { getByTestId, store, container, asFragment } = render(
          <StreetEditable
            setBuildingWidth={setBuildingWidth}
            updatePerspective={updatePerspective}
          />,
          { initialState: { street } }
        )

        await userEvent.hover(getByTestId('segment'))
        await userEvent.type(container, '+')

        expect(store.getState().street.segments[0].width).toEqual(120)
        expect(store.getState().street.segments[0].warnings).toEqual([
          undefined,
          false,
          false,
          true,
          false
        ])
        expect(asFragment()).toMatchSnapshot()
      })
    })
  })
})
