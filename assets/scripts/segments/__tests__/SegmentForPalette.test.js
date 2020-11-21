/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import SegmentForPalette from '../SegmentForPalette'
import { getVariantInfoDimensions } from '../view'

jest.mock('../view')

describe('SegmentForPalette', () => {
  it('renders width correctly depending on the dimension', () => {
    const dimensions = { left: 100, right: 200 }
    getVariantInfoDimensions.mockImplementation(() => dimensions)

    const { asFragment } = renderWithReduxAndIntl(
      <SegmentForPalette type="" variantString="" randSeed={42} />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
