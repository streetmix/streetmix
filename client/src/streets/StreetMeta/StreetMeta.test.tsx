import { waitFor } from '@testing-library/react'

import { render } from '~/test/helpers/render'
import { StreetMeta } from './StreetMeta'

describe('StreetMeta', () => {
  it('renders without crashing', async () => {
    const { asFragment } = render(<StreetMeta />)

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
