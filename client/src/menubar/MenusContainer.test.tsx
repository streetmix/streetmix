import { render } from '~/test/helpers/render.js'
import { MenusContainer } from './MenusContainer.js'

describe('MenusContainer', () => {
  // Menu container should be empty at mount
  // It will only render a menu when one is active
  it('renders', () => {
    const { asFragment } = render(<MenusContainer />)
    expect(asFragment()).toMatchSnapshot()
  })
})
