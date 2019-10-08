/* eslint-env jest */
import React from 'react'
import { fireEvent, cleanup } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import SegmentForPalette from '../SegmentForPalette'
import { getSegmentInfo } from '../info'
import { getVariantInfoDimensions } from '../view'

jest.mock('../info')
jest.mock('../view')

describe('SegmentForPalette', () => {
  afterEach(cleanup)

  it('renders width correctly depending on the dimension', () => {
    const dimensions = { left: 100, right: 200 }
    getVariantInfoDimensions.mockImplementation(() => dimensions)

    const wrapper = renderWithReduxAndIntl(
      <SegmentForPalette
        type=""
        variantString=""
        onPointerOver={jest.fn()}
        randSeed={42}
      />
    )

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  describe('mouseover', () => {
    it('handles pointer over event with segment name', () => {
      const onPointerOver = jest.fn()
      const segmentInfo = ({ name: 'foo', nameKey: 'key' })
      getSegmentInfo.mockImplementation(() => segmentInfo)

      const wrapper = renderWithReduxAndIntl(
        <SegmentForPalette
          type=""
          variantString=""
          onPointerOver={onPointerOver}
          randSeed={42}
        />
      )

      fireEvent.pointerOver(wrapper.getByTestId('segment-for-palette'))

      expect(onPointerOver).toHaveBeenCalledTimes(1)
    })
  })
})
