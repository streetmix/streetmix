/* eslint-env jest */
import React from 'react'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRedux } from '../../../../test/helpers/render'
import StreetEditable from '../StreetEditable'
import {
  getSpriteDef,
  getSegmentInfo,
  getSegmentVariantInfo
} from '../../segments/info'
import SEGMENT_INFO from '../../segments/info.json'

jest.mock('../../app/load_resources')
jest.mock('../../segments/info')
jest.mock('../../streets/data_model', () => {
  const actual = jest.requireActual('../../streets/data_model')
  return {
    ...actual,
    saveStreetToServerIfNecessary: jest.fn()
  }
})

describe('StreetEditable', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  const setBuildingWidth = jest.fn()
  const updatePerspective = () => {}
  const type = 'streetcar'
  const variantString = 'inbound|regular'
  const segment = { variantString, id: '1', width: 400, type }

  beforeEach(() => {
    const variant = SEGMENT_INFO[type].details[variantString]
    const segmentInfo = { name: 'Segment', nameKey: 'key', zIndex: 1 }
    getSegmentInfo.mockImplementation(() => segmentInfo)
    getSegmentVariantInfo.mockImplementation(() => variant)
    getSpriteDef.mockImplementation(() => ({
      id: 'markings--straight-inbound',
      width: 4,
      offsetY: 11.12
    }))
  })

  it('calls setBuildingsWidth', () => {
    const street = {
      segments: [segment],
      width: 100
    }
    renderWithRedux(
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
        const street = { width: 400, segments: [segment] }
        const {
          getByTestId,
          store,
          container,
          asFragment
        } = renderWithRedux(
          <StreetEditable
            setBuildingWidth={setBuildingWidth}
            updatePerspective={updatePerspective}
          />,
          { initialState: { street } }
        )
        userEvent.hover(getByTestId('segment'))
        userEvent.type(container, '+')
        await waitFor(
          () => {
            expect(store.getState().street.segments[0].width).toEqual(400)
            expect(store.getState().street.segments[0].warnings).toEqual([
              undefined,
              false,
              false,
              true
            ])
            expect(asFragment()).toMatchSnapshot()
          },
          { container }
        )
      })
    })
  })
})
