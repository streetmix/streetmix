/* eslint-env jest */
import React from 'react'
import { render } from '../../../../test/helpers/render'
import SegmentForPalette from '../SegmentForPalette'
import { getVariantInfoDimensions } from '../view'

jest.mock('../view')

describe('SegmentForPalette', () => {
  it('renders width correctly depending on the dimension', () => {
    const dimensions = { left: 100, right: 200 }
    getVariantInfoDimensions.mockImplementation(() => dimensions)

    const segment = {
      id: 'streetcar',
      name: 'Streetcar',
      nameKey: 'streetcar'
    }
    const { asFragment } = render(
      <SegmentForPalette segment={segment} randSeed={42} />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
