/* eslint-env jest */
import React from 'react'
import { render } from '../../../test/helpers/render'
import { getVariantInfoDimensions } from '../segments/view'
import PaletteItem from './PaletteItem'

jest.mock('../segments/view')

describe('PaletteItem', () => {
  it('renders width correctly depending on the dimension', () => {
    const dimensions = { left: 100, right: 200 }
    getVariantInfoDimensions.mockImplementation(() => dimensions)

    const segment = {
      id: 'streetcar',
      name: 'Streetcar',
      nameKey: 'streetcar'
    }
    const { asFragment } = render(
      <PaletteItem segment={segment} randSeed={42} />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
