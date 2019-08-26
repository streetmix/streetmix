/* eslint-env jest */
import React from 'react'
import { fireEvent, cleanup } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import SegmentForPalette from '../SegmentForPalette'
import { getSegmentInfo } from '../info'
import { getVariantInfoDimensions } from '../view'

jest.mock('../../streets/data_model', () => {})
jest.mock('../info')
jest.mock('../view')

describe('SegmentForPalette', () => {
  beforeEach(() => {
    const dimensions = { left: 100, right: 200 }
    getVariantInfoDimensions.mockImplementation(() => dimensions)
  })

  afterEach(cleanup)

  it('renders width correctly depending on the dimension', () => {
    const wrapper = renderWithReduxAndIntl(
      <SegmentForPalette
        type={''}
        variantString={''}
        onPointerOver={jest.fn()}
        randSeed={42}
      />
    )

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  describe('mouseover', () => {
    it('handles pointer over event with segment name', () => {
      // Our mock handler function persists React's synthetic event so that we can
      // test that our handler has been called with the correct event argument
      const onPointerOver = jest.fn((event) => event.persist())

      const segmentName = 'foo'
      getSegmentInfo.mockImplementation(() => ({ name: segmentName, nameKey: 'key' }))

      const wrapper = renderWithReduxAndIntl(
        <SegmentForPalette
          type={''}
          variantString={''}
          onPointerOver={onPointerOver}
          randSeed={42}
        />
      )

      fireEvent.pointerOver(wrapper.getByTestId('segment-for-palette'))

      expect(onPointerOver).toHaveBeenCalledTimes(1)
      expect(onPointerOver).toHaveBeenCalledWith(
        // This is a full event object but we only care about the `target` property
        expect.objectContaining({
          target: expect.anything()
        }),
        segmentName,
        expect.objectContaining({
          top: expect.any(Number),
          bottom: expect.any(Number),
          left: expect.any(Number),
          right: expect.any(Number),
          width: expect.any(Number),
          height: expect.any(Number)
        })
      )
    })
  })
})
