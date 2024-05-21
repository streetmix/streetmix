import React from 'react'
import { vi } from 'vitest'

import { render } from '~/test/helpers/render'
import { getVariantInfoDimensions } from '~/src/segments/view'
import PaletteItem from './PaletteItem'

vi.mock('../segments/view')

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
