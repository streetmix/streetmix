import { render } from '~/test/helpers/render.js'
import { InstanceBadge } from './InstanceBadge.js'

{
  /* eslint-disable formatjs/no-literal-string-in-jsx */
}

describe('InstanceBadge', () => {
  it('renders nothing in standard conditions', () => {
    const { container } = render(<InstanceBadge />)
    expect(container.firstChild).toBe(null)
  })

  it('renders a specific label if given', () => {
    const { asFragment } = render(<InstanceBadge label="foo" />)
    expect(asFragment()).toMatchSnapshot()
  })
})
